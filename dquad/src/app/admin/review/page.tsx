"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shell/portal-shell";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import type { SubmissionStatus } from "@/lib/store/types";
import { useLang } from "@/lib/i18n/provider";
import { EmptyState } from "@/components/ui/primitives";
import { Stagger, StaggerItem } from "@/components/motion";
import { PageSkeleton } from "@/components/admin/section";
import { Pills } from "@/components/admin/pills";
import { ReviewRow } from "@/components/admin/review-row";
import { RoleLine, RoleNotice } from "@/components/admin/role-gate";
import { SUBMISSION_STATUS_LABEL } from "@/components/admin/helpers";

const ORDER: Record<SubmissionStatus, number> = { in_review: 0, changes_requested: 1, approved: 2, analysing: 3 };
const STATUSES: SubmissionStatus[] = ["in_review", "changes_requested", "approved"];

export default function ReviewPage() {
  return (
    <Suspense fallback={<PageSkeleton rows={2} />}>
      <ReviewInner />
    </Suspense>
  );
}

function ReviewInner() {
  const s = useAppState();
  const hydrated = useHydrated();
  const { t } = useLang();
  const search = useSearchParams();
  const [campaign, setCampaign] = useState(search.get("campaign") ?? "");
  const [status, setStatus] = useState<SubmissionStatus | "">("");
  const [open, setOpen] = useState<string | null>(null);

  const all = useMemo(() => s.submissions.filter((x) => x.version > 0), [s.submissions]);
  const list = useMemo(
    () =>
      all
        .filter((x) => (!campaign || x.campaignId === campaign) && (!status || x.status === status))
        .sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.uploadedAt.localeCompare(a.uploadedAt)),
    [all, campaign, status],
  );

  if (!hydrated) return <PageSkeleton rows={2} />;

  const campaignsWithCuts = s.campaigns.filter((c) => all.some((x) => x.campaignId === c.id));
  const waiting = all.filter((x) => x.status === "in_review").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Review queue" lede={waiting ? `${waiting} ${waiting === 1 ? "cut is" : "cuts are"} waiting for a human read. Scores are a simulated first pass, your notes are the real feedback.` : "Nothing is waiting. New uploads land here with a simulated score."}>
        <RoleLine caps={["review.decide"]} className="mt-3" />
      </PageHeader>
      <RoleNotice cap="review.decide" />

      <div className="flex flex-col gap-2">
        <Pills label="Campaign" allLabel={t.common.all} value={campaign} onChange={setCampaign} options={campaignsWithCuts.map((c) => ({ value: c.id, label: c.title, count: all.filter((x) => x.campaignId === c.id).length }))} />
        <Pills label="Status" allLabel={t.common.all} value={status} onChange={setStatus} options={STATUSES.map((st) => ({ value: st, label: SUBMISSION_STATUS_LABEL[st], count: all.filter((x) => x.status === st).length }))} />
      </div>

      {list.length === 0 ? (
        <EmptyState title="No cuts match" body="Clear a filter, or wait for a creator to upload." />
      ) : (
        <Stagger className="flex flex-col gap-2" amount={0.05}>
          {list.map((sub) => (
            <StaggerItem key={sub.id}>
              <ReviewRow s={s} sub={sub} open={open === sub.id} onToggle={() => setOpen(open === sub.id ? null : sub.id)} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
