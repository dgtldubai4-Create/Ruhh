"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Envelope, Megaphone, Trophy } from "@phosphor-icons/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { EmptyState } from "@/components/ui/primitives";
import { useLang } from "@/lib/i18n/provider";
import { useCreator, campaignJourney } from "@/components/creator/helpers";
import { CampaignCard } from "@/components/creator/campaign-card";
import { InvitationSheet, type InvitationDecision } from "@/components/creator/invitation-sheet";

export default function CreatorCampaigns() {
  const { s, creator, creatorId } = useCreator();
  const { t } = useLang();
  const [request, setRequest] = useState<InvitationDecision | null>(null);

  const groups = useMemo(() => {
    const mine = s.campaigns.filter((c) => c.invitations.some((i) => i.creatorId === creatorId)).map((c) => ({ c, j: campaignJourney(s, c, creatorId) }));
    return {
      invitations: mine.filter((x) => x.j.pending),
      inProgress: mine.filter((x) => x.j.accepted && !x.j.complete),
      completed: mine.filter((x) => x.j.accepted && x.j.complete),
      declined: mine.filter((x) => x.j.declined),
    };
  }, [s, creatorId]);

  const sections: { key: string; title: string; icon: typeof Envelope; items: typeof groups.invitations; empty: string }[] = [
    { key: "inv", title: "Invitations", icon: Envelope, items: groups.invitations, empty: "No open invitations. Brand teams send them when a brief fits your feed." },
    { key: "prog", title: "In progress", icon: Megaphone, items: groups.inProgress, empty: "Nothing in progress. Accept an invitation and it moves here." },
    { key: "done", title: "Completed", icon: Trophy, items: groups.completed, empty: "Your first completed campaign will sit here, with its result." },
  ];

  return (
    <div>
      <PageHeader title={t.creator.campaigns} lede="Every brief you have been sent, where it stands, and what happens next. Accepting is always your call." />

      <div className="flex flex-col gap-12">
        {sections.map((sec) => (
          <Reveal key={sec.key} as="section" amount={0.05} y={16}>
            <div className="mb-4 flex items-end gap-3">
              <div>
                <h2 className="display-md flex items-center gap-2">
                  <sec.icon size={24} weight="fill" className="text-grass" /> {sec.title}
                  <span className="ms-1 font-display text-[16px] font-semibold text-stone">{sec.items.length}</span>
                </h2>
              </div>
            </div>
            {sec.items.length === 0 ? (
              <EmptyState title={t.common.empty} body={sec.empty} action={sec.key !== "inv" ? undefined : <Link href="/creator/quests" className="btn-paper btn-sm">Try a side quest meanwhile</Link>} />
            ) : (
              <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {sec.items.map(({ c }) => (
                  <StaggerItem key={c.id}>
                    <CampaignCard s={s} campaign={c} creatorId={creatorId} onAccept={(cc) => setRequest({ campaign: cc, decision: "accepted" })} onDecline={(cc) => setRequest({ campaign: cc, decision: "declined" })} />
                  </StaggerItem>
                ))}
              </Stagger>
            )}
          </Reveal>
        ))}

        {groups.declined.length > 0 && (
          <Reveal as="section" amount={0.05} y={16}>
            <div className="mb-4">
              <h2 className="display-md">Passed on</h2>
            </div>
            <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {groups.declined.map(({ c }) => (
                <StaggerItem key={c.id}>
                  <CampaignCard s={s} campaign={c} creatorId={creatorId} className="opacity-80" />
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        )}
      </div>

      <InvitationSheet request={request} creator={creator} onClose={() => setRequest(null)} />
    </div>
  );
}
