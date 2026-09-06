"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X, CheckCircle, Info } from "@phosphor-icons/react";
import { cx } from "@/lib/format";
import { useLang } from "@/lib/i18n/provider";

/* ------------------------------------------------------------------ */
/* Toasts                                                               */
/* ------------------------------------------------------------------ */
type Toast = { id: number; title: string; body?: string; kind: "success" | "info" };
type ToastCtx = { toast: (title: string, body?: string, kind?: Toast["kind"]) => void };
const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const toast = useCallback((title: string, body?: string, kind: Toast["kind"] = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, title, body, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex max-w-[420px] items-start gap-3 rounded-card border-2 border-ink bg-card px-4 py-3"
              style={{ boxShadow: "5px 5px 0 0 var(--color-ink)" }}
            >
              {t.kind === "success" ? <CheckCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-grass" /> : <Info size={22} weight="fill" className="mt-0.5 shrink-0 text-ink" />}
              <div>
                <div className="text-[14.5px] font-semibold">{t.title}</div>
                {t.body && <div className="text-[13px] text-stone">{t.body}</div>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast outside ToastProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Drawer (side panel) and Sheet (centered confirmation)               */
/* ------------------------------------------------------------------ */
function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
}

export function Drawer({ open, onClose, title, children, width = 440, footer }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; width?: number; footer?: React.ReactNode }) {
  useEscape(open, onClose);
  const reduce = useReducedMotion();
  const { dir, t } = useLang();
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>("button, [href], input, textarea, select")?.focus();
  }, [open]);
  const fromX = dir === "rtl" ? "-100%" : "100%";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label={t.common.close}
            className="fixed inset-0 z-[70] bg-ink/30"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog" aria-modal="true"
            className="fixed inset-y-0 end-0 z-[71] flex w-full flex-col border-s border-line bg-paper"
            style={{ maxWidth: width }}
            initial={reduce ? { opacity: 0 } : { x: fromX }} animate={reduce ? { opacity: 1 } : { x: 0 }} exit={reduce ? { opacity: 0 } : { x: fromX }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="display-sm">{title}</div>
              <button className="btn-ghost btn-sm -me-2 px-2" onClick={onClose} aria-label={t.common.close}>
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && <div className="border-t border-line px-5 py-4">{footer}</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Sheet({ open, onClose, title, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; size?: "md" | "lg" }) {
  useEscape(open, onClose);
  const reduce = useReducedMotion();
  const { t } = useLang();
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[72] flex items-end justify-center sm:items-center sm:p-6">
          <motion.button
            aria-label={t.common.close} className="absolute inset-0 bg-ink/30"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose}
          />
          <motion.div
            role="dialog" aria-modal="true"
            className={cx("relative flex max-h-[92dvh] w-full flex-col rounded-t-card border-2 border-ink bg-card sm:rounded-card", size === "lg" ? "sm:max-w-[760px]" : "sm:max-w-[520px]")}
            style={{ boxShadow: "8px 8px 0 0 var(--color-ink)" }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between gap-3 px-6 pt-5">
              <div className="display-sm">{title}</div>
              <button className="btn-ghost btn-sm -me-2 px-2" onClick={onClose} aria-label={t.common.close}>
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
