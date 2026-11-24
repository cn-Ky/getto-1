"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

type Phase = "idle" | "starting" | "running" | "solved";

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Beklemede",
  starting: "Başlatılıyor",
  running: "Çalışıyor",
  solved: "Tamamlandı",
};

function lineClass(line: string) {
  if (line.startsWith("$")) return "text-term-prompt";
  if (line.includes("hazır")) return "text-term-ok";
  return "text-term-text";
}

export function LabConsole({ slug }: { slug: string }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [flag, setFlag] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  async function startSession() {
    setPhase("starting");
    setLog(["$ oturum başlatılıyor…", "izole ağ ayrılıyor…"]);

    await fetch(`/api/labs/${slug}/start`, { method: "POST" });

    setTimeout(() => {
      setLog((l) => [
        ...l,
        "izole ağ hazır — lab-net bağlı",
        "hedef sistem ayağa kalkıyor…",
        "hazır. araçların konteyner içinde kullanılabilir.",
      ]);
      setPhase("running");
    }, 900);
  }

  async function submitFlag(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/labs/${slug}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag }),
    });
    const data = await res.json();
    setFeedback(data.correct ? "correct" : "wrong");
    if (data.correct) setPhase("solved");
  }

  const statusDot =
    phase === "running" || phase === "solved"
      ? "bg-term-ok"
      : phase === "starting"
        ? "bg-term-warn"
        : "bg-term-dim";

  return (
    <section
      className="mt-6 overflow-hidden rounded-lg border border-term-line bg-term"
      aria-label="Laboratuvar konsolu"
    >
      <div className="flex items-center justify-between gap-3 border-b border-term-line px-4 py-2.5 text-xs">
        <span className="truncate font-mono text-term-dim">lab/{slug}</span>
        <span className="flex shrink-0 items-center gap-2 text-term-text">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
          {PHASE_LABEL[phase]}
        </span>
      </div>

      <div className="min-h-44 px-4 py-4 font-mono text-[13px] leading-6">
        {phase === "idle" && (
          <div className="flex flex-col items-start gap-4 font-sans">
            <p className="max-w-md text-sm text-term-dim">
              Oturumu başlattığında bu laboratuvar için izole bir ağ ve kurgusal
              bir hedef sistem ayrılır.
            </p>
            <button
              onClick={startSession}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              <Icon name="play" />
              İzole oturumu başlat
            </button>
          </div>
        )}
        {log.map((line, i) => (
          <div key={i} className={lineClass(line)}>
            {line}
            {i === log.length - 1 && phase === "starting" && (
              <span className="caret ml-1" />
            )}
          </div>
        ))}
      </div>

      {(phase === "running" || phase === "solved") && (
        <form
          onSubmit={submitFlag}
          className="flex flex-col gap-2 border-t border-term-line px-4 py-3 sm:flex-row sm:items-center"
        >
          <label htmlFor="flag" className="text-sm text-term-dim">
            Bayrak
          </label>
          <input
            id="flag"
            value={flag}
            onChange={(e) => {
              setFlag(e.target.value);
              setFeedback(null);
            }}
            disabled={phase === "solved"}
            placeholder="GETTO{...}"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-md border border-term-line bg-white/5 px-3 py-2 font-mono text-sm text-term-text outline-none placeholder:text-term-dim focus:border-term-prompt disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={phase === "solved"}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Bayrağı gönder
          </button>
        </form>
      )}

      <div aria-live="polite">
        {feedback === "correct" && (
          <div className="flex items-center gap-2 border-t border-term-line bg-term-ok/10 px-4 py-2.5 text-sm text-term-ok">
            <Icon name="check" />
            Doğru. Puan hesabına eklendi.
          </div>
        )}
        {feedback === "wrong" && (
          <div className="flex items-center gap-2 border-t border-term-line bg-term-bad/10 px-4 py-2.5 text-sm text-term-bad">
            <Icon name="xmark" />
            Bayrak yanlış. Tekrar dene.
          </div>
        )}
      </div>
    </section>
  );
}
