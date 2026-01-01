'use client'
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"

export default function WritePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. 현재 유저 확인
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("로그인이 필요합니다.")
      setLoading(false)
      // TODO: 나중에 로그인 페이지로 리다이렉트
      return
    }

    // 2. 글 저장
    const { error } = await supabase.from("posts").insert({
      user_id: user.id,
      title,
      content,
      is_public: isPublic
    })

    if (error) {
      console.error(error)
      alert("글 작성에 실패했습니다.")
    } else {
      router.push("/") // 작성 후 홈으로 이동
      router.refresh() // 데이터 갱신
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 글 작성</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="오늘의 주제는?"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black font-mono text-sm leading-relaxed"
            placeholder="무슨 일이 있었나요?"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700 select-none cursor-pointer">
            공개 글로 설정 (체크하면 누구나 볼 수 있습니다)
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "저장 중..." : "작성 완료"}
          </button>
        </div>
      </form>
    </main>
  )
}
