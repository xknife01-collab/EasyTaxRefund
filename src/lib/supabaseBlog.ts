import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabaseBlog = createClient(supabaseUrl, supabaseAnonKey);

// 프로젝트 환경변수 또는 서비스 식별자에 따라 테이블 자동 선택 (기본값: easytax_blogs)
export const isEasyTax = process.env.NEXT_PUBLIC_SERVICE_ID !== 'kmarket';
export const BLOG_TABLE = isEasyTax ? 'easytax_blogs' : 'kmarket_blogs';

export interface BlogPost {
  id: number | string;
  slug: string;
  target_lang: string;
  title: string;
  excerpt: string;
  content_html: string;
  content_md?: string;
  thumbnail_url: string;
  category: string;
  author: string;
  views?: number;
  likes?: number;
  published_at: string;
  created_at?: string;
}

/**
 * 특정 언어의 최신 블로그 목록 조회
 */
export async function getBlogPosts(lang: string = 'ko', limit: number = 24): Promise<BlogPost[]> {
  try {
    const { data, error } = await supabaseBlog
      .from(BLOG_TABLE)
      .select('*')
      .eq('target_lang', lang)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn(`[Supabase Blog] Warning fetching posts for lang=${lang}:`, error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(`[Supabase Blog] Unexpected error fetching posts for lang=${lang}:`, err);
    return [];
  }
}

/**
 * 특정 슬러그와 언어의 블로그 상세 칼럼 조회
 */
export async function getBlogPostBySlug(slug: string, lang: string = 'ko'): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabaseBlog
      .from(BLOG_TABLE)
      .select('*')
      .eq('slug', slug)
      .eq('target_lang', lang)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase Blog] Warning fetching post slug=${slug}, lang=${lang}:`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[Supabase Blog] Unexpected error fetching post slug=${slug}, lang=${lang}:`, err);
    return null;
  }
}
