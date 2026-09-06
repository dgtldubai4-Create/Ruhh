"use client";
import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";
import { cx } from "@/lib/format";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Expandable paper row. The summary is the toggle; anything interactive
 * goes in `actions`, rendered beside the toggle so buttons never nest.
 */
export function ExpandRow({ open, onToggle, summary, actions, children, className, accentHex, bodyClassName }: {
  open: boolean;
  onToggle: () => void;
  summary: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  accentHex?: string;
  bodyClassName?: string;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <article className={cx("card overflow-hidden transition-colors duration-200", open && "border-ink", className)}>
      <div className="flex items-stretch">
        <button type="button" className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-start sm:px-5" aria-expanded={open} aria-controls={id} onClick={onToggle}>
          {accentHex && <span className="h-10 w-1.5 shrink-0 rounded-pill" style={{ background: accentHex }} aria-hidden />}
          <div className="min-w-0 flex-1">{summary}</div>
          <CaretDown size={18} weight="bold" className={cx("shrink-0 text-stone transition-transform duration-200", open && "rotate-180")} aria-hidden />
        </button>
        {actions && <div className="flex shrink-0 items-center gap-1.5 pe-3 sm:pe-4">{actions}</div>}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="body"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="overflow-hidden"
          >
            <div className={cx("border-t border-line px-4 py-4 sm:px-5", bodyClassName)}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

/** Small toggle-and-reveal used for "show more" blocks inside cards. */
export function Collapse({ open, children }: { open: boolean; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.24, ease: EASE }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
