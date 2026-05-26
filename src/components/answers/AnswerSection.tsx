"use client";

import { useState } from "react";
import { AnswerCard } from "./AnswerCard";
import { AnswerForm } from "./AnswerForm";
import { MessageSquare } from "lucide-react";

interface Answer {
  id: string;
  body: string;
  score: number;
  isAccepted: boolean;
  createdAt: string;
  author: { username: string; name: string | null };
}

interface AnswerSectionProps {
  postId: string;
  initialAnswers: Answer[];
  answerVotes: Record<string, number>;
  isPostAuthor: boolean;
}

export function AnswerSection({
  postId,
  initialAnswers,
  answerVotes,
  isPostAuthor,
}: AnswerSectionProps) {
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);

  function handleAnswerAdded(answer: Answer) {
    setAnswers((prev) => [...prev, answer]);
  }

  async function handleAccept(answerId: string) {
    try {
      const res = await fetch(`/api/answers/${answerId}/accept`, {
        method: "POST",
      });
      if (res.ok) {
        setAnswers((prev) =>
          prev.map((a) => ({
            ...a,
            isAccepted: a.id === answerId,
          }))
        );
      }
    } catch {
      // ignore
    }
  }

  return (
    <section>
      <h2 className="flex items-center gap-2 text-breach-text font-semibold text-lg mb-4">
        <MessageSquare className="w-5 h-5 text-breach-text-muted" />
        {answers.length} {answers.length === 1 ? "Answer" : "Answers"}
      </h2>

      {answers.length > 0 && (
        <div className="space-y-3 mb-8">
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              userVote={answerVotes[answer.id] ?? null}
              isPostAuthor={isPostAuthor}
              onAccept={handleAccept}
            />
          ))}
        </div>
      )}

      <div className="bg-breach-card border border-breach-border rounded-lg p-5">
        <h3 className="text-breach-text font-semibold mb-4">Your answer</h3>
        <AnswerForm postId={postId} onAnswerAdded={handleAnswerAdded} />
      </div>
    </section>
  );
}
