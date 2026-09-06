export type Lang = "en" | "ar";

const en = {
  brand: "Dabur Squad",
  tagline: "Create boldly. Grow together.",
  nav: { campaigns: "Campaigns", quests: "Side Quests", how: "How it works", growth: "Growth", brands: "Brands", creatorView: "Creator view", brandView: "Brand-team view", language: "العربية" },
  hero: {
    lede: "A growth community for creators in the UAE and Saudi Arabia, built with Dabur's twelve brands. Real briefs, honest feedback, points that turn into things you actually want.",
    ctaCreator: "Enter as a creator",
    ctaBrand: "Enter as a brand team",
    note: "Internal demo. Every process here is simulated.",
    stat1: "creators in the Squad",
    stat2: "brands with open briefs",
    stat3: "points released so far",
  },
  paths: {
    title: "Two ways in. Both count.",
    campaignsTitle: "Campaigns",
    campaignsBody: "Invitations from brand teams with a clear brief, a product kit at your door, and feedback from a real person. Unlimited revisions. Points release when the post is live.",
    campaignsCta: "See how a campaign runs",
    questsTitle: "Side Quests",
    questsBody: "Small, self-paced missions across the brands. Learn an ingredient, film a 15 second reveal, share a recipe. No invitation needed.",
    questsCta: "Browse open quests",
  },
  how: {
    title: "How the Squad works",
    steps: [
      { t: "Get invited, or just start", b: "Brand teams invite you to campaigns. Side Quests are open to everyone. You always choose." },
      { t: "Read the brief, write your take", b: "Each brief says what must be in, what to avoid, and the tone. Add your own script if you like." },
      { t: "Film, upload, get a read", b: "A simulated analysis scores five things and explains why. No minimum score, only guidance." },
      { t: "Revise with a real person", b: "Reviewers leave timestamped notes. Re-cut as many times as you want." },
      { t: "Publish and get verified", b: "Paste the live link. Loyalty verifies it and your points move from pending to available." },
      { t: "Spend on things you want", b: "Product bundles, gear, masterclasses, merch. Delivered, tracked, done." },
    ],
  },
  growth: {
    title: "Growth is the point. Points are how we keep score.",
    body: "This is not a job board. Every campaign teaches something, every quest sharpens a skill, and the loyalty ledger is a record of how far you have come.",
    tiers: [
      { t: "Sprout", b: "Join, say hello, finish your first quest." },
      { t: "Bloom", b: "Two campaigns published. Reviewers know your name." },
      { t: "Canopy", b: "Trusted across both markets. First pick on new briefs." },
    ],
    pending: "Pending",
    available: "Available",
  },
  brands: { title: "Twelve brands. Twelve ways to tell a story.", body: "From hair oil rituals to breakfast tables, each brand has its own voice. Find the ones that sound like you.", caveat: "Provisional brand list. Catalogue sync from daburinternational.com is pending validation." },
  footer: { title: "Sunshine on the Squad", body: "Built as an internal prototype for Dabur brand teams. Simulated identity, email, analytics and video analysis. Not an official Dabur property until reviewed.", reset: "Reset demo", legal: "Internal demo. Prototype data only." },
  common: {
    points: "points", pts: "pts", loading: "Loading", empty: "Nothing here yet", back: "Back", cancel: "Cancel", confirm: "Confirm", save: "Save", saved: "Saved", close: "Close", simulated: "Simulated", inbox: "Inbox", resetDemo: "Reset demo", switchRole: "Switch role", signOut: "Leave demo", language: "Language", search: "Search", filters: "Filters", all: "All", markAllRead: "Mark all read", email: "Email", inApp: "In-app", deadline: "Deadline", accept: "Accept", decline: "Decline", pending: "Pending", accepted: "Accepted", declined: "Declined", viewAll: "View all", next: "Next", done: "Done", edit: "Edit", delete: "Delete", yes: "Yes", no: "No", required: "Required",
  },
  creator: {
    home: "Home", campaigns: "Campaigns", quests: "Side Quests", rewards: "Rewards", profile: "Profile",
    greeting: ["Good morning", "Good afternoon", "Good evening"],
    nextBest: "Next best action",
    invitations: "Invitations waiting",
    active: "Active campaigns",
    deadlines: "Coming up",
    deliveries: "Deliveries",
    feedback: "Latest feedback",
    recommended: "Quests picked for you",
    availablePts: "Available",
    pendingPts: "Pending",
  },
  stages: { draft: "Draft", inviting: "Inviting", active: "Active", review: "Content review", publishing: "Publishing", completed: "Completed" },
  logistics: { address_confirmed: "Address confirmed", preparing: "Preparing", dispatched: "Dispatched", out_for_delivery: "Out for delivery", delivered: "Delivered" },
  admin: {
    overview: "Overview", campaigns: "Campaigns", creators: "Creators", review: "Review queue", logistics: "Logistics", loyalty: "Loyalty", products: "Product library", role: "Role", permissions: "What this role can do",
  },
};

type Dict = typeof en;

const ar: Dict = {
  brand: "دابر سكواد",
  tagline: "أبدع بجرأة. لننمُ معاً.",
  nav: { campaigns: "الحملات", quests: "المهام الجانبية", how: "كيف يعمل", growth: "النمو", brands: "العلامات", creatorView: "عرض المبدع", brandView: "عرض فريق العلامة", language: "English" },
  hero: {
    lede: "مجتمع نمو لصنّاع المحتوى في الإمارات والسعودية، مبني مع علامات دابر الاثنتي عشرة. أفكار حقيقية، ملاحظات صادقة، ونقاط تتحول إلى أشياء تريدها فعلاً.",
    ctaCreator: "ادخل كصانع محتوى",
    ctaBrand: "ادخل كفريق علامة",
    note: "عرض داخلي. كل العمليات هنا محاكاة.",
    stat1: "صانع محتوى في السكواد",
    stat2: "علامة لديها أفكار مفتوحة",
    stat3: "نقطة صُرفت حتى الآن",
  },
  paths: {
    title: "طريقان للدخول. كلاهما مهم.",
    campaignsTitle: "الحملات",
    campaignsBody: "دعوات من فرق العلامات مع موجز واضح، وطقم منتجات على بابك، وملاحظات من شخص حقيقي. مراجعات غير محدودة. النقاط تُصرف عند نشر المحتوى.",
    campaignsCta: "شاهد كيف تسير الحملة",
    questsTitle: "المهام الجانبية",
    questsBody: "مهام صغيرة بوتيرتك الخاصة عبر العلامات. تعلّم مكوّناً، صوّر كشفاً لخمس عشرة ثانية، شارك وصفة. لا تحتاج إلى دعوة.",
    questsCta: "تصفّح المهام المفتوحة",
  },
  how: {
    title: "كيف يعمل السكواد",
    steps: [
      { t: "تلقَّ دعوة، أو ابدأ فوراً", b: "فرق العلامات تدعوك إلى الحملات. المهام الجانبية مفتوحة للجميع. القرار دائماً لك." },
      { t: "اقرأ الموجز واكتب رؤيتك", b: "كل موجز يحدد ما يجب أن يظهر، وما يجب تجنبه، والنبرة. أضف سيناريوك إن أحببت." },
      { t: "صوّر، ارفع، واحصل على قراءة", b: "تحليل محاكى يقيّم خمسة عناصر ويشرح السبب. لا حد أدنى، إرشاد فقط." },
      { t: "راجع مع شخص حقيقي", b: "المراجعون يتركون ملاحظات موقّتة. أعد القص كما تشاء." },
      { t: "انشر واحصل على التحقق", b: "الصق الرابط المباشر. فريق الولاء يتحقق وتنتقل نقاطك من المعلّقة إلى المتاحة." },
      { t: "أنفق على ما تريده", b: "حزم منتجات، معدات، دورات، أزياء. تُسلَّم وتُتابَع." },
    ],
  },
  growth: {
    title: "النمو هو الهدف. النقاط هي طريقتنا لتسجيل التقدم.",
    body: "هذه ليست لوحة وظائف. كل حملة تعلّمك شيئاً، وكل مهمة تصقل مهارة، وسجل الولاء يوثّق كم قطعت من الطريق.",
    tiers: [
      { t: "برعم", b: "انضم، قل مرحباً، أنهِ مهمتك الأولى." },
      { t: "إزهار", b: "حملتان منشورتان. المراجعون يعرفون اسمك." },
      { t: "ظلال", b: "موثوق في السوقين. الأولوية في الأفكار الجديدة." },
    ],
    pending: "معلّقة",
    available: "متاحة",
  },
  brands: { title: "اثنتا عشرة علامة. اثنتا عشرة طريقة لسرد القصة.", body: "من طقوس زيت الشعر إلى موائد الإفطار، لكل علامة صوتها. اعثر على ما يشبهك.", caveat: "قائمة علامات مبدئية. مزامنة الكتالوج من daburinternational.com بانتظار التحقق." },
  footer: { title: "شمس على السكواد", body: "بُني كنموذج داخلي لفرق علامات دابر. الهوية والبريد والتحليلات وتحليل الفيديو كلها محاكاة. ليس ملكية رسمية لدابر حتى المراجعة.", reset: "إعادة ضبط العرض", legal: "عرض داخلي. بيانات نموذجية فقط." },
  common: {
    points: "نقطة", pts: "نقطة", loading: "جارٍ التحميل", empty: "لا شيء هنا بعد", back: "رجوع", cancel: "إلغاء", confirm: "تأكيد", save: "حفظ", saved: "تم الحفظ", close: "إغلاق", simulated: "محاكاة", inbox: "الوارد", resetDemo: "إعادة ضبط العرض", switchRole: "تبديل الدور", signOut: "مغادرة العرض", language: "اللغة", search: "بحث", filters: "تصفية", all: "الكل", markAllRead: "تحديد الكل كمقروء", email: "بريد", inApp: "داخل التطبيق", deadline: "الموعد النهائي", accept: "قبول", decline: "رفض", pending: "معلّق", accepted: "مقبول", declined: "مرفوض", viewAll: "عرض الكل", next: "التالي", done: "تم", edit: "تعديل", delete: "حذف", yes: "نعم", no: "لا", required: "مطلوب",
  },
  creator: {
    home: "الرئيسية", campaigns: "الحملات", quests: "المهام", rewards: "المكافآت", profile: "الملف",
    greeting: ["صباح الخير", "مساء الخير", "مساء الخير"],
    nextBest: "الخطوة التالية الأفضل",
    invitations: "دعوات بانتظارك",
    active: "الحملات النشطة",
    deadlines: "القادم",
    deliveries: "التوصيل",
    feedback: "آخر الملاحظات",
    recommended: "مهام مختارة لك",
    availablePts: "متاحة",
    pendingPts: "معلّقة",
  },
  stages: { draft: "مسودة", inviting: "دعوات", active: "نشطة", review: "مراجعة المحتوى", publishing: "النشر", completed: "مكتملة" },
  logistics: { address_confirmed: "تم تأكيد العنوان", preparing: "قيد التجهيز", dispatched: "تم الشحن", out_for_delivery: "في الطريق", delivered: "تم التسليم" },
  admin: {
    overview: "نظرة عامة", campaigns: "الحملات", creators: "المبدعون", review: "قائمة المراجعة", logistics: "اللوجستيات", loyalty: "الولاء", products: "مكتبة المنتجات", role: "الدور", permissions: "ما يمكن لهذا الدور فعله",
  },
};

export const dictionaries: Record<Lang, Dict> = { en, ar };
export type Dictionary = Dict;
