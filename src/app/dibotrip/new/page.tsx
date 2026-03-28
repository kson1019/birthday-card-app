"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ImportPayload } from "@/lib/dibotrip/db/types";
import ImportTextArea from "@/components/dibotrip/ImportTextArea";
import ImportLoading from "@/components/dibotrip/ImportLoading";
import ImportPreview from "@/components/dibotrip/ImportPreview";

type Step = "paste" | "extracting" | "preview" | "saving";

export default function NewTripPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("paste");
  const [text, setText] = useState("");
  const [payload, setPayload] = useState<ImportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    setStep("extracting");
    setError(null);

    try {
      const res = await fetch("/api/trips/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Extraction failed. Please try again.");
        setStep("paste");
        return;
      }

      setPayload(json.data);
      setStep("preview");
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setStep("paste");
    }
  }

  async function handleConfirm() {
    if (!payload) return;
    setStep("saving");
    setError(null);

    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Failed to save trip. Please try again.");
        setStep("preview");
        return;
      }

      router.push(`/dibotrip/${json.data.id}`);
    } catch {
      setError("Failed to save trip. Check your connection and try again.");
      setStep("preview");
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Nav */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dibotrip"
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-stone-900">
              Import a trip
            </h1>
            <StepIndicator step={step} />
          </div>
        </div>

        {/* Step content */}
        {step === "paste" && (
          <ImportTextArea
            value={text}
            onChange={setText}
            onSubmit={handleExtract}
            error={error}
          />
        )}

        {step === "extracting" && <ImportLoading />}

        {(step === "preview" || step === "saving") && payload && (
          <ImportPreview
            payload={payload}
            onConfirm={handleConfirm}
            onBack={() => {
              setStep("paste");
              setError(null);
            }}
            error={error}
            saving={step === "saving"}
          />
        )}
      </div>
    </main>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const labels: Record<Step, string> = {
    paste: "Step 1 of 3 — Paste your trip plan",
    extracting: "Step 2 of 3 — Extracting…",
    preview: "Step 3 of 3 — Review & confirm",
    saving: "Step 3 of 3 — Saving…",
  };

  return (
    <p className="text-xs text-stone-400 mt-0.5">{labels[step]}</p>
  );
}
