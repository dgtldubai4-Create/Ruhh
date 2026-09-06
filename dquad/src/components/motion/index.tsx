"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type Variants } from "motion/react";
import { cx } from "@/lib/format";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const noop = () => () => {};
/**
 * Reduced-motion flag that is false during server render and hydration, then
 * true after mount when the user prefers reduced motion. Keeps markup identical
 * between server and client so hydration never mismatches.
 */
export function useReduce(): boolean {
  const pref = useReducedMotion();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  return Boolean(pref) && mounted;
}

/** Section reveal on scroll: opacity + rise, once. */
export function Reveal({ children, className, delay = 0, y = 24, as = "div", amount = 0.25 }: { children: React.ReactNode; className?: string; delay?: number; y?: number; as?: "div" | "section" | "li" | "article" | "header"; amount?: number }) {
  const reduce = useReduce();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

const containerV: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const itemV: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

/** Staggered entrance for lists of cards. Children must be StaggerItem. */
export function Stagger({ children, className, as = "div", amount = 0.15 }: { children: React.ReactNode; className?: string; as?: "div" | "ul" | "ol"; amount?: number }) {
  const reduce = useReduce();
  const Comp = motion[as];
  return (
    <Comp className={className} variants={containerV} initial={reduce ? "show" : "hidden"} whileInView="show" viewport={{ once: true, amount }}>
      {children}
    </Comp>
  );
}
export function StaggerItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" | "article" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={itemV}>
      {children}
    </Comp>
  );
}

/** 3D tilt following the pointer. Motion values only, no React state per frame. */
export function Tilt({ children, className, max = 10, scale = 1.02 }: { children: React.ReactNode; className?: string; max?: number; scale?: number }) {
  const reduce = useReduce();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 22 });
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 22 });
  const [hover, setHover] = useState(false);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={cx("relative preserve-3d", className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      animate={{ scale: hover ? scale : 1 }}
      transition={{ duration: 0.25, ease: EASE }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-linked vertical parallax. speed 0.2 moves 20% of scroll distance. */
export function Parallax({ children, className, speed = 0.2, rotate = 0 }: { children: React.ReactNode; className?: string; speed?: number; rotate?: number }) {
  const reduce = useReduce();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 160, -speed * 160]);
  const r = useTransform(scrollYProgress, [0, 1], [-rotate, rotate]);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ y, rotate: r }}>
      {children}
    </motion.div>
  );
}

/** Number that counts up when it enters the viewport. */
export function Counter({ value, className, duration = 1.4, format = (n: number) => new Intl.NumberFormat("en-GB").format(Math.round(n)) }: { value: number; className?: string; duration?: number; format?: (n: number) => string }) {
  const reduce = useReduce();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, duration, reduce]);
  const display = reduce ? value : value * progress;
  return (
    <span ref={ref} className={cx("tabular", className)}>
      {format(display)}
    </span>
  );
}

/** Paper confetti burst for reward moments. Renders nothing under reduced motion. */
export function PaperBurst({ trigger, colors = ["#f26b4f", "#f4c542", "#6fb6e8", "#2f7d3b", "#b84b7a"] }: { trigger: number; colors?: string[] }) {
  const reduce = useReduce();
  if (reduce || !trigger) return null;
  const pieces = Array.from({ length: 26 }, (_, i) => {
    const angle = (i / 26) * Math.PI * 2;
    const dist = 90 + ((i * 37) % 70);
    return { id: `${trigger}-${i}`, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist - 40, color: colors[i % colors.length], rot: (i * 53) % 360, w: 6 + (i % 3) * 3, h: 10 + (i % 4) * 3 };
  });
  return (
    <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-[2px]"
          style={{ width: p.w, height: p.h, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: p.x, y: p.y + 80, opacity: 0, rotate: p.rot, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </span>
  );
}

/** Press feedback wrapper for cards that act as buttons. */
export function Pressable({ children, className, onClick, as = "button", ariaLabel }: { children: React.ReactNode; className?: string; onClick?: () => void; as?: "button" | "div"; ariaLabel?: string }) {
  const Comp = as === "button" ? motion.button : motion.div;
  return (
    <Comp className={className} onClick={onClick} whileTap={{ scale: 0.985 }} whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: EASE }} aria-label={ariaLabel}>
      {children}
    </Comp>
  );
}
