import type { ReactNode } from "react";

type NoticeTone = "error" | "info";

const toneClasses: Record<NoticeTone, string> = {
  error: "border-red-400/30 bg-red-400/10 text-red-200",
  info: "border-white/10 bg-white/5 text-mist-300",
};

export function Notice({
  children,
  tone = "error",
}: {
  children: ReactNode;
  tone?: NoticeTone;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]}`}
    >
      {children}
    </div>
  );
}
