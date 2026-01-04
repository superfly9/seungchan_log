import PostForm from "@/components/post-form"

export default function WritePage() {
  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 글 작성</h1>
      <PostForm mode="create" />
    </main>
  )
}
