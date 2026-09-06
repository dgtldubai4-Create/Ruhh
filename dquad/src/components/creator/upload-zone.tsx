"use client";
import { useId, useRef, useState } from "react";
import { FileVideo, UploadSimple } from "@phosphor-icons/react";
import { Skeleton, SimTag } from "@/components/ui/primitives";
import { cx, fmtBytes } from "@/lib/format";

/**
 * Real file input plus a drop zone. The parent owns what happens with the
 * file; this component only handles picking and the analysing skeleton.
 */
export function UploadZone({ onFile, analysing, label = "Upload your cut", hint = "MP4 or MOV, vertical. The file stays on your device, only the name and size are recorded.", disabled, accept = "video/*,.mp4,.mov" }: { onFile: (file: File) => void; analysing: boolean; label?: string; hint?: string; disabled?: boolean; accept?: string }) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [picked, setPicked] = useState<{ name: string; size: number } | null>(null);

  const handle = (file?: File | null) => {
    if (!file || disabled || analysing) return;
    setPicked({ name: file.name, size: file.size });
    onFile(file);
  };

  if (analysing) {
    return (
      <div className="rounded-card border-2 border-dashed border-line-strong bg-paper-2/60 p-5" aria-busy="true" aria-live="polite">
        <div className="flex items-center gap-3">
          <FileVideo size={28} weight="fill" className="shrink-0 text-ink" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14.5px] font-semibold">{picked?.name ?? "Your file"}</div>
            <div className="text-[12.5px] text-stone">{picked ? fmtBytes(picked.size) : ""} Watching the first three seconds, the pack, the tone, the arc and the audio.</div>
          </div>
          <SimTag>Analysing</SimTag>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-[96px] w-[96px] shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx("relative rounded-card border-2 border-dashed p-5 text-center transition-colors duration-200", over ? "border-grass bg-grass-soft/50" : "border-line-strong bg-paper-2/40", disabled && "opacity-60")}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card text-ink" style={{ boxShadow: "inset 0 0 0 2px var(--color-ink)" }} aria-hidden>
        <UploadSimple size={26} weight="bold" />
      </span>
      <label htmlFor={id} className="mt-3 block cursor-pointer text-[15px] font-semibold text-ink">
        {label}
      </label>
      <p className="mx-auto mt-1 max-w-[42ch] text-[13px] text-stone">{hint}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button type="button" className="btn-ink btn-sm" onClick={() => inputRef.current?.click()} disabled={disabled}>
          <UploadSimple size={16} weight="bold" /> Choose a file
        </button>
        <span className="text-[12.5px] text-stone">or drop it here</span>
      </div>
    </div>
  );
}
