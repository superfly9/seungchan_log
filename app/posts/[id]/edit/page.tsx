import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import PostForm from "@/components/post-form"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !post) {
    notFound()
  }

  if (post.user_id !== user.id) {
    redirect("/")
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">글 수정</h1>
      <PostForm 
        mode="edit" 
        initialData={{
          title: post.title,
          content: post.content,
          is_public: post.is_public
        }}
        postId={post.id.toString()}
      />
    </main>
  )
}
