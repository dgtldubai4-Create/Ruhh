"use client";
import { cx } from "@/lib/format";
import type { Accent } from "@/lib/store/types";
import { ACCENT } from "./accent";
import { CheckCircle, Info, Warning, XCircle } from "@phosphor-icons/react";

export function Tag({ accent = "grass", children, className, outline }: { accent?: Accent; children: React.ReactNode; className?: string; outline?: boolean }) {
  const a = ACCENT[accent];
  return <span className={cx("tag", outline ? "border border-line bg-card text-ink" : cx(a.soft, "text-ink"), className)}>{children}</span>;
}

export function SimTag({ children = "Simulated" }: { children?: React.ReactNode }) {
  return <span className="sim">{children}</span>;
}

export function Avatar({ initials, tone, size = 40, className }: { initials: string; tone: Accent; size?: number; className?: string }) {
  const a = ACCENT[tone];
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold text-ink", a.soft, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36), boxShadow: `inset 0 0 0 2px ${a.hex}` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Notice({ kind = "info", children, className }: { kind?: "info" | "success" | "error" | "warning"; children: React.ReactNode; className?: string }) {
  const Icon = kind === "success" ? CheckCircle : kind === "error" ? XCircle : kind === "warning" ? Warning : Info;
  return (
    <div role={kind === "error" ? "alert" : "status"} className={cx("flex items-start gap-2.5 rounded-input border border-line bg-paper-2 px-4 py-3 text-[14px] text-ink", className)}>
      <Icon size={20} weight="fill" className="mt-0.5 shrink-0 text-ink" />
      <div>{children}</div>
    </div>
  );
}

export function EmptyState({ title, body, action, art }: { title: string; body?: string; action?: React.ReactNode; art?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      {art ?? <PaperLeaf />}
      <div className="display-sm">{title}</div>
      {body && <p className="max-w-[40ch] text-[14.5px] text-stone">{body}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton rounded-input", className)} aria-hidden />;
}

export function Field({ label, help, error, children, htmlFor }: { label: string; help?: string; error?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? <p className="error-text" role="alert">{error}</p> : help ? <p className="help">{help}</p> : null}
    </div>
  );
}

export function Stat({ label, value, accent = "grass", small }: { label: string; value: React.ReactNode; accent?: Accent; small?: boolean }) {
  return (
    <div className={cx("rounded-card border border-line bg-card", small ? "px-4 py-3" : "px-5 py-4")}>
      <div className={cx("font-display font-bold tabular", small ? "text-[24px]" : "text-[32px]", "leading-none")}>{value}</div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-stone">
        <span className={cx("h-2 w-2 rounded-full", ACCENT[accent].bg)} aria-hidden />
        {label}
      </div>
    </div>
  );
}

export function Steps({ steps, current, accent = "grass", compact }: { steps: string[]; current: number; accent?: Accent; compact?: boolean }) {
  const a = ACCENT[accent];
  return (
    <ol className={cx("flex items-center", compact ? "gap-1.5" : "gap-2")} aria-label="Progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-2 min-w-0">
            <span
              className={cx("h-2.5 flex-1 rounded-pill transition-[background-color] duration-500", done || active ? a.bg : "bg-paper-3")}
              style={{ transitionDelay: `${i * 80}ms` }}
              aria-hidden
            />
            {!compact && <span className="sr-only">{`${s}${done ? " done" : active ? " current" : ""}`}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function ScoreRing({ score, size = 84, accent = "grass", label }: { score: number; size?: number; accent?: Accent; label?: string }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const a = ACCENT[accent];
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label ?? "Score"} ${score} out of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-paper-3)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={a.hex} strokeWidth={8} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * score) / 100}
          style={{ transition: "stroke-dashoffset 900ms var(--ease-out-soft)" }}
        />
      </svg>
      <span className="absolute font-display text-[22px] font-bold tabular">{score}</span>
    </div>
  );
}

/** Tiny decorative paper leaf used in empty states. */
export function PaperLeaf({ accent = "grass", size = 56 }: { accent?: Accent; size?: number }) {
  const a = ACCENT[accent];
  return (
    <span className="relative inline-block" style={{ width: size, height: size }} aria-hidden>
      <span className="absolute inset-0 rounded-[100%_0_100%_0] rotate-[-20deg]" style={{ background: a.softHex }} />
      <span className="absolute inset-[18%] rounded-[100%_0_100%_0] rotate-[-20deg]" style={{ background: a.hex }} />
    </span>
  );
}
