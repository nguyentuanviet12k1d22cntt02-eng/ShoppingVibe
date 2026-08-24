export interface ChatProductSummary {
  id: string;
  name: string;
  price: number;
  image: string;
  categoryName?: string;
  inStock: boolean;
  stockCount: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'bot' | 'admin';
  content: string;
  recommendedProducts?: ChatProductSummary[];
  createdAt: string;
}

export interface ChatSession {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  isBotActive: boolean;
  lastMessage: string;
  lastMessageAt: string;
  status: 'active' | 'closed';
  createdAt: string;
  unreadCount?: number;
  messages?: ChatMessage[];
}
