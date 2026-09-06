export type Market = "UAE" | "KSA";
export type Platform = "instagram" | "tiktok" | "youtube" | "snapchat";
export type Verification = "verified" | "pending" | "unverified";

export type Creator = {
  id: string;
  name: string;
  handle: string;
  city: string;
  market: Market;
  languages: string[];
  niches: string[];
  platforms: { platform: Platform; followers: number }[];
  avatar: { initials: string; tone: Accent; art?: string };
  verification: Verification;
  licenceId: string; // prototype-only fake advertiser licence
  bio: string;
  joinedAt: string;
  email: string;
  phone: string;
  address: string;
  shortlisted?: boolean;
};

export type Accent = "coral" | "sun" | "sky" | "berry" | "amber" | "mint" | "cocoa" | "grass";

export type Brand = {
  id: string;
  name: string;
  tagline: string;
  accent: Accent;
  category: string;
  sourceUrl: string;
  syncedAt: string;
  skuCount: number;
  syncStatus: "synced" | "partial" | "pending";
  packShape: "bottle" | "tube" | "jar" | "box" | "sachet" | "spray" | "carton";
  art?: string;
};

export type Product = {
  id: string;
  brandId: string;
  name: string;
  type: string;
  description: string;
  heroIngredient: string;
  sourceUrl: string;
  ksaAvailable: boolean;
  imageUrl?: string;
};

export type CampaignStage = "draft" | "inviting" | "active" | "review" | "publishing" | "completed";

export type Criterion = { id: string; label: string; weight: number; guidance: string };

export type InvitationStatus = "pending" | "accepted" | "declined";
export type Invitation = { creatorId: string; status: InvitationStatus; sentAt: string; respondedAt?: string };

export type Campaign = {
  id: string;
  title: string;
  brandId: string;
  productIds: string[];
  markets: Market[];
  stage: CampaignStage;
  objective: string;
  mustHave: string[];
  avoid: string[];
  tone: string;
  deliverable: string;
  criteria: Criterion[];
  deadline: string;
  extendedDeadline?: string;
  points: number;
  invitations: Invitation[];
  createdAt: string;
  ownerName: string;
};

export type SubmissionStatus = "analysing" | "in_review" | "changes_requested" | "approved";
export type ScoreBreakdown = { criterionId: string; score: number; note: string }[];
export type Comment = { id: string; author: string; role: "creator" | "reviewer"; text: string; at: string };

export type Submission = {
  id: string;
  campaignId: string;
  creatorId: string;
  version: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  score: number;
  breakdown: ScoreBreakdown;
  status: SubmissionStatus;
  comments: Comment[];
  script?: string;
  reviewedBy?: string;
};

export type Publication = {
  id: string;
  campaignId: string;
  creatorId: string;
  platform: Platform;
  url: string;
  postedAt: string;
  engagement: { views: number; likes: number; comments: number };
  verification: "pending" | "verified";
  pointsReleased: boolean;
};

export type QuestKind = "education" | "creative" | "community";
export type Quest = {
  id: string;
  brandId: string;
  title: string;
  kind: QuestKind;
  description: string;
  steps: string[];
  points: number;
  deadline: string;
  question?: { prompt: string; options: string[]; answer: number };
};

export type ParticipationStatus = "joined" | "submitted" | "in_review" | "completed";
export type Participation = {
  questId: string;
  creatorId: string;
  status: ParticipationStatus;
  joinedAt: string;
  submission?: { text: string; fileName?: string; at: string; answer?: number };
  feedback?: string;
};

export type LedgerType = "earned" | "spent" | "adjustment";
export type LedgerEntry = {
  id: string;
  creatorId: string;
  type: LedgerType;
  points: number;
  note: string;
  at: string;
  released: boolean;
  releasedAt?: string;
  refId?: string;
};

export type Reward = {
  id: string;
  name: string;
  brandId?: string;
  points: number;
  stock: number;
  category: "product" | "gear" | "learning" | "merch";
  description: string;
  accent: Accent;
  shape?: Brand["packShape"];
};

export type LogisticsStatus = "address_confirmed" | "preparing" | "dispatched" | "out_for_delivery" | "delivered";
export type Shipment = {
  id: string;
  creatorId: string;
  kind: "reward" | "product_kit";
  label: string;
  refId: string;
  status: LogisticsStatus;
  courier: string;
  tracking: string;
  address: string;
  history: { status: LogisticsStatus; at: string }[];
};

export type Redemption = { id: string; creatorId: string; rewardId: string; points: number; at: string; shipmentId: string };

export type Notification = {
  id: string;
  audience: "creator" | "admin";
  creatorId?: string;
  channel: "email" | "in_app";
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
};

export type Activity = { id: string; actor: string; text: string; at: string };

export type AdminRole = "super_admin" | "brand_manager" | "campaign_manager" | "content_reviewer" | "logistics" | "finance";

export type Session = { mode: "public" | "creator" | "admin"; creatorId: string; adminRole: AdminRole };

export type AppState = {
  version: number;
  seedVersion: string;
  session: Session;
  creators: Creator[];
  brands: Brand[];
  products: Product[];
  campaigns: Campaign[];
  submissions: Submission[];
  publications: Publication[];
  quests: Quest[];
  participations: Participation[];
  ledger: LedgerEntry[];
  rewards: Reward[];
  redemptions: Redemption[];
  shipments: Shipment[];
  notifications: Notification[];
  activity: Activity[];
};
