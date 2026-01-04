import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !post) {
    console.error("Error fetching post or not found:", error)
    notFound()
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/" 
          className="text-sm text-gray-500 hover:text-foreground transition-colors"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>

      <article>
        <header className="mb-8 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), "yyyy년 MM월 dd일")}
            </time>
            {!post.is_public && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                비공개
              </span>
            )}
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-4 leading-tight">
            {post.title || "제목 없음"}
          </h1>
        </header>

        <div className="prose prose-gray dark:max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </article>
      
      {/* 작성자 본인일 경우 수정 버튼 등 추가 가능 영역 */}
      {user && user.id === post.user_id && (
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <Link
            href={`/posts/${post.id}/edit`}
            className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors underline decoration-gray-300 underline-offset-4"
          >
            수정하기
          </Link>
        </div>
      )}
    </main>
  )
}
