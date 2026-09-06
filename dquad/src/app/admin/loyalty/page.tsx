"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PageHeader } from "@/components/shell/portal-shell";
import { useAppState, useHydrated } from "@/lib/store/hooks";
import { useLang } from "@/lib/i18n/provider";
import { PageSkeleton } from "@/components/admin/section";
import { Tabs } from "@/components/admin/pills";
import { RoleLine } from "@/components/admin/role-gate";
import { Balances, Finance, QuestReviews, Redemptions, RewardStock, VerifyPosts } from "@/components/admin/loyalty-sections";

type Tab = "posts" | "quests" | "balances" | "rewards" | "redemptions" | "finance";
const TABS: Tab[] = ["posts", "quests", "balances", "rewards", "redemptions", "finance"];

export default function LoyaltyPage() {
  return (
    <Suspense fallback={<PageSkeleton rows={4} />}>
      <LoyaltyInner />
    </Suspense>
  );
}

function LoyaltyInner() {
  const s = useAppState();
  const hydrated = useHydrated();
  const { t } = useLang();
  const reduce = useReducedMotion();
  const search = useSearchParams();
  const initial = search.get("tab") as Tab | null;
  const [tab, setTab] = useState<Tab>(initial && TABS.includes(initial) ? initial : "posts");

  if (!hydrated) return <PageSkeleton rows={4} />;

  const postsWaiting = s.publications.filter((p) => !p.pointsReleased).length;
  const questsWaiting = s.participations.filter((p) => p.status === "in_review" || p.status === "submitted").length;
  const outOfStock = s.rewards.filter((r) => r.stock === 0).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={t.admin.loyalty} lede="Points move from pending to available here. Verify the post, release the points, keep the catalogue honest.">
        <RoleLine caps={["loyalty.release", "loyalty.adjust", "rewards.stock", "finance.view"]} className="mt-3" />
      </PageHeader>

      <Tabs
        label="Loyalty sections"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "posts", label: "Verify posts", count: postsWaiting },
          { value: "quests", label: "Quest reviews", count: questsWaiting },
          { value: "balances", label: "Balances" },
          { value: "rewards", label: "Rewards and stock", count: outOfStock },
          { value: "redemptions", label: "Redemptions", count: s.redemptions.length },
          { value: "finance", label: "Finance" },
        ]}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === "posts" && <VerifyPosts s={s} />}
          {tab === "quests" && <QuestReviews s={s} />}
          {tab === "balances" && <Balances s={s} />}
          {tab === "rewards" && <RewardStock s={s} />}
          {tab === "redemptions" && <Redemptions s={s} />}
          {tab === "finance" && <Finance s={s} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
