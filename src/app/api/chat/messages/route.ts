import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildRagContext, generateSmartRagResponse } from '@/lib/ragKnowledge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const geminiApiKey = process.env.GEMINI_API_KEY || '';
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// GET: Fetch message history for a session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Thiếu sessionId' }, { status: 400 });
    }

    // 1. Fetch session metadata
    const { data: sessionData } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    // 2. Fetch messages
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const mappedMessages = (messages || []).map((m: any) => ({
      id: m.id,
      sessionId: m.session_id,
      sender: m.sender,
      content: m.content,
      recommendedProducts: m.recommended_products || [],
      createdAt: m.created_at,
    }));

    return NextResponse.json({
      success: true,
      session: sessionData
        ? {
            id: sessionData.id,
            customerName: sessionData.customer_name,
            customerEmail: sessionData.customer_email,
            isBotActive: sessionData.is_bot_active,
            lastMessage: sessionData.last_message,
            status: sessionData.status,
          }
        : null,
      messages: mappedMessages,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Send message & process AI RAG if bot is active
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      sender = 'user',
      content,
      customerName = 'Khách hàng',
      customerEmail = null,
    } = body;

    if (!sessionId || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ thông tin tin nhắn.' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();

    // 1. Upsert session record
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    let isBotActive = true;

    if (!existingSession) {
      await supabase.from('chat_sessions').insert({
        id: sessionId,
        customer_name: customerName,
        customer_email: customerEmail,
        is_bot_active: true,
        last_message: trimmedContent,
        last_message_at: new Date().toISOString(),
        status: 'active',
      });
    } else {
      isBotActive = existingSession.is_bot_active;
      await supabase
        .from('chat_sessions')
        .update({
          customer_name: customerName || existingSession.customer_name,
          customer_email: customerEmail || existingSession.customer_email,
          last_message: trimmedContent,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', sessionId);
    }

    // 2. Insert the sender's message
    const { data: insertedMsg, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender,
        content: trimmedContent,
        recommended_products: [],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json({ success: false, error: 'Không thể lưu tin nhắn.' }, { status: 500 });
    }

    const userMessage = {
      id: insertedMsg.id,
      sessionId: insertedMsg.session_id,
      sender: insertedMsg.sender,
      content: insertedMsg.content,
      recommendedProducts: [],
      createdAt: insertedMsg.created_at,
    };

    // If sender is ADMIN, just return without bot reply
    if (sender === 'admin') {
      return NextResponse.json({
        success: true,
        userMessage,
        botMessage: null,
      });
    }

    // If sender is USER: Check if Bot AI is active
    if (!isBotActive) {
      // Bot is disabled by admin for this session -> No automatic AI reply
      return NextResponse.json({
        success: true,
        userMessage,
        botMessage: null,
        isBotActive: false,
      });
    }

    // 3. Process RAG Knowledge Context & Generate AI Answer
    const ragContext = await buildRagContext(trimmedContent);
    let botReplyText = '';

    // Dynamically retrieve configured API Key from DB or env
    let activeApiKey = process.env.GEMINI_API_KEY || '';
    let activeModelName = 'gemini-2.5-flash';

    try {
      const { data: aiConfig } = await supabase
        .from('chat_ai_config')
        .select('gemini_api_key, model_name')
        .eq('id', 'global')
        .single();

      if (aiConfig?.gemini_api_key) {
        activeApiKey = aiConfig.gemini_api_key;
      }
      if (aiConfig?.model_name) {
        activeModelName = aiConfig.model_name;
      }
    } catch (configErr) {
      console.warn('Failed to load chat_ai_config from DB:', configErr);
    }

    if (activeApiKey) {
      try {
        const clientAI = new GoogleGenerativeAI(activeApiKey);
        const candidateModels = [
          activeModelName,
          'gemini-1.5-flash',
          'gemini-1.5-flash-latest',
          'gemini-2.0-flash-exp',
          'gemini-2.0-flash',
          'gemini-1.5-pro',
        ];

        // AGENT 1: Facts Synthesis
        let factsSummary = '';
        if (ragContext.orderStatusFound) {
          factsSummary = `Thông tin đơn hàng: ${ragContext.orderStatusFound}`;
        } else if (ragContext.matchedProducts.length > 0) {
          const mainP = ragContext.matchedProducts[0];
          factsSummary = `Có sản phẩm: "${mainP.name}", giá bán: ${mainP.price.toLocaleString('vi-VN')}đ, còn ${mainP.stockCount} món.`;
        } else {
          factsSummary = `Cửa hàng không có sản phẩm này.`;
        }

        // AGENT 2: Few-Shot Natural Chat Session
        let rawGenerated = '';
        for (const mName of candidateModels) {
          try {
            const model = clientAI.getGenerativeModel({
              model: mName,
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 100,
              },
            });

            const chat = model.startChat({
              history: [
                {
                  role: 'user',
                  parts: [{ text: 'Thông tin: Có sản phẩm Bàn trà mây tre, giá 1.200.000đ.\nKhách hỏi: Shop có bán bàn trà không?' }],
                },
                {
                  role: 'model',
                  parts: [{ text: 'Dạ Mini Shop có bán Bàn trà mây tre với giá 1.200.000đ, bạn tham khảo chi tiết ở bên dưới nhé!' }],
                },
                {
                  role: 'user',
                  parts: [{ text: 'Thông tin: Cửa hàng không có sản phẩm này.\nKhách hỏi: Bên mình có bán máy giặt không?' }],
                },
                {
                  role: 'model',
                  parts: [{ text: 'Dạ hiện tại Mini Shop chưa có sản phẩm này, bạn tham khảo các sản phẩm nội thất khác của shop nhé!' }],
                },
              ],
            });

            const chatResponse = await chat.sendMessage(
              `Thông tin: ${factsSummary}\nKhách hỏi: ${trimmedContent}`
            );
            const resText = chatResponse.response.text();
            if (resText && resText.trim()) {
              rawGenerated = resText.trim();
              break;
            }
          } catch (mErr) {
            // try next model
          }
        }

        // AGENT 3: Quality Validator & Sanitizer
        if (rawGenerated) {
          let clean = rawGenerated
            .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
            .replace(/[*_`#]/g, '')
            .replace(/^["“'«]|["”'»]$/g, '')
            .trim();

          // Reject if output contains any English reasoning/meta words
          const isEnglishOrMeta =
            /\b(customer|store|info|role|goal|task|data|typo|exists|price|units|the|is|for|to|answer|assistant|scanning|found|draft|choice|constraint)\b/i.test(clean) ||
            clean.includes('p1787') ||
            clean.includes('|') ||
            clean.includes(':');

          if (isEnglishOrMeta || !clean) {
            if (ragContext.matchedProducts.length > 0) {
              const p = ragContext.matchedProducts[0];
              clean = `Dạ Mini Shop có bán ${p.name} với giá ${p.price.toLocaleString('vi-VN')}đ, bạn xem chi tiết ở thẻ bên dưới nhé!`;
            } else {
              clean = `Dạ hiện tại Mini Shop chưa có sản phẩm này ạ. Bạn tham khảo các mẫu sản phẩm khác của shop nhé!`;
            }
          }

          // Deduplicate if repeated
          const sentences = clean.split(/(?<=[.!?])\s+/);
          if (sentences.length > 1 && sentences[0] === sentences[1]) {
            clean = sentences[0];
          }

          botReplyText = clean;
        } else {
          botReplyText = generateSmartRagResponse(trimmedContent, ragContext);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to smart RAG response:', geminiErr);
        botReplyText = generateSmartRagResponse(trimmedContent, ragContext);
      }
    } else {
      // Smart deterministic RAG response engine
      botReplyText = generateSmartRagResponse(trimmedContent, ragContext);
    }

    // Format recommended products summary for client UI
    const recommendedProductsSummary = ragContext.matchedProducts.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      categoryName: p.categoryName,
      inStock: p.inStock,
      stockCount: p.stockCount,
    }));

    // 4. Save Bot Reply to Database
    const { data: insertedBotMsg } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender: 'bot',
        content: botReplyText,
        recommended_products: recommendedProductsSummary,
      })
      .select()
      .single();

    // Update last_message in session
    await supabase
      .from('chat_sessions')
      .update({
        last_message: botReplyText.slice(0, 200),
        last_message_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    const botMessage = insertedBotMsg
      ? {
          id: insertedBotMsg.id,
          sessionId: insertedBotMsg.session_id,
          sender: insertedBotMsg.sender,
          content: insertedBotMsg.content,
          recommendedProducts: recommendedProductsSummary,
          createdAt: insertedBotMsg.created_at,
        }
      : null;

    return NextResponse.json({
      success: true,
      userMessage,
      botMessage,
      isBotActive: true,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Lỗi xử lý tin nhắn.' }, { status: 500 });
  }
}
