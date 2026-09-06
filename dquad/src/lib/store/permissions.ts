import type { AdminRole } from "./types";

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  brand_manager: "Brand Manager",
  campaign_manager: "Campaign Manager",
  content_reviewer: "Content Reviewer",
  logistics: "Logistics",
  finance: "Finance",
};

export type Capability =
  | "campaign.edit" | "campaign.stage" | "creator.invite" | "creator.verify" | "review.decide" | "logistics.advance" | "loyalty.release" | "loyalty.adjust" | "rewards.stock" | "products.edit" | "finance.view";

const MATRIX: Record<AdminRole, Capability[]> = {
  super_admin: ["campaign.edit", "campaign.stage", "creator.invite", "creator.verify", "review.decide", "logistics.advance", "loyalty.release", "loyalty.adjust", "rewards.stock", "products.edit", "finance.view"],
  brand_manager: ["campaign.edit", "campaign.stage", "creator.invite", "review.decide", "products.edit", "finance.view"],
  campaign_manager: ["campaign.edit", "campaign.stage", "creator.invite"],
  content_reviewer: ["review.decide"],
  logistics: ["logistics.advance"],
  finance: ["loyalty.release", "loyalty.adjust", "rewards.stock", "finance.view"],
};

export function can(role: AdminRole, cap: Capability): boolean {
  return MATRIX[role].includes(cap);
}

export const CAPABILITY_LABELS: Record<Capability, string> = {
  "campaign.edit": "Create and edit campaigns",
  "campaign.stage": "Move campaign stages",
  "creator.invite": "Shortlist and invite creators",
  "creator.verify": "Change creator verification",
  "review.decide": "Approve or request changes",
  "logistics.advance": "Advance parcels",
  "loyalty.release": "Verify posts and release points",
  "loyalty.adjust": "Adjust balances",
  "rewards.stock": "Manage reward stock",
  "products.edit": "Edit product availability",
  "finance.view": "See the points liability view",
};
