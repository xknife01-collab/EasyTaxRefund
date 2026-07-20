export interface SupportChat {
  id: string;
  channel: 'telegram' | 'kakao' | 'whatsapp' | 'facebook';
  external_chat_id: string;
  user_name: string | null;
  user_phone: string | null;
  detected_language: string;
  last_message_at: string;
  unread_count: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  chat_id: string;
  sender_type: 'customer' | 'admin';
  original_text: string;
  translated_text: string | null;
  source_lang: string | null;
  target_lang: string | null;
  is_read: boolean;
  created_at: string;
}
