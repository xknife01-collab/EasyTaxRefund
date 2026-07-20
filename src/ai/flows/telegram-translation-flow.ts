'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Translate incoming customer message to Korean + Detect language
const IncomingTranslationInputSchema = z.object({
  text: z.string().describe("Customer's message in native language"),
});

const IncomingTranslationOutputSchema = z.object({
  sourceLang: z.string().describe("Detected ISO 639-1 language code (e.g., 'vi', 'zh', 'th', 'id', 'en', 'uz', 'my', 'km', 'mn', 'ne', 'ko')"),
  translatedText: z.string().describe("Natural Korean translation of the customer's message"),
});

const incomingTranslationPrompt = ai.definePrompt({
  name: 'incomingTelegramTranslationPrompt',
  input: { schema: IncomingTranslationInputSchema },
  output: { schema: IncomingTranslationOutputSchema },
  prompt: `You are an expert real-time translator for a foreign worker tax refund service in South Korea.
Analyze the following customer message:
1. Detect the source language ISO code (e.g., 'vi' for Vietnamese, 'zh' for Chinese, 'th' for Thai, 'id' for Indonesian, 'en' for English, 'uz' for Uzbek, 'my' for Burmese, 'km' for Khmer, 'mn' for Mongolian, 'ne' for Nepali, 'si' for Sinhalese, 'bn' for Bengali, 'kk' for Kazakh, 'ur' for Urdu).
2. Translate the message into natural, clear Korean.

Customer Message: {{{text}}}`,
});

export async function translateIncomingTelegramMessage(text: string) {
  const { output } = await incomingTranslationPrompt({ text });
  if (!output) {
    return { sourceLang: 'en', translatedText: text };
  }
  return output;
}

// 2. Translate admin's Korean message to customer's target language
const OutgoingTranslationInputSchema = z.object({
  text: z.string().describe("Admin's message in Korean"),
  targetLang: z.string().describe("Target language code (e.g., 'vi', 'zh', 'th', 'id', 'en')"),
});

const OutgoingTranslationOutputSchema = z.object({
  translatedText: z.string().describe("Translation of Korean text into the customer's native language"),
});

const outgoingTranslationPrompt = ai.definePrompt({
  name: 'outgoingTelegramTranslationPrompt',
  input: { schema: OutgoingTranslationInputSchema },
  output: { schema: OutgoingTranslationOutputSchema },
  prompt: `You are an expert real-time translator for Korea Tax Refund Service in South Korea.
Translate the following Korean message from the admin into the target language (Language code: {{{targetLang}}}).
Make sure the tone is polite, professional, clear, and easy for a foreign worker to understand.

Korean Message: {{{text}}}`,
});

export async function translateOutgoingTelegramMessage(text: string, targetLang: string) {
  if (targetLang === 'ko') {
    return { translatedText: text };
  }
  const { output } = await outgoingTranslationPrompt({ text, targetLang });
  if (!output) {
    return { translatedText: text };
  }
  return output;
}
