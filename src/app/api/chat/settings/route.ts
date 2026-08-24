import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data } = await supabase
      .from('chat_ai_config')
      .select('*')
      .eq('id', 'global')
      .single();

    const dbApiKey = data?.gemini_api_key || '';
    const envApiKey = process.env.GEMINI_API_KEY || '';
    const effectiveKey = dbApiKey || envApiKey;

    return NextResponse.json({
      success: true,
      hasKey: !!effectiveKey,
      geminiApiKey: dbApiKey,
      maskedKey: effectiveKey
        ? `${effectiveKey.substring(0, 7)}...${effectiveKey.substring(effectiveKey.length - 4)}`
        : '',
      modelName: data?.model_name || 'gemini-1.5-flash',
      isFromEnv: !dbApiKey && !!envApiKey,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geminiApiKey, testOnly } = body;

    const keyToTest = geminiApiKey?.trim();
    let workingModelName = 'gemini-1.5-flash';

    if (keyToTest) {
      // 1. Query Google's ModelService directly with the key to validate and list supported models
      let supportedModels: string[] = [];
      try {
        const listRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(keyToTest)}`
        );
        const listData = await listRes.json();

        if (listData.error) {
          return NextResponse.json(
            {
              success: false,
              error: `Google từ chối API Key: ${listData.error.message || 'Khóa không hợp lệ hoặc đã bị vô hiệu hóa'}`,
            },
            { status: 400 }
          );
        }

        if (Array.isArray(listData.models)) {
          supportedModels = listData.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace(/^models\//, ''));
        }
      } catch (networkErr: any) {
        console.warn('Could not list models directly:', networkErr);
      }

      // If no models returned from list, try default common names
      if (supportedModels.length === 0) {
        supportedModels = [
          'gemini-1.5-flash',
          'gemini-1.5-flash-latest',
          'gemini-2.0-flash-exp',
          'gemini-2.0-flash',
          'gemini-1.5-pro',
        ];
      }

      // 2. Prioritize best models
      const priorityOrder = [
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-pro',
      ];

      const sortedModels = supportedModels.sort((a, b) => {
        const idxA = priorityOrder.indexOf(a);
        const idxB = priorityOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0;
      });

      // 3. Test generateContent on the best available model
      const genAI = new GoogleGenerativeAI(keyToTest);
      let found = false;
      let lastErrMsg = '';

      for (const mName of sortedModels) {
        try {
          const model = genAI.getGenerativeModel({ model: mName });
          const result = await model.generateContent('Hi');
          const responseText = result.response.text();
          if (responseText) {
            workingModelName = mName;
            found = true;
            break;
          }
        } catch (testErr: any) {
          lastErrMsg = testErr?.message || String(testErr);
        }
      }

      if (!found) {
        return NextResponse.json(
          {
            success: false,
            error: `Khóa API không thể sinh nội dung. Chi tiết: ${lastErrMsg}`,
          },
          { status: 400 }
        );
      }
    }

    if (testOnly) {
      return NextResponse.json({
        success: true,
        message: `Khóa API hợp lệ! Đã kết nối thành công với mô hình [${workingModelName}].`,
        modelName: workingModelName,
      });
    }

    // 4. Save working configuration to database
    const { error: upsertError } = await supabase
      .from('chat_ai_config')
      .upsert({
        id: 'global',
        gemini_api_key: keyToTest || null,
        model_name: workingModelName,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.json({
      success: true,
      message: keyToTest
        ? `Đã lưu và kích hoạt Google Gemini AI (${workingModelName}) thành công!`
        : 'Đã xóa khóa API.',
      hasKey: !!keyToTest,
      modelName: workingModelName,
    });
  } catch (err: any) {
    console.error('Error saving AI config:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
