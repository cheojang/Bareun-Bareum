import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 서버사이드 전용 — service_role 키는 클라이언트에 노출되면 안 됨
export const supabaseAdmin = url && key
  ? createClient(url, key, { auth: { persistSession: false } })
  : null;

export const STORAGE_BUCKET = "images";
export const CHILD_IMAGES_PATH = "children";
export const WORD_IMAGES_PATH = "words"; // 단어 이미지 (향후)
