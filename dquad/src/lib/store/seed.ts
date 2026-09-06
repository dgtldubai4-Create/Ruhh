import type { AppState, Brand, Campaign, Creator, Product, Quest, Reward } from "./types";
import { CRITERIA, scoreSubmission } from "./scoring";

export const SEED_VERSION = "2026-09-06.1";
export const DEMO_CREATOR_ID = "cr_layla";
export const CATALOGUE_SOURCE = "https://www.daburinternational.com/";
export const CATALOGUE_SYNCED_AT = "2026-09-06T08:00:00Z";

const d = (iso: string) => new Date(iso).toISOString();

const creators: Creator[] = [
  {
    id: "cr_layla", name: "Layla Al Mansoori", handle: "@layla.makes", city: "Dubai", market: "UAE",
    languages: ["English", "Arabic"], niches: ["Haircare", "Beauty", "Everyday life"],
    platforms: [{ platform: "instagram", followers: 84_300 }, { platform: "tiktok", followers: 121_900 }],
    avatar: { initials: "LA", tone: "coral" }, verification: "verified", licenceId: "PROTO-UAE-4471",
    bio: "Slow mornings, honest hair routines and a lot of tea. Filming from Jumeirah since 2021.",
    joinedAt: d("2026-02-14"), email: "layla@example.com", phone: "+971 50 000 0000",
    address: "Villa 12, Street 8b, Jumeirah 1, Dubai",
  },
  {
    id: "cr_omar", name: "Omar Haddad", handle: "@omar.moves", city: "Abu Dhabi", market: "UAE",
    languages: ["Arabic", "English"], niches: ["Fitness", "Wellness"],
    platforms: [{ platform: "instagram", followers: 46_200 }, { platform: "youtube", followers: 19_800 }],
    avatar: { initials: "OH", tone: "sky" }, verification: "verified", licenceId: "PROTO-UAE-2210",
    bio: "Corniche runs at sunrise, home workouts for busy people.", joinedAt: d("2026-03-02"),
    email: "omar@example.com", phone: "+971 55 000 0001", address: "Al Reem Island, Abu Dhabi",
  },
  {
    id: "cr_noor", name: "Noor Al Qahtani", handle: "@noor.athome", city: "Riyadh", market: "KSA",
    languages: ["Arabic"], niches: ["Family", "Home", "Everyday life"],
    platforms: [{ platform: "snapchat", followers: 210_000 }, { platform: "instagram", followers: 63_000 }],
    avatar: { initials: "NQ", tone: "berry" }, verification: "verified", licenceId: "PROTO-KSA-9032",
    bio: "Three kids, one kitchen, endless little rituals.", joinedAt: d("2026-01-20"),
    email: "noor@example.com", phone: "+966 50 000 0002", address: "Al Malqa, Riyadh",
  },
  {
    id: "cr_yousef", name: "Yousef Barakat", handle: "@yousefeats", city: "Jeddah", market: "KSA",
    languages: ["Arabic", "English"], niches: ["Food", "Breakfast"],
    platforms: [{ platform: "tiktok", followers: 320_000 }, { platform: "instagram", followers: 98_000 }],
    avatar: { initials: "YB", tone: "amber" }, verification: "pending", licenceId: "PROTO-KSA-1187",
    bio: "Breakfast is a love language. Jeddah cafés and home plates.", joinedAt: d("2026-04-11"),
    email: "yousef@example.com", phone: "+966 55 000 0003", address: "Al Rawdah, Jeddah",
  },
  {
    id: "cr_mariam", name: "Mariam El Sayed", handle: "@mariam.glow", city: "Sharjah", market: "UAE",
    languages: ["Arabic", "English"], niches: ["Skincare", "Beauty"],
    platforms: [{ platform: "instagram", followers: 152_000 }, { platform: "tiktok", followers: 88_000 }],
    avatar: { initials: "ME", tone: "mint" }, verification: "verified", licenceId: "PROTO-UAE-7719",
    bio: "Dermatology student by day, ingredient nerd by night.", joinedAt: d("2026-02-28"),
    email: "mariam@example.com", phone: "+971 56 000 0004", address: "Al Majaz, Sharjah",
  },
  {
    id: "cr_khalid", name: "Khalid Al Otaibi", handle: "@khalid.laughs", city: "Riyadh", market: "KSA",
    languages: ["Arabic"], niches: ["Comedy", "Everyday life"],
    platforms: [{ platform: "tiktok", followers: 540_000 }, { platform: "snapchat", followers: 175_000 }],
    avatar: { initials: "KO", tone: "sun" }, verification: "unverified", licenceId: "PROTO-KSA-0450",
    bio: "Small jokes about big families.", joinedAt: d("2026-05-19"),
    email: "khalid@example.com", phone: "+966 53 000 0005", address: "Al Yasmin, Riyadh",
  },
  {
    id: "cr_dana", name: "Dana Farouk", handle: "@dana.smiles", city: "Dubai", market: "UAE",
    languages: ["English", "Arabic"], niches: ["Oral care", "Wellness"],
    platforms: [{ platform: "instagram", followers: 27_400 }, { platform: "youtube", followers: 41_000 }],
    avatar: { initials: "DF", tone: "sky" }, verification: "verified", licenceId: "PROTO-UAE-3308",
    bio: "Dental student explaining the small habits that matter.", joinedAt: d("2026-03-15"),
    email: "dana@example.com", phone: "+971 52 000 0006", address: "Mirdif, Dubai",
  },
  {
    id: "cr_rania", name: "Rania Kassem", handle: "@rania.wears", city: "Dubai", market: "UAE",
    languages: ["Arabic", "English", "French"], niches: ["Modest fashion", "Beauty"],
    platforms: [{ platform: "instagram", followers: 240_000 }],
    avatar: { initials: "RK", tone: "berry" }, verification: "verified", licenceId: "PROTO-UAE-5562",
    bio: "Layered looks and the routines underneath them.", joinedAt: d("2026-01-09"),
    email: "rania@example.com", phone: "+971 50 000 0007", address: "Dubai Hills, Dubai",
  },
  {
    id: "cr_tariq", name: "Tariq Nasser", handle: "@tariq.tests", city: "Dammam", market: "KSA",
    languages: ["Arabic", "English"], niches: ["Grooming", "Tech"],
    platforms: [{ platform: "youtube", followers: 133_000 }, { platform: "tiktok", followers: 71_000 }],
    avatar: { initials: "TN", tone: "cocoa" }, verification: "pending", licenceId: "PROTO-KSA-6641",
    bio: "I test things so you do not have to. Beards included.", joinedAt: d("2026-04-30"),
    email: "tariq@example.com", phone: "+966 54 000 0008", address: "Al Faisaliyah, Dammam",
  },
  {
    id: "cr_hessa", name: "Hessa Al Suwaidi", handle: "@hessa.cooks", city: "Al Ain", market: "UAE",
    languages: ["Arabic", "English"], niches: ["Food", "Family"],
    platforms: [{ platform: "instagram", followers: 58_900 }, { platform: "tiktok", followers: 44_000 }],
    avatar: { initials: "HS", tone: "amber" }, verification: "verified", licenceId: "PROTO-UAE-8120",
    bio: "Grandmother's recipes, filmed one pot at a time.", joinedAt: d("2026-02-05"),
    email: "hessa@example.com", phone: "+971 50 000 0009", address: "Al Jimi, Al Ain",
  },
  {
    id: "cr_sami", name: "Sami Abu Zaid", handle: "@sami.dadlife", city: "Jeddah", market: "KSA",
    languages: ["Arabic", "English"], niches: ["Family", "Wellness"],
    platforms: [{ platform: "instagram", followers: 76_000 }, { platform: "youtube", followers: 22_000 }],
    avatar: { initials: "SZ", tone: "mint" }, verification: "verified", licenceId: "PROTO-KSA-2298",
    bio: "Two toddlers, one camera, a lot of honey on toast.", joinedAt: d("2026-03-22"),
    email: "sami@example.com", phone: "+966 56 000 0010", address: "Al Hamra, Jeddah",
  },
  {
    id: "cr_lina", name: "Lina Mansour", handle: "@lina.breathes", city: "Dubai", market: "UAE",
    languages: ["English", "Arabic"], niches: ["Yoga", "Wellness", "Skincare"],
    platforms: [{ platform: "instagram", followers: 112_000 }, { platform: "youtube", followers: 65_000 }],
    avatar: { initials: "LM", tone: "grass" }, verification: "verified", licenceId: "PROTO-UAE-1904",
    bio: "Morning flows from a sunny balcony in Al Barsha.", joinedAt: d("2026-01-30"),
    email: "lina@example.com", phone: "+971 55 000 0011", address: "Al Barsha, Dubai",
  },
];

// Provisional brand list drawn from the Dabur International portfolio. It could not be
// validated against the UAE site from the build environment, so every brand carries a
// source URL and a sync status for the Product Library to display honestly.
const brands: Brand[] = [
  { id: "b_amla", name: "Dabur Amla", tagline: "Strong roots, long stories", accent: "grass", category: "Haircare", sourceUrl: "https://www.daburinternational.com/brands/dabur-amla", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 3, syncStatus: "partial", packShape: "bottle" },
  { id: "b_vatika", name: "Vatika", tagline: "Nature in every wash", accent: "mint", category: "Haircare", sourceUrl: "https://www.daburinternational.com/brands/vatika", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 3, syncStatus: "partial", packShape: "bottle" },
  { id: "b_herbl", name: "Dabur Herb'l", tagline: "Herbal smiles, every morning", accent: "sky", category: "Oral care", sourceUrl: "https://www.daburinternational.com/brands/dabur-herbl", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 2, syncStatus: "partial", packShape: "tube" },
  { id: "b_red", name: "Dabur Red", tagline: "The classic red paste", accent: "coral", category: "Oral care", sourceUrl: "https://www.daburinternational.com/brands/dabur-red", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 1, syncStatus: "partial", packShape: "tube" },
  { id: "b_honey", name: "Dabur Honey", tagline: "Golden breakfasts", accent: "sun", category: "Food", sourceUrl: "https://www.daburinternational.com/brands/dabur-honey", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 2, syncStatus: "partial", packShape: "jar" },
  { id: "b_chyawanprash", name: "Dabur Chyawanprash", tagline: "A spoon of winter strength", accent: "cocoa", category: "Wellness", sourceUrl: "https://www.daburinternational.com/brands/dabur-chyawanprash", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 1, syncStatus: "partial", packShape: "jar" },
  { id: "b_hajmola", name: "Hajmola", tagline: "The tangy pause", accent: "amber", category: "Food", sourceUrl: "https://www.daburinternational.com/brands/hajmola", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 1, syncStatus: "pending", packShape: "box" },
  { id: "b_fem", name: "Fem", tagline: "Self-care Sundays", accent: "berry", category: "Skincare", sourceUrl: "https://www.daburinternational.com/brands/fem", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 2, syncStatus: "partial", packShape: "tube" },
  { id: "b_dermoviva", name: "Dermoviva", tagline: "Skin that feels like you", accent: "mint", category: "Skincare", sourceUrl: "https://www.daburinternational.com/brands/dermoviva", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 2, syncStatus: "partial", packShape: "bottle" },
  { id: "b_meswak", name: "Dabur Meswak", tagline: "Tradition, brushed daily", accent: "cocoa", category: "Oral care", sourceUrl: "https://www.daburinternational.com/brands/meswak", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 1, syncStatus: "pending", packShape: "tube" },
  { id: "b_odonil", name: "Odonil", tagline: "Rooms that welcome you", accent: "sky", category: "Home care", sourceUrl: "https://www.daburinternational.com/brands/odonil", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 1, syncStatus: "pending", packShape: "spray" },
  { id: "b_real", name: "Real", tagline: "Fruit, poured", accent: "coral", category: "Beverages", sourceUrl: "https://www.daburinternational.com/brands/real", syncedAt: CATALOGUE_SYNCED_AT, skuCount: 2, syncStatus: "partial", packShape: "carton" },
];

const products: Product[] = [
  { id: "p_amla_oil", brandId: "b_amla", name: "Dabur Amla Hair Oil", type: "Hair oil", description: "The classic amla-enriched hair oil for regular scalp massage.", heroIngredient: "Amla (Indian gooseberry)", sourceUrl: "https://www.daburinternational.com/brands/dabur-amla", ksaAvailable: true },
  { id: "p_amla_shampoo", brandId: "b_amla", name: "Dabur Amla Nourishing Shampoo", type: "Shampoo", description: "Daily shampoo from the Amla range.", heroIngredient: "Amla", sourceUrl: "https://www.daburinternational.com/brands/dabur-amla", ksaAvailable: true },
  { id: "p_amla_gold", brandId: "b_amla", name: "Dabur Amla Gold Hair Oil", type: "Hair oil", description: "Lighter variant from the Amla oil range.", heroIngredient: "Amla, almond", sourceUrl: "https://www.daburinternational.com/brands/dabur-amla", ksaAvailable: false },
  { id: "p_vatika_coconut", brandId: "b_vatika", name: "Vatika Enriched Coconut Hair Oil", type: "Hair oil", description: "Coconut base with herbal extracts.", heroIngredient: "Coconut", sourceUrl: "https://www.daburinternational.com/brands/vatika", ksaAvailable: true },
  { id: "p_vatika_shampoo", brandId: "b_vatika", name: "Vatika Naturals Shampoo", type: "Shampoo", description: "Shampoo range with natural extracts.", heroIngredient: "Olive, almond", sourceUrl: "https://www.daburinternational.com/brands/vatika", ksaAvailable: true },
  { id: "p_vatika_cream", brandId: "b_vatika", name: "Vatika Hair Cream", type: "Styling cream", description: "Everyday styling cream from the Vatika range.", heroIngredient: "Argan", sourceUrl: "https://www.daburinternational.com/brands/vatika", ksaAvailable: true },
  { id: "p_herbl_neem", brandId: "b_herbl", name: "Dabur Herb'l Neem Toothpaste", type: "Toothpaste", description: "Herbal toothpaste with neem.", heroIngredient: "Neem", sourceUrl: "https://www.daburinternational.com/brands/dabur-herbl", ksaAvailable: true },
  { id: "p_herbl_charcoal", brandId: "b_herbl", name: "Dabur Herb'l Activated Charcoal Toothpaste", type: "Toothpaste", description: "Herbal toothpaste with activated charcoal.", heroIngredient: "Activated charcoal", sourceUrl: "https://www.daburinternational.com/brands/dabur-herbl", ksaAvailable: true },
  { id: "p_red", brandId: "b_red", name: "Dabur Red Toothpaste", type: "Toothpaste", description: "The classic red ayurvedic toothpaste.", heroIngredient: "Clove, mint", sourceUrl: "https://www.daburinternational.com/brands/dabur-red", ksaAvailable: true },
  { id: "p_honey", brandId: "b_honey", name: "Dabur Honey", type: "Honey", description: "Everyday table honey in a squeeze pack and jar.", heroIngredient: "Honey", sourceUrl: "https://www.daburinternational.com/brands/dabur-honey", ksaAvailable: true },
  { id: "p_honey_squeezy", brandId: "b_honey", name: "Dabur Honey Squeezy", type: "Honey", description: "Squeeze bottle format for breakfast tables.", heroIngredient: "Honey", sourceUrl: "https://www.daburinternational.com/brands/dabur-honey", ksaAvailable: false },
  { id: "p_chyawanprash", brandId: "b_chyawanprash", name: "Dabur Chyawanprash", type: "Herbal jam", description: "Traditional ayurvedic formulation taken by the spoon.", heroIngredient: "Amla and herbs", sourceUrl: "https://www.daburinternational.com/brands/dabur-chyawanprash", ksaAvailable: true },
  { id: "p_hajmola", brandId: "b_hajmola", name: "Hajmola Regular", type: "Digestive tablet", description: "Tangy digestive tablets.", heroIngredient: "Black salt, cumin", sourceUrl: "https://www.daburinternational.com/brands/hajmola", ksaAvailable: true },
  { id: "p_fem_cream", brandId: "b_fem", name: "Fem Hair Removal Cream", type: "Hair removal", description: "Hair removal cream range.", heroIngredient: "Rose, turmeric", sourceUrl: "https://www.daburinternational.com/brands/fem", ksaAvailable: true },
  { id: "p_fem_bleach", brandId: "b_fem", name: "Fem Fairness Bleach", type: "Bleach", description: "Facial bleach range.", heroIngredient: "Saffron", sourceUrl: "https://www.daburinternational.com/brands/fem", ksaAvailable: false },
  { id: "p_dermoviva_wash", brandId: "b_dermoviva", name: "Dermoviva Body Wash", type: "Body wash", description: "Body wash range.", heroIngredient: "Aloe", sourceUrl: "https://www.daburinternational.com/brands/dermoviva", ksaAvailable: true },
  { id: "p_dermoviva_soap", brandId: "b_dermoviva", name: "Dermoviva Soap", type: "Bar soap", description: "Bar soap range.", heroIngredient: "Olive", sourceUrl: "https://www.daburinternational.com/brands/dermoviva", ksaAvailable: true },
  { id: "p_meswak", brandId: "b_meswak", name: "Dabur Meswak Toothpaste", type: "Toothpaste", description: "Toothpaste with miswak extract.", heroIngredient: "Miswak", sourceUrl: "https://www.daburinternational.com/brands/meswak", ksaAvailable: true },
  { id: "p_odonil", brandId: "b_odonil", name: "Odonil Room Freshener", type: "Air freshener", description: "Room freshening range.", heroIngredient: "Jasmine", sourceUrl: "https://www.daburinternational.com/brands/odonil", ksaAvailable: true },
  { id: "p_real_orange", brandId: "b_real", name: "Real Orange Juice", type: "Juice", description: "Fruit juice range, orange.", heroIngredient: "Orange", sourceUrl: "https://www.daburinternational.com/brands/real", ksaAvailable: true },
  { id: "p_real_mango", brandId: "b_real", name: "Real Mango Nectar", type: "Juice", description: "Fruit nectar range, mango.", heroIngredient: "Mango", sourceUrl: "https://www.daburinternational.com/brands/real", ksaAvailable: true },
];

const campaigns: Campaign[] = [
  {
    id: "c_amla_roots", title: "Amla Strong Roots Challenge", brandId: "b_amla", productIds: ["p_amla_oil", "p_amla_shampoo"],
    markets: ["UAE", "KSA"], stage: "active",
    objective: "Show a real weekly oiling ritual and what it does for your hair over four weeks.",
    mustHave: ["Pack visible in the first 5 seconds", "One honest before-and-after moment", "Say the brand name out loud once"],
    avoid: ["Medical claims", "Comparing to other brands", "Filters that change hair texture"],
    tone: "Warm, unhurried, personal", deliverable: "One 30 to 60 second vertical video",
    criteria: CRITERIA, deadline: d("2026-09-20"), points: 1200, createdAt: d("2026-08-10"), ownerName: "Reem Al Awadhi",
    invitations: [
      { creatorId: "cr_layla", status: "accepted", sentAt: d("2026-08-12"), respondedAt: d("2026-08-13") },
      { creatorId: "cr_rania", status: "accepted", sentAt: d("2026-08-12"), respondedAt: d("2026-08-12") },
      { creatorId: "cr_noor", status: "accepted", sentAt: d("2026-08-12"), respondedAt: d("2026-08-14") },
      { creatorId: "cr_mariam", status: "declined", sentAt: d("2026-08-12"), respondedAt: d("2026-08-15") },
    ],
  },
  {
    id: "c_vatika_reset", title: "Vatika Summer Hair Reset", brandId: "b_vatika", productIds: ["p_vatika_coconut", "p_vatika_shampoo"],
    markets: ["UAE"], stage: "inviting",
    objective: "Post-beach and post-pool recovery routines with Vatika, filmed at home.",
    mustHave: ["Show the wash routine step by step", "Pack close-up"],
    avoid: ["Health claims", "Music with lyrics over speech"],
    tone: "Bright, summery, quick", deliverable: "One 15 to 30 second vertical video plus one story frame",
    criteria: CRITERIA, deadline: d("2026-10-04"), points: 900, createdAt: d("2026-08-28"), ownerName: "Reem Al Awadhi",
    invitations: [
      { creatorId: "cr_layla", status: "pending", sentAt: d("2026-09-04") },
      { creatorId: "cr_lina", status: "pending", sentAt: d("2026-09-04") },
      { creatorId: "cr_rania", status: "accepted", sentAt: d("2026-09-04"), respondedAt: d("2026-09-05") },
    ],
  },
  {
    id: "c_herbl_smile", title: "Herb'l Morning Smile", brandId: "b_herbl", productIds: ["p_herbl_neem"],
    markets: ["UAE", "KSA"], stage: "inviting",
    objective: "A morning routine mini-vlog where brushing is the calm moment, not a product demo.",
    mustHave: ["Pack on the sink, readable", "Natural light"],
    avoid: ["Dental health claims", "Whitening promises"],
    tone: "Gentle, funny is fine", deliverable: "One 20 to 45 second vertical video",
    criteria: CRITERIA, deadline: d("2026-10-11"), points: 800, createdAt: d("2026-09-01"), ownerName: "Faisal Al Harbi",
    invitations: [
      { creatorId: "cr_layla", status: "pending", sentAt: d("2026-09-05") },
      { creatorId: "cr_dana", status: "accepted", sentAt: d("2026-09-05"), respondedAt: d("2026-09-05") },
      { creatorId: "cr_khalid", status: "pending", sentAt: d("2026-09-05") },
    ],
  },
  {
    id: "c_honey_stories", title: "Honey Breakfast Stories", brandId: "b_honey", productIds: ["p_honey"],
    markets: ["UAE", "KSA"], stage: "publishing",
    objective: "Your family breakfast, with honey somewhere in the story.",
    mustHave: ["Jar or squeezy pack visible", "One line about who you are sharing breakfast with"],
    avoid: ["Health claims", "Staged studio setups"],
    tone: "Cosy, real, a little messy", deliverable: "One 30 second vertical video",
    criteria: CRITERIA, deadline: d("2026-09-12"), points: 1000, createdAt: d("2026-07-20"), ownerName: "Faisal Al Harbi",
    invitations: [
      { creatorId: "cr_layla", status: "accepted", sentAt: d("2026-07-22"), respondedAt: d("2026-07-22") },
      { creatorId: "cr_yousef", status: "accepted", sentAt: d("2026-07-22"), respondedAt: d("2026-07-23") },
      { creatorId: "cr_sami", status: "accepted", sentAt: d("2026-07-22"), respondedAt: d("2026-07-24") },
      { creatorId: "cr_hessa", status: "accepted", sentAt: d("2026-07-22"), respondedAt: d("2026-07-22") },
    ],
  },
  {
    id: "c_chyawanprash", title: "Chyawanprash Winter Ritual", brandId: "b_chyawanprash", productIds: ["p_chyawanprash"],
    markets: ["UAE"], stage: "completed",
    objective: "The one spoon your family takes every morning when the weather turns.",
    mustHave: ["Jar visible", "A family member in frame"],
    avoid: ["Immunity claims", "Medical language"],
    tone: "Nostalgic, warm", deliverable: "One 30 second vertical video",
    criteria: CRITERIA, deadline: d("2026-03-01"), points: 1100, createdAt: d("2026-01-25"), ownerName: "Reem Al Awadhi",
    invitations: [
      { creatorId: "cr_layla", status: "accepted", sentAt: d("2026-01-28"), respondedAt: d("2026-01-28") },
      { creatorId: "cr_lina", status: "accepted", sentAt: d("2026-01-28"), respondedAt: d("2026-01-29") },
      { creatorId: "cr_omar", status: "declined", sentAt: d("2026-01-28"), respondedAt: d("2026-02-02") },
    ],
  },
  {
    id: "c_fem_sunday", title: "Fem Self-Care Sunday", brandId: "b_fem", productIds: ["p_fem_cream"],
    markets: ["UAE", "KSA"], stage: "review",
    objective: "A slow Sunday reset. Fem is one step, not the whole story.",
    mustHave: ["Pack visible", "No before-and-after skin shots"],
    avoid: ["Skin-tone language", "Medical claims"],
    tone: "Soft, private, unhurried", deliverable: "One 30 to 45 second vertical video",
    criteria: CRITERIA, deadline: d("2026-09-14"), points: 950, createdAt: d("2026-08-05"), ownerName: "Reem Al Awadhi",
    invitations: [
      { creatorId: "cr_mariam", status: "accepted", sentAt: d("2026-08-07"), respondedAt: d("2026-08-07") },
      { creatorId: "cr_rania", status: "accepted", sentAt: d("2026-08-07"), respondedAt: d("2026-08-08") },
      { creatorId: "cr_noor", status: "accepted", sentAt: d("2026-08-07"), respondedAt: d("2026-08-09") },
    ],
  },
  {
    id: "c_hajmola_break", title: "Hajmola Snack Break", brandId: "b_hajmola", productIds: ["p_hajmola"],
    markets: ["KSA"], stage: "draft",
    objective: "Office and campus snack breaks with a tangy twist.",
    mustHave: ["Pack in hand", "A reaction shot"],
    avoid: ["Digestive health claims"],
    tone: "Playful, quick", deliverable: "One 15 second vertical video",
    criteria: CRITERIA, deadline: d("2026-11-01"), points: 700, createdAt: d("2026-09-03"), ownerName: "Faisal Al Harbi",
    invitations: [],
  },
];

function sub(id: string, campaignId: string, creatorId: string, version: number, fileName: string, uploadedAt: string, status: import("./types").SubmissionStatus, comments: import("./types").Comment[], script?: string, reviewedBy?: string) {
  const { score, breakdown } = scoreSubmission(fileName);
  return { id, campaignId, creatorId, version, fileName, fileSize: 48_000_000 + (version * 3_100_000), uploadedAt: d(uploadedAt), score, breakdown, status, comments, script, reviewedBy };
}

const submissions = [
  sub("s_amla_layla_1", "c_amla_roots", "cr_layla", 1, "amla-week1-ritual-v1.mp4", "2026-08-24T09:12:00Z", "changes_requested", [
    { id: "cm1", author: "Reem Al Awadhi", role: "reviewer", text: "Love the morning light. The pack is out of focus in the close-up at 0:07, can you hold it a beat longer?", at: d("2026-08-25T11:40:00Z") },
    { id: "cm2", author: "Layla Al Mansoori", role: "creator", text: "Yes, I have a steadier take from the same morning. Will re-cut this week.", at: d("2026-08-25T18:02:00Z") },
  ], "Open on the tea kettle. Cut to me sectioning hair. Say: 'This is the Sunday ritual my mother taught me.' Show the Amla bottle on the sink. Massage, then the four-week note on the mirror.", "Reem Al Awadhi"),
  sub("s_amla_rania_1", "c_amla_roots", "cr_rania", 1, "rania-amla-cut-a.mov", "2026-08-30T14:00:00Z", "in_review", [], undefined),
  sub("s_honey_layla_1", "c_honey_stories", "cr_layla", 1, "honey-breakfast-final.mp4", "2026-08-18T07:30:00Z", "approved", [
    { id: "cm3", author: "Faisal Al Harbi", role: "reviewer", text: "This is exactly the tone. Approved, go ahead and publish.", at: d("2026-08-19T10:15:00Z") },
  ], undefined, "Faisal Al Harbi"),
  sub("s_chy_layla_1", "c_chyawanprash", "cr_layla", 1, "winter-spoon-v2.mp4", "2026-02-12T08:00:00Z", "approved", [
    { id: "cm4", author: "Reem Al Awadhi", role: "reviewer", text: "Your grandmother stole the show. Approved.", at: d("2026-02-13T09:00:00Z") },
  ], undefined, "Reem Al Awadhi"),
  sub("s_fem_mariam_1", "c_fem_sunday", "cr_mariam", 1, "fem-sunday-reset.mp4", "2026-09-02T16:20:00Z", "in_review", []),
  sub("s_fem_noor_1", "c_fem_sunday", "cr_noor", 1, "noor-sunday-cut1.mp4", "2026-09-04T12:05:00Z", "in_review", []),
  sub("s_honey_yousef_1", "c_honey_stories", "cr_yousef", 1, "yousef-honey-plate.mp4", "2026-08-20T09:00:00Z", "approved", [], undefined, "Faisal Al Harbi"),
  sub("s_honey_sami_1", "c_honey_stories", "cr_sami", 1, "sami-toast-morning.mp4", "2026-08-22T09:00:00Z", "changes_requested", [
    { id: "cm5", author: "Faisal Al Harbi", role: "reviewer", text: "Music is louder than your voice from 0:12. Could you bring the voice up?", at: d("2026-08-23T13:00:00Z") },
  ], undefined, "Faisal Al Harbi"),
];

const publications = [
  { id: "pub_chy_layla", campaignId: "c_chyawanprash", creatorId: "cr_layla", platform: "instagram" as const, url: "https://www.instagram.com/reel/proto-winter-spoon", postedAt: d("2026-02-20T17:00:00Z"), engagement: { views: 48_210, likes: 3_912, comments: 214 }, verification: "verified" as const, pointsReleased: true },
  { id: "pub_honey_yousef", campaignId: "c_honey_stories", creatorId: "cr_yousef", platform: "tiktok" as const, url: "https://www.tiktok.com/@yousefeats/video/proto-honey", postedAt: d("2026-08-26T18:30:00Z"), engagement: { views: 131_400, likes: 9_870, comments: 402 }, verification: "pending" as const, pointsReleased: false },
];

const quests: Quest[] = [
  { id: "q_amla_know", brandId: "b_amla", title: "Know your Amla", kind: "education", description: "A five-minute read on what amla is and how the oil is traditionally used, then one quick question.", steps: ["Read the brand story", "Answer one question", "Done"], points: 150, deadline: d("2026-12-31"), question: { prompt: "Amla is another name for which fruit?", options: ["Indian gooseberry", "Tamarind", "Black plum"], answer: 0 } },
  { id: "q_vatika_quiz", brandId: "b_vatika", title: "Vatika ingredient walk", kind: "education", description: "Learn the three hero ingredients in the Vatika oil range and share which one you would build a video around.", steps: ["Read the ingredient notes", "Write two lines on your idea", "Submit"], points: 200, deadline: d("2026-10-15") },
  { id: "q_pack_reveal", brandId: "b_herbl", title: "Film a 15 second pack reveal", kind: "creative", description: "No brief, no pressure. Pick any Herb'l pack you own and film a reveal that makes people want to pick it up.", steps: ["Film 15 seconds", "Upload the file", "Get feedback"], points: 300, deadline: d("2026-10-30") },
  { id: "q_odonil_story", brandId: "b_odonil", title: "Odonil home refresh story", kind: "creative", description: "One story frame of a corner of your home that Odonil lives in.", steps: ["Take one photo or clip", "Upload", "Get feedback"], points: 180, deadline: d("2026-09-30") },
  { id: "q_real_mocktail", brandId: "b_real", title: "Real mocktail remix", kind: "community", description: "Mix a Real juice mocktail and share the recipe with the Squad.", steps: ["Mix", "Film or write the recipe", "Submit"], points: 250, deadline: d("2026-10-20") },
  { id: "q_squad_intro", brandId: "b_honey", title: "Say hello to the Squad", kind: "community", description: "Post a two-line intro so brand teams can put a person to the handle.", steps: ["Write your intro", "Submit"], points: 100, deadline: d("2026-12-31") },
];

const participations = [
  { questId: "q_amla_know", creatorId: "cr_layla", status: "completed" as const, joinedAt: d("2026-03-01"), submission: { text: "Indian gooseberry", at: d("2026-03-01T10:00:00Z"), answer: 0 }, feedback: "Correct. Points added." },
  { questId: "q_vatika_quiz", creatorId: "cr_layla", status: "joined" as const, joinedAt: d("2026-09-02") },
  { questId: "q_odonil_story", creatorId: "cr_layla", status: "in_review" as const, joinedAt: d("2026-08-29"), submission: { text: "The hallway corner by the window, jasmine in the morning.", fileName: "hallway-corner.jpg", at: d("2026-09-03T15:30:00Z") } },
  { questId: "q_squad_intro", creatorId: "cr_layla", status: "completed" as const, joinedAt: d("2026-02-15"), submission: { text: "Layla, Dubai. Hair routines and slow mornings.", at: d("2026-02-15T09:00:00Z") }, feedback: "Welcome to the Squad." },
  { questId: "q_pack_reveal", creatorId: "cr_dana", status: "submitted" as const, joinedAt: d("2026-09-01"), submission: { text: "Neem pack reveal on the sink", fileName: "neem-reveal.mp4", at: d("2026-09-05T08:00:00Z") } },
  { questId: "q_real_mocktail", creatorId: "cr_hessa", status: "in_review" as const, joinedAt: d("2026-09-02"), submission: { text: "Mango nectar, mint, lime, soda.", fileName: "mango-mint.mp4", at: d("2026-09-04T19:00:00Z") } },
];

const ledger = [
  { id: "l1", creatorId: "cr_layla", type: "earned" as const, points: 100, note: "Side quest: Say hello to the Squad", at: d("2026-02-15T09:05:00Z"), released: true, releasedAt: d("2026-02-15T09:05:00Z"), refId: "q_squad_intro" },
  { id: "l2", creatorId: "cr_layla", type: "earned" as const, points: 1100, note: "Campaign: Chyawanprash Winter Ritual", at: d("2026-02-20T17:00:00Z"), released: true, releasedAt: d("2026-02-24T11:00:00Z"), refId: "c_chyawanprash" },
  { id: "l3", creatorId: "cr_layla", type: "earned" as const, points: 150, note: "Side quest: Know your Amla", at: d("2026-03-01T10:01:00Z"), released: true, releasedAt: d("2026-03-01T10:01:00Z"), refId: "q_amla_know" },
  { id: "l4", creatorId: "cr_layla", type: "spent" as const, points: 600, note: "Redeemed: Vatika hair kit", at: d("2026-04-10T14:00:00Z"), released: true, refId: "rw_vatika_kit" },
  { id: "l5", creatorId: "cr_layla", type: "earned" as const, points: 1000, note: "Campaign: Honey Breakfast Stories (pending publish and verification)", at: d("2026-08-19T10:15:00Z"), released: false, refId: "c_honey_stories" },
  { id: "l6", creatorId: "cr_layla", type: "earned" as const, points: 180, note: "Side quest: Odonil home refresh story (in review)", at: d("2026-09-03T15:30:00Z"), released: false, refId: "q_odonil_story" },
  { id: "l7", creatorId: "cr_yousef", type: "earned" as const, points: 1000, note: "Campaign: Honey Breakfast Stories (awaiting verification)", at: d("2026-08-26T18:30:00Z"), released: false, refId: "c_honey_stories" },
  { id: "l8", creatorId: "cr_lina", type: "earned" as const, points: 1100, note: "Campaign: Chyawanprash Winter Ritual", at: d("2026-02-22T12:00:00Z"), released: true, releasedAt: d("2026-02-26T09:00:00Z"), refId: "c_chyawanprash" },
  { id: "l9", creatorId: "cr_rania", type: "earned" as const, points: 250, note: "Side quest: Real mocktail remix", at: d("2026-08-02T12:00:00Z"), released: true, releasedAt: d("2026-08-03T09:00:00Z"), refId: "q_real_mocktail" },
];

const rewards: Reward[] = [
  { id: "rw_amla_bundle", name: "Amla care bundle", brandId: "b_amla", points: 800, stock: 14, category: "product", description: "Oil, shampoo and a linen head wrap.", accent: "grass", shape: "bottle" },
  { id: "rw_vatika_kit", name: "Vatika hair kit", brandId: "b_vatika", points: 600, stock: 9, category: "product", description: "Coconut oil, shampoo and a wide-tooth comb.", accent: "mint", shape: "bottle" },
  { id: "rw_ring_light", name: "Creator ring light", points: 2500, stock: 3, category: "gear", description: "18 inch ring light with a phone mount.", accent: "sun" },
  { id: "rw_masterclass", name: "Storytelling masterclass seat", points: 1200, stock: 20, category: "learning", description: "A live online session with a Dubai-based director.", accent: "sky" },
  { id: "rw_dermoviva_set", name: "Dermoviva spa set", brandId: "b_dermoviva", points: 900, stock: 0, category: "product", description: "Body wash, soap and a cotton towel.", accent: "mint", shape: "bottle" },
  { id: "rw_hoodie", name: "Squad hoodie", points: 700, stock: 31, category: "merch", description: "Cream hoodie with the grass-green Squad mark.", accent: "coral" },
];

const shipments = [
  { id: "sh_amla_kit", creatorId: "cr_layla", kind: "product_kit" as const, label: "Amla campaign product kit", refId: "c_amla_roots", status: "dispatched" as const, courier: "Aramex (simulated)", tracking: "SIM-AE-48120931", address: "Villa 12, Street 8b, Jumeirah 1, Dubai", history: [
    { status: "address_confirmed" as const, at: d("2026-08-14T10:00:00Z") }, { status: "preparing" as const, at: d("2026-08-15T09:00:00Z") }, { status: "dispatched" as const, at: d("2026-09-05T08:30:00Z") },
  ] },
  { id: "sh_vatika_kit", creatorId: "cr_layla", kind: "reward" as const, label: "Vatika hair kit", refId: "rw_vatika_kit", status: "delivered" as const, courier: "Fetchr (simulated)", tracking: "SIM-AE-22019844", address: "Villa 12, Street 8b, Jumeirah 1, Dubai", history: [
    { status: "address_confirmed" as const, at: d("2026-04-10T14:05:00Z") }, { status: "preparing" as const, at: d("2026-04-11T09:00:00Z") }, { status: "dispatched" as const, at: d("2026-04-12T08:00:00Z") }, { status: "out_for_delivery" as const, at: d("2026-04-13T07:30:00Z") }, { status: "delivered" as const, at: d("2026-04-13T13:20:00Z") },
  ] },
  { id: "sh_rania_hoodie", creatorId: "cr_rania", kind: "reward" as const, label: "Squad hoodie", refId: "rw_hoodie", status: "preparing" as const, courier: "Aramex (simulated)", tracking: "SIM-AE-77310022", address: "Dubai Hills, Dubai", history: [
    { status: "address_confirmed" as const, at: d("2026-09-03T11:00:00Z") }, { status: "preparing" as const, at: d("2026-09-04T09:00:00Z") },
  ] },
  { id: "sh_noor_kit", creatorId: "cr_noor", kind: "product_kit" as const, label: "Amla campaign product kit", refId: "c_amla_roots", status: "out_for_delivery" as const, courier: "SMSA (simulated)", tracking: "SIM-SA-90113377", address: "Al Malqa, Riyadh", history: [
    { status: "address_confirmed" as const, at: d("2026-08-15T10:00:00Z") }, { status: "preparing" as const, at: d("2026-08-16T09:00:00Z") }, { status: "dispatched" as const, at: d("2026-09-02T08:00:00Z") }, { status: "out_for_delivery" as const, at: d("2026-09-06T06:40:00Z") },
  ] },
];

const redemptions = [
  { id: "rd_layla_vatika", creatorId: "cr_layla", rewardId: "rw_vatika_kit", points: 600, at: d("2026-04-10T14:00:00Z"), shipmentId: "sh_vatika_kit" },
  { id: "rd_rania_hoodie", creatorId: "cr_rania", rewardId: "rw_hoodie", points: 700, at: d("2026-09-03T11:00:00Z"), shipmentId: "sh_rania_hoodie" },
];

const notifications = [
  { id: "n1", audience: "creator" as const, creatorId: "cr_layla", channel: "in_app" as const, title: "New invitation: Vatika Summer Hair Reset", body: "Reem invited you. Take a look at the brief and reply before 12 September.", at: d("2026-09-04T09:00:00Z"), read: false, href: "/creator/campaigns/c_vatika_reset" },
  { id: "n2", audience: "creator" as const, creatorId: "cr_layla", channel: "email" as const, title: "Your Amla kit is on its way", body: "Aramex picked up your product kit this morning. Tracking SIM-AE-48120931.", at: d("2026-09-05T08:35:00Z"), read: false, href: "/creator/rewards#deliveries" },
  { id: "n3", audience: "creator" as const, creatorId: "cr_layla", channel: "in_app" as const, title: "New invitation: Herb'l Morning Smile", body: "Faisal thinks your morning vlogs are a fit. Reply by 20 September.", at: d("2026-09-05T10:20:00Z"), read: false, href: "/creator/campaigns/c_herbl_smile" },
  { id: "n4", audience: "creator" as const, creatorId: "cr_layla", channel: "in_app" as const, title: "Feedback on Amla Strong Roots v1", body: "Reem left a note about the close-up at 0:07. One small re-cut and you are there.", at: d("2026-08-25T11:41:00Z"), read: true, href: "/creator/campaigns/c_amla_roots" },
  { id: "n5", audience: "creator" as const, creatorId: "cr_layla", channel: "email" as const, title: "Honey Breakfast Stories approved", body: "Your video is approved. Publish it and paste the live link to move your 1,000 points from pending to available.", at: d("2026-08-19T10:16:00Z"), read: true, href: "/creator/campaigns/c_honey_stories" },
  { id: "n6", audience: "creator" as const, creatorId: "cr_layla", channel: "in_app" as const, title: "Odonil story received", body: "Thanks. A reviewer will look at it this week.", at: d("2026-09-03T15:31:00Z"), read: true, href: "/creator/quests" },
  { id: "n7", audience: "admin" as const, channel: "in_app" as const, title: "3 submissions waiting for review", body: "Fem Self-Care Sunday has two new cuts and Amla has one.", at: d("2026-09-05T07:00:00Z"), read: false, href: "/admin/review" },
  { id: "n8", audience: "admin" as const, channel: "in_app" as const, title: "Dermoviva spa set is out of stock", body: "Six creators have it wishlisted. Restock or hide it.", at: d("2026-09-04T16:00:00Z"), read: false, href: "/admin/loyalty" },
];

const activity = [
  { id: "a1", actor: "Faisal Al Harbi", text: "sent 3 invitations for Herb'l Morning Smile", at: d("2026-09-05T10:20:00Z") },
  { id: "a2", actor: "Logistics", text: "dispatched Layla Al Mansoori's Amla product kit", at: d("2026-09-05T08:30:00Z") },
  { id: "a3", actor: "Noor Al Qahtani", text: "uploaded a cut for Fem Self-Care Sunday", at: d("2026-09-04T12:05:00Z") },
  { id: "a4", actor: "Reem Al Awadhi", text: "moved Vatika Summer Hair Reset to Inviting", at: d("2026-09-04T09:00:00Z") },
  { id: "a5", actor: "Layla Al Mansoori", text: "submitted the Odonil home refresh story", at: d("2026-09-03T15:30:00Z") },
  { id: "a6", actor: "Rania Kassem", text: "redeemed a Squad hoodie for 700 points", at: d("2026-09-03T11:00:00Z") },
  { id: "a7", actor: "Faisal Al Harbi", text: "created Hajmola Snack Break as a draft", at: d("2026-09-03T09:10:00Z") },
  { id: "a8", actor: "Mariam El Sayed", text: "uploaded a cut for Fem Self-Care Sunday", at: d("2026-09-02T16:20:00Z") },
  { id: "a9", actor: "Finance", text: "released 250 points to Rania Kassem", at: d("2026-08-03T09:00:00Z") },
  { id: "a10", actor: "Yousef Barakat", text: "posted Honey Breakfast Stories on TikTok, awaiting verification", at: d("2026-08-26T18:30:00Z") },
];

export function createSeedState(): AppState {
  return structuredClone({
    version: 1,
    seedVersion: SEED_VERSION,
    session: { mode: "public", creatorId: DEMO_CREATOR_ID, adminRole: "super_admin" },
    creators, brands, products, campaigns, submissions, publications, quests, participations, ledger, rewards, redemptions, shipments, notifications, activity,
  } satisfies AppState);
}
