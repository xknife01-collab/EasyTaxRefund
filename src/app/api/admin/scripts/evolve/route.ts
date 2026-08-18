import { NextRequest, NextResponse } from "next/server";
import { generateAndEvolveScripts } from "@/lib/ai-learning-db";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { targetLanguage, targetPersonality, targetStep, count } = body;

    const result = await generateAndEvolveScripts({
      targetLanguage: targetLanguage || 'vi',
      targetPersonality: targetPersonality || 'all',
      targetStep: targetStep || 'general',
      count: count || 3,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "신규 화법 생성 및 등록에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `성공적으로 ${result.generatedCount}개의 신규 자율 진화 화법이 생성되어 DB에 등록되었습니다.`,
      generatedCount: result.generatedCount,
      scripts: result.scripts,
    });
  } catch (error: any) {
    console.error("[Admin Scripts Evolve API Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang');

    let query = supabaseAdmin
      .from('refund_scripts')
      .select('id, refund_step, target_psychology, script_text, detected_language, target_personality, generation_origin, success_weight, impressions_count, conversions_count, conversion_rate, updated_at')
      .order('conversion_rate', { ascending: false });

    if (lang && lang !== 'all') {
      query = query.eq('detected_language', lang);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      scripts: data || [],
    });
  } catch (error: any) {
    console.error("[Admin Scripts GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
