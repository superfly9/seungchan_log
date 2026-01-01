import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 세션 종료 (로그아웃)
  await supabase.auth.signOut()

  // 캐시 갱신 및 홈으로 리다이렉트
  revalidatePath("/", "layout")
  return NextResponse.redirect(new URL("/login", req.url), {
    status: 302,
  })
}
