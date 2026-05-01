"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

interface Task {
  id: number;
  goalId: number;
  weekNumber: number;
  weekTheme: string;
  title: string;
  description: string | null;
  isCompleted: number;
  sortOrder: number;
}

interface Goal {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  tasks: Task[];
}

const WEEK_COLORS = [
  { bg: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-violet-500", light: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  { bg: "bg-fuchsia-500", light: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200" },
  { bg: "bg-pink-500", light: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
];

export default function GoalDetailPage({ goalId }: { goalId: string }) {
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  const fetchGoal = useCallback(async () => {
    try {
      const res = await fetch(`/api/goals/${goalId}`);
      const data = await res.json();
      if (data.data) {
        setGoal(data.data);
        if (data.data.tasks?.length > 0) {
          const weeks = [...new Set(data.data.tasks.map((t: Task) => t.weekNumber))] as number[];
          const firstIncomplete = weeks.find((w) => {
            const wTasks = data.data.tasks.filter((t: Task) => t.weekNumber === w);
            return wTasks.some((t: Task) => t.isCompleted === 0);
          });
          setExpandedWeeks(new Set([firstIncomplete ?? weeks[0]]));
        }
      }
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const generateTasks = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/goals/${goalId}/generate-tasks`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.data) {
        await fetchGoal();
      }
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    setGoal((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, isCompleted: completed ? 1 : 0 } : t
        ),
      };
    });

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: completed }),
      });
    } catch {
      fetchGoal();
    }
  };

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <Loader2 className="animate-spin text-indigo-400" size={28} />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: "var(--background)" }}>
        <p className="text-gray-500 mb-4">Goal not found</p>
        <button
          onClick={() => router.push("/goals")}
          className="text-indigo-600 font-medium"
        >
          Back to Goals
        </button>
      </div>
    );
  }

  const totalTasks = goal.tasks.length;
  const completedTasks = goal.tasks.filter((t) => t.isCompleted === 1).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weekMap = goal.tasks.reduce<Record<number, Task[]>>((acc, task) => {
    if (!acc[task.weekNumber]) acc[task.weekNumber] = [];
    acc[task.weekNumber].push(task);
    return acc;
  }, {});

  const sortedWeeks = Object.keys(weekMap)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen pb-12" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => router.push("/goals")}
            className="flex items-center gap-1.5 text-indigo-200 hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft size={16} />
            All Goals
          </button>

          <h1
            className="text-xl font-bold leading-tight mb-1"
            style={{ fontFamily: "var(--font-baloo2)" }}
          >
            {goal.title}
          </h1>
          {goal.description && (
            <p className="text-indigo-200 text-sm">{goal.description}</p>
          )}

          {totalTasks > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-indigo-200">
                  {completedTasks} of {totalTasks} tasks
                </span>
                <span className="font-semibold">{overallProgress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Generate / Regenerate button */}
        <div className="py-4">
          {totalTasks === 0 ? (
            <button
              onClick={generateTasks}
              disabled={generating}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2.5 hover:bg-indigo-700 disabled:opacity-70 transition-colors shadow-sm"
            >
              {generating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Claude is crafting your plan…</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate my 8-week plan</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={generateTasks}
              disabled={generating}
              className="flex items-center gap-2 text-indigo-600 text-sm font-medium hover:text-indigo-800 disabled:opacity-50 transition-colors py-1"
            >
              {generating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Regenerating plan…
                </>
              ) : (
                <>
                  <RefreshCw size={15} />
                  Regenerate plan
                </>
              )}
            </button>
          )}
        </div>

        {/* Generating overlay */}
        {generating && totalTasks === 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-4 text-center">
            <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-3" />
            <p className="text-indigo-800 font-medium text-sm">
              Claude is thinking through your goal…
            </p>
            <p className="text-indigo-500 text-xs mt-1">
              Building your personalised 8-week roadmap
            </p>
          </div>
        )}

        {/* Week cards */}
        {sortedWeeks.length > 0 && (
          <div className="space-y-3">
            {sortedWeeks.map((weekNum) => {
              const weekTasks = weekMap[weekNum];
              const theme = weekTasks[0].weekTheme;
              const doneCount = weekTasks.filter((t) => t.isCompleted === 1).length;
              const allDone = doneCount === weekTasks.length;
              const isExpanded = expandedWeeks.has(weekNum);
              const color = WEEK_COLORS[(weekNum - 1) % WEEK_COLORS.length];

              return (
                <div
                  key={weekNum}
                  className={`bg-white rounded-3xl shadow-sm overflow-hidden border ${
                    allDone ? "border-emerald-200" : "border-gray-100"
                  }`}
                >
                  {/* Week header */}
                  <button
                    className="w-full flex items-center justify-between px-5 py-4"
                    onClick={() => toggleWeek(weekNum)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 ${
                          allDone ? "bg-emerald-500" : color.bg
                        } rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                      >
                        {allDone ? <Check size={16} /> : weekNum}
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-400 font-medium">
                          WEEK {weekNum}
                        </p>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">
                          {theme}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          allDone
                            ? "bg-emerald-100 text-emerald-700"
                            : `${color.light} ${color.text}`
                        }`}
                      >
                        {doneCount}/{weekTasks.length}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {/* Tasks */}
                  {isExpanded && (
                    <div className={`border-t ${allDone ? "border-emerald-100" : "border-gray-100"} divide-y divide-gray-50`}>
                      {weekTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3.5 px-5 py-3.5"
                        >
                          <button
                            onClick={() =>
                              toggleTask(task.id, task.isCompleted === 0)
                            }
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              task.isCompleted === 1
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : `border-gray-300 hover:${color.border}`
                            }`}
                            aria-label={
                              task.isCompleted
                                ? "Mark incomplete"
                                : "Mark complete"
                            }
                          >
                            {task.isCompleted === 1 && <Check size={12} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium leading-snug ${
                                task.isCompleted === 1
                                  ? "line-through text-gray-400"
                                  : "text-gray-800"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
