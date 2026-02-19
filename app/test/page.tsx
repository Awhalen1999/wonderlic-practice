"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  selectTestQuestions,
  getCategoryColor,
  getCategoryLabel,
  scoreToPercentile,
} from "@/lib/utils";
import AnswerOption, { LABELS } from "@/components/AnswerOption";
import type { AnswerState } from "@/components/AnswerOption";
import Timer from "@/components/Timer";
import questions from "@/data/questions.json";
import type { Question, QuestionCategory } from "@/lib/types";

const TIME_LIMIT = 720;
const TEST_COUNT = 50;

export default function TestPage() {
  const router = useRouter();
  const { progress, saveTestResult } = useStore();

  const [testQuestions] = useState<Question[]>(() =>
    selectTestQuestions(questions as Question[], TEST_COUNT),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [startTime] = useState(Date.now());
  const [confirmed, setConfirmed] = useState(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = testQuestions[currentIndex];
  const pct = Math.round((currentIndex / testQuestions.length) * 100);

  const finishTest = useCallback(
    (finalAnswers: Record<number, number>) => {
      const timeUsed = Math.round((Date.now() - startTime) / 1000);
      let score = 0;
      const categoryBreakdown: Record<
        QuestionCategory,
        { correct: number; total: number }
      > = {
        verbal: { correct: 0, total: 0 },
        math: { correct: 0, total: 0 },
        logic: { correct: 0, total: 0 },
        spatial: { correct: 0, total: 0 },
        general: { correct: 0, total: 0 },
      };
      const missed: number[] = [];

      testQuestions.forEach((q) => {
        const chosen = finalAnswers[q.id];
        const correct = chosen === q.answer;
        categoryBreakdown[q.category].total++;
        if (correct) {
          score++;
          categoryBreakdown[q.category].correct++;
        } else missed.push(q.id);
      });

      saveTestResult({
        date: new Date().toLocaleDateString(),
        score,
        total: testQuestions.length,
        timeUsed,
        categoryBreakdown,
        missedQuestions: missed,
      });

      sessionStorage.setItem(
        "lastTestQuestions",
        JSON.stringify(testQuestions),
      );
      sessionStorage.setItem("lastTestAnswers", JSON.stringify(finalAnswers));
      sessionStorage.setItem("lastTestScore", String(score));
      sessionStorage.setItem(
        "lastTestPercentile",
        String(scoreToPercentile(score)),
      );
      sessionStorage.setItem("lastTestTimeUsed", String(timeUsed));
      router.push("/results");
    },
    [testQuestions, startTime, saveTestResult, router],
  );

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
  };

  const handleSubmit = useCallback(() => {
    if (selected === null || submitted || !question) return;
    const newAnswers = { ...answers, [question.id]: selected };
    setAnswers(newAnswers);
    setSubmitted(true);
    advanceTimer.current = setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= testQuestions.length) {
        finishTest(newAnswers);
      } else {
        setCurrentIndex(next);
        setSelected(null);
        setSubmitted(false);
      }
    }, 600);
  }, [
    selected,
    submitted,
    question,
    answers,
    currentIndex,
    testQuestions.length,
    finishTest,
  ]);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!confirmed) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "5") {
        const idx = parseInt(e.key) - 1;
        if (question && idx < question.options.length) handleSelect(idx);
      }
      const letterIdx = ["a", "b", "c", "d", "e"].indexOf(e.key.toLowerCase());
      if (letterIdx !== -1 && question && letterIdx < question.options.length)
        handleSelect(letterIdx);
      if (e.key === "Enter" && !submitted) handleSubmit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, question, submitted, handleSubmit]);

  const getOptionState = (idx: number): AnswerState => {
    if (!submitted) return selected === idx ? "selected" : "default";
    return selected === idx ? "selected" : "default";
  };

  // ── Pre-test screen ──
  if (!confirmed) {
    return (
      <main className="h-full overflow-y-auto flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-5">⏱️</div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Ready?</h1>
          <p className="text-zinc-600 text-sm mb-8">
            {TEST_COUNT} questions · 12 minutes
          </p>

          <ul className="text-left space-y-2 mb-8 text-sm text-zinc-500">
            {[
              "Select an answer then hit Submit to move on",
              "No explanations until after the test",
              "Timer starts the moment you begin",
            ].map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-zinc-400 mt-0.5">·</span>
                {r}
              </li>
            ))}
          </ul>

          {progress.name && progress.name !== "friend" && (
            <p className="text-sm text-zinc-600 mb-5">
              You&apos;ve got this, {progress.name}.
            </p>
          )}

          <button
            onClick={() => setConfirmed(true)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] text-white font-bold rounded-2xl py-4 transition-all duration-150"
          >
            Begin →
          </button>
          <button
            onClick={() => router.push("/")}
            className="mt-3 flex items-center justify-center gap-1 w-full text-sm text-zinc-500 hover:text-zinc-700 transition-colors py-2"
          >
            <ArrowLeft size={13} /> Back
          </button>
        </div>
      </main>
    );
  }

  // ── Active test ──
  return (
    <main className="h-full overflow-y-auto flex flex-col">
      {/* Slim header */}
      <div className="shrink-0 px-4 pt-4 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="text-zinc-500 hover:text-zinc-800 transition-colors p-1 -ml-1"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-zinc-700 tabular-nums">
              {currentIndex + 1}
              <span className="font-normal text-zinc-500">
                /{testQuestions.length}
              </span>
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${getCategoryColor(question.category)}`}
            >
              {getCategoryLabel(question.category)}
            </span>
          </div>
          <Timer
            totalSeconds={TIME_LIMIT}
            onExpire={() => finishTest(answers)}
          />
        </div>
        <div className="w-full h-1.5 bg-sky-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Centered question */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="w-full max-w-lg mb-8">
          <p className="text-lg font-semibold text-zinc-900 leading-relaxed text-left">
            {question.question}
          </p>
        </div>

        <div className="w-full flex flex-col gap-2.5 max-w-md">
          {question.options.map((opt, idx) => (
            <AnswerOption
              key={idx}
              label={LABELS[idx]}
              text={opt}
              state={getOptionState(idx)}
              disabled={submitted}
              onClick={() => handleSelect(idx)}
            />
          ))}
        </div>

        <div className="mt-6 w-full max-w-md">
          <button
            onClick={handleSubmit}
            disabled={selected === null || submitted}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-200 disabled:text-indigo-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 transition-all duration-150 active:scale-[0.98]"
          >
            {submitted ? "..." : "Submit"}
          </button>
        </div>
      </div>
    </main>
  );
}
