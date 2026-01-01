import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { format } from "date-fns"

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from("posts")
    .select("*")
  
  // 로그인 안 한 유저는 공개글만 보기
  if (!user) {
    query = query.eq("is_public", true)
  }

  const { data: posts, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts:", error)
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">기록 남기기</h1>
          <p className="text-gray-500">이것저것 남기는 곳</p>
        </div>
        
        {/* 관리자용 버튼 (로그인한 경우만 보임) */}
        {user && (
          <div className="flex gap-4">
            <form action="/auth/signout" method="post">
              <button 
                type="submit"
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                로그아웃
              </button>
            </form>
            <Link 
              href="/write" 
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              글쓰기
            </Link>
          </div>
        )}
      </header>
      
      <div className="space-y-8">
        {!posts || posts.length === 0 ? (
          <p className="text-gray-500 text-center py-10">작성된 글이 없습니다.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="border-b border-gray-100 pb-8 last:border-0 relative">
              <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                <time dateTime={post.created_at}>
                  {format(new Date(post.created_at), "yyyy년 MM월 dd일")}
                </time>
                {!post.is_public && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                    비공개
                  </span>
                )}
              </div>
              <Link href={`/posts/${post.id}`} className="group">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title || "제목 없음"}
                </h2>
              </Link>
              <p className="text-gray-600 line-clamp-3 leading-relaxed">
                {post.content?.slice(0, 150)}
                {post.content && post.content.length > 150 ? "..." : ""}
              </p>
            </article>
          ))
        )}
      </div>
    </main>
  )
}
