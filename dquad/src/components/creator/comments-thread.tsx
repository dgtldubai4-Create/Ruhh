"use client";
import { useState } from "react";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/primitives";
import { useLang } from "@/lib/i18n/provider";
import { cx, fmtDateTime } from "@/lib/format";
import type { Comment, Creator } from "@/lib/store/types";

/** Notes between the reviewer and the creator on one version, with a reply box. */
export function CommentsThread({ comments, creator, onReply, placeholder = "Reply to the reviewer" }: { comments: Comment[]; creator: Creator; onReply: (text: string) => void; placeholder?: string }) {
  const { lang } = useLang();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = () => {
    if (text.trim().length < 2) {
      setError("Write a line first.");
      return;
    }
    onReply(text.trim());
    setText("");
    setError(null);
  };

  return (
    <div>
      {comments.length === 0 ? (
        <p className="rounded-input border border-dashed border-line-strong px-4 py-3 text-[13.5px] text-stone">No notes on this version yet. Reviewers usually reply within a day in this simulation.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {comments.map((cm) => {
            const mine = cm.role === "creator";
            const initials = cm.author
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();
            return (
              <li key={cm.id} className={cx("flex items-start gap-3", mine && "flex-row-reverse")}>
                <Avatar initials={mine ? creator.avatar.initials : initials} tone={mine ? creator.avatar.tone : "grass"} size={34} />
                <div className={cx("max-w-[85%] rounded-card px-4 py-3", mine ? "rounded-te-md bg-paper-2" : "rounded-ts-md border border-line bg-card")}>
                  <div className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-stone">
                    <span className="font-semibold text-ink">{mine ? "You" : cm.author}</span>
                    <span>{mine ? "" : "Reviewer"}</span>
                    <span className="ms-auto">{fmtDateTime(cm.at, lang)}</span>
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink">{cm.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <form
        className="mt-4"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label htmlFor="reply" className="label">
          Your reply
        </label>
        <div className="flex items-start gap-2">
          <textarea
            id="reply"
            className={cx("field min-h-[52px] flex-1 resize-y", error && "field-error")}
            rows={2}
            placeholder={placeholder}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
            }}
            aria-invalid={Boolean(error)}
          />
          <button type="submit" className="btn-ink shrink-0 px-4" aria-label="Send reply">
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </div>
        {error ? <p className="error-text" role="alert">{error}</p> : <p className="help">Reviewers get a note in their queue. Ctrl or Cmd + Enter sends.</p>}
      </form>
    </div>
  );
}
