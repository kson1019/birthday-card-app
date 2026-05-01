"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Target, ChevronRight, Loader2, X, CheckCircle2 } from "lucide-react";

interface Goal {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  totalTasks: number;
  completedTasks: number;
}

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      setGoals(data.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (data.data) {
        router.push(`/goals/${data.data.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const progress = (goal: Goal) =>
    goal.totalTasks > 0
      ? Math.round((goal.completedTasks / goal.totalTasks) * 100)
      : 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white px-5 pt-14 pb-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Target size={22} />
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-baloo2)" }}>
              Weekly Goals
            </h1>
          </div>
          <p className="text-indigo-200 text-sm">
            Set a goal · Get a plan · Check it off
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-28">
        {/* Goals list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-indigo-400" size={28} />
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center mt-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Target size={28} className="text-indigo-400" />
            </div>
            <h2 className="font-semibold text-gray-800 text-lg mb-1">No goals yet</h2>
            <p className="text-gray-500 text-sm mb-5">
              Add your first goal and Claude will build a personalised weekly plan for you.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Add my first goal
            </button>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => router.push(`/goals/${goal.id}`)}
                className="w-full bg-white rounded-3xl shadow-sm p-5 text-left hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-gray-900 text-base leading-snug flex-1">
                    {goal.title}
                  </h3>
                  <ChevronRight size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                </div>

                {goal.totalTasks > 0 ? (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>
                        {goal.completedTasks === goal.totalTasks ? (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 size={12} /> All done!
                          </span>
                        ) : (
                          `${goal.completedTasks} of ${goal.totalTasks} tasks`
                        )}
                      </span>
                      <span className="font-medium text-indigo-600">{progress(goal)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-indigo-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${progress(goal)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    Tap to generate your 8-week plan with Claude
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      {!showForm && goals.length > 0 && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-20"
          aria-label="Add goal"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Add Goal Sheet */}
      {showForm && (
        <div className="fixed inset-0 z-30 flex items-end" onClick={() => setShowForm(false)}>
          <div
            className="absolute inset-0 bg-black/40"
            style={{ backdropFilter: "blur(2px)" }}
          />
          <div
            className="relative w-full bg-white rounded-t-3xl px-5 pt-5 pb-10 shadow-2xl max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-baloo2)" }}>
                New Goal
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What&apos;s your goal?
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Finish my UX portfolio"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-base"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Context <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details so Claude can make a better plan"
                  rows={3}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none text-base"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-full font-semibold text-base hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create goal"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
