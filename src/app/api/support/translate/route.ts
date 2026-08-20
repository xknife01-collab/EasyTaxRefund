import { NextRequest, NextResponse } from "next/server";
import { translateIncomingTelegramMessage } from "@/ai/flows/telegram-translation-flow";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { text, messageId, texts } = await req.json();

    // 1. Batch translation mode
    if (Array.isArray(texts) && texts.length > 0) {
      const results = await Promise.all(
        texts.map(async (item: { id: string; text: string }) => {
          if (!item.text || /[가-힣]/.test(item.text)) {
            return { id: item.id, translatedText: item.text };
          }
          try {
            const res = await translateIncomingTelegramMessage(item.text);
            const translatedText = res?.translatedText || item.text;

            if (item.id && !item.id.startsWith("temp-") && translatedText !== item.text) {
              Promise.resolve(
                supabaseAdmin
                  .from("support_messages")
                  .update({ translated_text: translatedText })
                  .eq("id", item.id)
              ).catch(() => {});
            }

            return { id: item.id, translatedText };
          } catch {
            return { id: item.id, translatedText: item.text };
          }
        })
      );
      return NextResponse.json({ success: true, translations: results });
    }

    // 2. Single translation mode
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // If text already has Korean characters, return as is
    if (/[가-힣]/.test(text)) {
      return NextResponse.json({ success: true, translatedText: text });
    }

    const res = await translateIncomingTelegramMessage(text.trim());
    const translatedText = res?.translatedText || text.trim();

    // Permanently save to Supabase support_messages if messageId provided
    if (messageId && translatedText !== text) {
      try {
        await supabaseAdmin
          .from("support_messages")
          .update({ translated_text: translatedText })
          .eq("id", messageId);
      } catch (dbErr) {
        console.warn("[Translate API] DB Update error:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      translatedText,
      sourceLang: res?.sourceLang || "unknown",
    });
  } catch (error: any) {
    console.error("[Translate API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
