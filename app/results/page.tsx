"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { formatTime, getCategoryLabel } from "@/lib/utils";
import type { Question, QuestionCategory } from "@/lib/types";

type CategoryBreakdown = Record<
  QuestionCategory,
  { correct: number; total: number }
>;

export default function ResultsPage() {
  const router = useRouter();
  const { progress } = useStore();

  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);
  const [timeUsed, setTimeUsed] = useState(0);
  const [expandedMissed, setExpandedMissed] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const qs = sessionStorage.getItem("lastTestQuestions");
    const ans = sessionStorage.getItem("lastTestAnswers");
    const sc = sessionStorage.getItem("lastTestScore");
    const tu = sessionStorage.getItem("lastTestTimeUsed");

    if (!qs) {
      router.push("/");
      return;
    }

    setTestQuestions(JSON.parse(qs));
    setTestAnswers(JSON.parse(ans || "{}"));
    setScore(parseInt(sc || "0"));
    setTimeUsed(parseInt(tu || "0"));
  }, [router]);

  if (!mounted || testQuestions.length === 0) return null;

  const total = testQuestions.length;
  const pct = Math.round((score / total) * 100);

  const lastResult = progress.testHistory[0];
  const categoryBreakdown = lastResult?.categoryBreakdown as
    | CategoryBreakdown
    | undefined;

  const scoreColor =
    score >= 35
      ? "text-emerald-600"
      : score >= 25
        ? "text-indigo-600"
        : score >= 15
          ? "text-amber-600"
          : "text-red-500";

  return (
    <main className="min-h-screen flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-5">
        {/* Score card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center">
          <div className={`text-6xl font-bold mb-1 ${scoreColor}`}>
            {score}
            <span className="text-3xl text-zinc-400 font-normal">/{total}</span>
          </div>
          <div className="text-zinc-600 text-sm mb-6">
            {pct}% correct · {formatTime(timeUsed)} used
          </div>

          {/* Score message */}
          <div className="bg-zinc-50 rounded-xl p-4 mb-6 text-sm text-zinc-600">
            {score >= 35 ? (
              <>🏆 Outstanding. That score puts you well above the average.</>
            ) : score >= 28 ? (
              <>
                💪 Solid score. Above average — keep practicing to push higher.
              </>
            ) : score >= 20 ? (
              <>
                📈 Around average. More practice mode reps will get you there.
              </>
            ) : (
              <>
                💡 Room to grow. Dig into practice mode and those explanations —
                you&apos;ve got this.
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-1.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-medium text-sm rounded-xl py-2.5 px-4 transition-colors"
            >
              <ArrowLeft size={14} />
              Home
            </button>
            <button
              onClick={() => router.push("/test")}
              className="flex-1 flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium text-sm rounded-xl py-2.5 transition-colors"
            >
              <RotateCcw size={14} />
              Try Again
            </button>
            <button
              onClick={() => router.push("/practice")}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors"
            >
              <BookOpen size={14} />
              Practice
            </button>
          </div>
        </div>

        {/* Category breakdown */}
        {categoryBreakdown && (
          <div className="bg-white border border-zinc-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider mb-4">
              By Category
            </h3>
            <div className="space-y-3">
              {(
                Object.entries(categoryBreakdown) as [
                  QuestionCategory,
                  { correct: number; total: number },
                ][]
              )
                .filter(([, v]) => v.total > 0)
                .map(([cat, { correct, total: catTotal }]) => {
                  const catPct =
                    catTotal > 0 ? Math.round((correct / catTotal) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-700">
                          {getCategoryLabel(cat)}
                        </span>
                        <span className="text-sm font-medium text-zinc-700">
                          {correct}/{catTotal}
                          <span className="text-zinc-500 text-xs ml-1">
                            ({catPct}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            catPct >= 70
                              ? "bg-emerald-500"
                              : catPct >= 50
                                ? "bg-indigo-500"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${catPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* All questions */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">
              Questions ({testQuestions.length})
            </h3>
            <p className="text-xs text-zinc-600 mt-1">
              Tap any missed question to see the correct answer and explanation.
            </p>
          </div>

          <div className="divide-y divide-zinc-100">
            {testQuestions.map((q) => {
              const correct = testAnswers[q.id] === q.answer;
              const isOpen = expandedMissed === q.id;
              const chosen = testAnswers[q.id];
              return (
                <div key={q.id}>
                  <button
                    onClick={() => setExpandedMissed(isOpen ? null : q.id)}
                    className="w-full text-left px-6 py-4 hover:bg-zinc-50 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      {correct ? (
                        <Check
                          size={14}
                          className="text-emerald-500 mt-0.5 shrink-0"
                        />
                      ) : (
                        <X size={14} className="text-red-400 mt-0.5 shrink-0" />
                      )}
                      <span
                        className={`text-sm leading-snug ${correct ? "text-zinc-500" : "text-zinc-700"}`}
                      >
                        {q.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp
                        size={15}
                        className="text-zinc-400 shrink-0 mt-0.5"
                      />
                    ) : (
                      <ChevronDown
                        size={15}
                        className="text-zinc-400 shrink-0 mt-0.5"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-3 space-y-3">
                      {chosen !== undefined && (
                        <div className="flex items-center gap-2 text-sm mt-3">
                          {correct ? (
                            <Check
                              size={13}
                              className="text-emerald-500 shrink-0"
                            />
                          ) : (
                            <X size={13} className="text-red-400 shrink-0" />
                          )}
                          <span className="text-zinc-700">You answered:</span>
                          <span
                            className={`font-medium ${correct ? "text-emerald-700" : "text-red-600"}`}
                          >
                            {q.options[chosen]}
                          </span>
                        </div>
                      )}
                      {!correct && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check
                            size={13}
                            className="text-emerald-500 shrink-0"
                          />
                          <span className="text-zinc-700">Correct answer:</span>
                          <span className="text-emerald-700 font-medium">
                            {q.options[q.answer]}
                          </span>
                        </div>
                      )}
                      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 mt-3">
                        <p className="text-sm text-sky-900 leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
