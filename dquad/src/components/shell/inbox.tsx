"use client";
import { useMemo, useState } from "react";
import { Bell, EnvelopeSimple, ChatCircleDots } from "@phosphor-icons/react";
import Link from "next/link";
import { Drawer } from "@/components/ui/overlays";
import { SimTag } from "@/components/ui/primitives";
import { useAppState } from "@/lib/store/hooks";
import { markNotificationRead, markNotificationsRead } from "@/lib/store/actions";
import { useLang } from "@/lib/i18n/provider";
import { timeAgo, cx } from "@/lib/format";

export function InboxButton({ audience }: { audience: "creator" | "admin" }) {
  const s = useAppState();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const items = useMemo(
    () => s.notifications.filter((n) => n.audience === audience && (audience === "admin" || n.creatorId === s.session.creatorId)),
    [s.notifications, audience, s.session.creatorId],
  );
  const unread = items.filter((n) => !n.read).length;
  return (
    <>
      <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-pill border border-line bg-card text-ink hover:bg-paper-2" onClick={() => setOpen(true)} aria-label={`${t.common.inbox}, ${unread} unread`}>
        <Bell size={20} weight={unread ? "fill" : "regular"} />
        {unread > 0 && (
          <span className="anim-pop absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-pill bg-coral px-1 text-[11px] font-bold text-card" aria-hidden>
            {unread}
          </span>
        )}
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title={
          <span className="flex items-center gap-2">
            {t.common.inbox} <SimTag>{t.common.simulated}</SimTag>
          </span>
        }
        footer={
          <button className="btn-paper btn-sm w-full" onClick={() => markNotificationsRead(audience, s.session.creatorId)} disabled={!unread}>
            {t.common.markAllRead}
          </button>
        }
      >
        {items.length === 0 ? (
          <p className="text-[14px] text-stone">{t.common.empty}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href ?? "#"}
                  onClick={() => {
                    markNotificationRead(n.id);
                    setOpen(false);
                  }}
                  className={cx("block rounded-card border px-4 py-3 transition-colors hover:bg-paper-2", n.read ? "border-line bg-card" : "border-line-strong bg-card")}
                >
                  <div className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wide text-stone">
                    {n.channel === "email" ? <EnvelopeSimple size={14} weight="bold" /> : <ChatCircleDots size={14} weight="bold" />}
                    {n.channel === "email" ? t.common.email : t.common.inApp}
                    <span className="ms-auto normal-case tracking-normal">{timeAgo(n.at)}</span>
                  </div>
                  <div className={cx("mt-1 text-[14.5px]", !n.read && "font-semibold")}>{n.title}</div>
                  <div className="mt-0.5 text-[13px] text-stone">{n.body}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </>
  );
}
