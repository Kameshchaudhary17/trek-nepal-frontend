/* ─────────────────────────────────────────────────────────────────
   ADMIN-CONTROLLED PRICING DATA  (Phase 1 MVP)
   Only platform admin edits this file.
   Phase 2: move to DB with admin dashboard CRUD.
   Phase 3: AI layer on top for dynamic suggestions.
───────────────────────────────────────────────────────────────── */

export const TREK_PRICES = [
  {
    id: "ebc",
    name: "Everest Base Camp",
    region: "Khumbu",
    difficulty: "Hard",
    minDays: 12,
    maxDays: 16,
    baseCost: { min: 700, max: 1200 },
    permits: [
      { name: "Sagarmatha National Park", cost: 30, required: true },
      { name: "TIMS Card", cost: 20, required: true },
      { name: "Khumbu Pasang Lhamu Rural Municipality", cost: 20, required: true },
    ],
    color: "#4a7aaa",
    tags: ["Classic", "Most Popular"],
    altitude: "5,364m",
    season: "Oct–Nov, Mar–May",
  },
  {
    id: "annapurna",
    name: "Annapurna Circuit",
    region: "Gandaki",
    difficulty: "Moderate–Hard",
    minDays: 14,
    maxDays: 21,
    baseCost: { min: 600, max: 1000 },
    permits: [
      { name: "ACAP (Annapurna Conservation Area)", cost: 30, required: true },
      { name: "TIMS Card", cost: 20, required: true },
    ],
    color: "#7a5aaa",
    tags: ["Scenic", "High Pass"],
    altitude: "5,416m",
    season: "Oct–Nov, Mar–Apr",
  },
  {
    id: "langtang",
    name: "Langtang Valley",
    region: "Bagmati",
    difficulty: "Moderate",
    minDays: 7,
    maxDays: 10,
    baseCost: { min: 350, max: 600 },
    permits: [
      { name: "Langtang National Park", cost: 30, required: true },
      { name: "TIMS Card", cost: 20, required: true },
    ],
    color: "#4a9a6a",
    tags: ["Family Friendly"],
    altitude: "3,870m",
    season: "Oct–Nov, Mar–May",
  },
  {
    id: "manaslu",
    name: "Manaslu Circuit",
    region: "Gandaki",
    difficulty: "Hard",
    minDays: 14,
    maxDays: 18,
    baseCost: { min: 800, max: 1400 },
    permits: [
      { name: "Manaslu Restricted Area Permit", cost: 100, required: true },
      { name: "Manaslu Conservation Area", cost: 30, required: true },
      { name: "TIMS Card", cost: 20, required: true },
    ],
    color: "#9a5a40",
    tags: ["Remote", "Off-beaten"],
    altitude: "5,106m",
    season: "Sep–Nov, Mar–May",
  },
  {
    id: "gokyo",
    name: "Gokyo Lakes",
    region: "Khumbu",
    difficulty: "Moderate–Hard",
    minDays: 12,
    maxDays: 15,
    baseCost: { min: 650, max: 1100 },
    permits: [
      { name: "Sagarmatha National Park", cost: 30, required: true },
      { name: "TIMS Card", cost: 20, required: true },
    ],
    color: "#3a8a9a",
    tags: ["Lakes", "Panoramic"],
    altitude: "5,357m",
    season: "Oct–Nov, Mar–May",
  },
  {
    id: "mustang",
    name: "Upper Mustang",
    region: "Gandaki",
    difficulty: "Moderate",
    minDays: 10,
    maxDays: 14,
    baseCost: { min: 1200, max: 2000 },
    permits: [
      { name: "Upper Mustang Restricted Area Permit", cost: 500, required: true },
      { name: "Annapurna Conservation Area", cost: 30, required: true },
      { name: "TIMS Card", cost: 20, required: true },
    ],
    color: "#aa7a30",
    tags: ["Restricted Area", "Cultural"],
    altitude: "3,840m",
    season: "May–Oct",
  },
];

/* Guide tiers — admin-set rate boundaries.
   Guides can ONLY quote within these bands (Phase 2). */
export const GUIDE_TIERS = [
  {
    id: "standard",
    label: "Standard Guide",
    desc: "NTB certified, 1–3 yrs experience, basic first aid",
    ratePerDay: { min: 25, max: 35 },
    color: "#4a9a6a",
  },
  {
    id: "senior",
    label: "Senior Guide",
    desc: "5+ yrs experience, advanced first aid, strong English",
    ratePerDay: { min: 35, max: 50 },
    color: "#4a7aaa",
  },
  {
    id: "expert",
    label: "Expert / High-Altitude",
    desc: "10+ yrs, summit credentials, multilingual, logistics expert",
    ratePerDay: { min: 50, max: 70 },
    color: "#e0b874",
  },
];

/* Seasonal demand multipliers — admin-controlled.
   AI will eventually fine-tune these per trek (Phase 3). */
export const SEASONS = [
  { id: "peak", label: "Peak Season (Oct–Nov, Mar–Apr)", multiplier: 1.0, badge: "Most Popular" },
  { id: "shoulder", label: "Shoulder (May, Sep)", multiplier: 0.85, badge: "Good Value" },
  { id: "low", label: "Low / Monsoon (Jun–Aug)", multiplier: 0.65, badge: "Budget Friendly" },
  { id: "winter", label: "Winter (Dec–Feb)", multiplier: 0.75, badge: "Quiet Trails" },
];

/* Porter rates — fixed by admin. */
export const PORTER_RATE_PER_DAY = { min: 15, max: 22 };

/* Platform fee — shown transparently to users. */
export const PLATFORM_FEE_PCT = 5;

/* AI pricing notice text shown in Phase 1 */
export const AI_NOTICE = "AI pricing suggestions coming soon — our model will factor season, demand and trek difficulty to recommend the fairest rate for your booking.";
