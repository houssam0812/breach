import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/posts/PostForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ask a question",
};

export default async function SubmitPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/submit");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-breach-text mb-1">Ask a question</h1>
      <p className="text-breach-text-muted text-sm mb-8">
        Tag your question with a specific location so the right people can answer.
      </p>
      <div className="bg-breach-card border border-breach-border rounded-lg p-6">
        <PostForm />
      </div>
    </div>
  );
}
