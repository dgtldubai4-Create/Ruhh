"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DotsThreeCircle, ArrowsLeftRight, ArrowCounterClockwise, SignOut } from "@phosphor-icons/react";
import { Drawer, Sheet, useToast } from "@/components/ui/overlays";
import { Avatar, SimTag } from "@/components/ui/primitives";
import { LangSwitch } from "./lang-switch";
import { useAppState } from "@/lib/store/hooks";
import { resetDemo, setAdminRole, setSession } from "@/lib/store/actions";
import { ROLE_LABELS, CAPABILITY_LABELS, can, type Capability } from "@/lib/store/permissions";
import type { AdminRole } from "@/lib/store/types";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";

const ROLES = Object.keys(ROLE_LABELS) as AdminRole[];
const CAPS = Object.keys(CAPABILITY_LABELS) as Capability[];

export function RoleMenu({ mode }: { mode: "creator" | "admin" }) {
  const s = useAppState();
  const { t } = useLang();
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const creator = s.creators.find((c) => c.id === s.session.creatorId);

  return (
    <>
      <button className="inline-flex h-10 items-center gap-2 rounded-pill border border-line bg-card ps-1 pe-3 text-[13.5px] font-semibold hover:bg-paper-2" onClick={() => setOpen(true)} aria-label="Menu">
        {mode === "creator" && creator ? <Avatar initials={creator.avatar.initials} tone={creator.avatar.tone} size={32} /> : <DotsThreeCircle size={30} weight="fill" className="text-ink" />}
        <span className="hidden whitespace-nowrap sm:inline">{mode === "creator" ? creator?.name.split(" ")[0] : ROLE_LABELS[s.session.adminRole]}</span>
      </button>

      <Drawer open={open} onClose={() => setOpen(false)} title={mode === "creator" ? creator?.name : t.admin.role}>
        <div className="flex flex-col gap-5">
          <div>
            <div className="label">{t.common.language}</div>
            <LangSwitch />
          </div>

          {mode === "admin" && (
            <div>
              <div className="label">{t.common.switchRole}</div>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button key={r} onClick={() => setAdminRole(r)} aria-pressed={s.session.adminRole === r} className={cx("rounded-pill border px-3 py-1.5 text-[13px] font-semibold transition-colors", s.session.adminRole === r ? "border-ink bg-ink text-paper" : "border-line bg-card hover:bg-paper-2")}>
                    {ROLE_LABELS[r]}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-card border border-line bg-card p-4">
                <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
                  {t.admin.permissions} <SimTag>{t.common.simulated}</SimTag>
                </div>
                <ul className="flex flex-col gap-1.5 text-[13px]">
                  {CAPS.map((c) => {
                    const ok = can(s.session.adminRole, c);
                    return (
                      <li key={c} className={cx("flex items-center gap-2", !ok && "text-stone-soft line-through")}>
                        <span className={cx("h-2 w-2 rounded-full", ok ? "bg-grass" : "bg-paper-3")} aria-hidden />
                        {CAPABILITY_LABELS[c]}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              className="btn-paper justify-start"
              onClick={() => {
                setOpen(false);
                if (mode === "creator") {
                  setSession({ mode: "admin" });
                  router.push("/admin");
                } else {
                  setSession({ mode: "creator" });
                  router.push("/creator");
                }
              }}
            >
              <ArrowsLeftRight size={18} weight="bold" /> {mode === "creator" ? t.nav.brandView : t.nav.creatorView}
            </button>
            <button className="btn-paper justify-start" onClick={() => setConfirmReset(true)}>
              <ArrowCounterClockwise size={18} weight="bold" /> {t.common.resetDemo}
            </button>
            <button
              className="btn-ghost justify-start"
              onClick={() => {
                setSession({ mode: "public" });
                setOpen(false);
                router.push("/");
              }}
            >
              <SignOut size={18} weight="bold" /> {t.common.signOut}
            </button>
          </div>
          <p className="text-[12px] text-stone">{t.footer.legal}</p>
        </div>
      </Drawer>

      <Sheet
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title={t.common.resetDemo}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setConfirmReset(false)}>{t.common.cancel}</button>
            <button
              className="btn-ink"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
                setOpen(false);
                toast("Demo reset", "Every record is back to the seeded scenario.");
                router.push(mode === "creator" ? "/creator" : "/admin");
              }}
            >
              {t.common.confirm}
            </button>
          </>
        }
      >
        <p className="text-[14.5px] text-stone">This restores every campaign, submission, point and parcel to the seeded state. Your language choice stays.</p>
      </Sheet>
    </>
  );
}
