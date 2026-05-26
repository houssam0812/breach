import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { VoteButton } from "@/components/posts/VoteButton";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AnswerCardProps {
  answer: {
    id: string;
    body: string;
    score: number;
    isAccepted: boolean;
    createdAt: Date | string;
    author: { username: string; name: string | null };
  };
  userVote?: number | null;
  isPostAuthor?: boolean;
  onAccept?: (answerId: string) => void;
}

export function AnswerCard({
  answer,
  userVote,
  isPostAuthor,
  onAccept,
}: AnswerCardProps) {
  return (
    <div
      className={cn(
        "bg-breach-card border rounded-lg flex gap-0 transition-colors",
        answer.isAccepted
          ? "border-green-500/40"
          : "border-breach-border"
      )}
    >
      {/* Vote column */}
      <div className="flex flex-col items-center bg-breach-dark/40 rounded-l-lg px-2 py-3 min-w-[44px]">
        <VoteButton
          score={answer.score}
          userVote={userVote}
          targetId={answer.id}
          targetType="answer"
        />
        {answer.isAccepted && (
          <CheckCircle2 className="w-5 h-5 text-green-500 mt-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-w-0">
        {answer.isAccepted && (
          <div className="mb-2">
            <span className="text-xs font-semibold text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
              ✓ Accepted answer
            </span>
          </div>
        )}

        <div className="prose-breach text-breach-text text-sm whitespace-pre-line leading-relaxed">
          {answer.body}
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-breach-text-muted">
          <span>
            answered by{" "}
            <Link
              href={`/user/${answer.author.username}`}
              className="hover:text-breach-text transition-colors"
            >
              {answer.author.username}
            </Link>{" "}
            · {timeAgo(answer.createdAt)}
          </span>

          {isPostAuthor && !answer.isAccepted && onAccept && (
            <button
              onClick={() => onAccept(answer.id)}
              className="text-green-500 hover:text-green-400 font-medium transition-colors"
            >
              Mark as accepted
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
