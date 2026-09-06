"use client";
import { useAppState } from "@/lib/store/hooks";
import { can, CAPABILITY_LABELS, ROLE_LABELS, type Capability } from "@/lib/store/permissions";
import { Notice, SimTag } from "@/components/ui/primitives";
import { useLang } from "@/lib/i18n/provider";
import { cx } from "@/lib/format";
import { SUPER_ADMIN_NAME } from "./helpers";

/** The acting admin: role, display name used as the actor on mutations, and a capability check. */
export function useActor() {
  const s = useAppState();
  const role = s.session.adminRole;
  const actor = role === "super_admin" ? SUPER_ADMIN_NAME : ROLE_LABELS[role];
  return { role, actor, roleLabel: ROLE_LABELS[role], allowed: (cap: Capability) => can(role, cap) };
}

/** Plain explanation shown in place of a control the current role cannot use. Renders nothing when allowed. */
export function RoleNotice({ cap, className }: { cap: Capability; className?: string }) {
  const { roleLabel, allowed } = useActor();
  const { t } = useLang();
  if (allowed(cap)) return null;
  return (
    <Notice kind="info" className={className}>
      <span className="font-semibold">{roleLabel}</span> cannot {CAPABILITY_LABELS[cap].toLowerCase()} here. Switch role from the menu to try it.{" "}
      <SimTag>{t.common.simulated}</SimTag>
    </Notice>
  );
}

/** One line naming the active role and what it can do on this page. */
export function RoleLine({ caps, className }: { caps: Capability[]; className?: string }) {
  const { roleLabel, allowed } = useActor();
  const { t } = useLang();
  const yes = caps.filter(allowed);
  const no = caps.filter((c) => !allowed(c));
  return (
    <p className={cx("text-[13.5px] text-stone", className)}>
      <span className="font-semibold text-ink">{t.admin.role}: {roleLabel}.</span>{" "}
      {yes.length ? `Can ${yes.map((c) => CAPABILITY_LABELS[c].toLowerCase()).join(", ")}.` : "Read-only on this page."}
      {no.length > 0 && yes.length > 0 && ` Cannot ${no.map((c) => CAPABILITY_LABELS[c].toLowerCase()).join(", ")}.`}
    </p>
  );
}
