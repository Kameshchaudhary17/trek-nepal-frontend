/* Trek list comes from GET /api/treks — do NOT hardcode trek data here.
   Filter options below are UI enums; treat them as dumb dropdowns. */

export const DIFFICULTY_LEVELS = ["All", "Easy", "Moderate", "Moderate–Hard", "Hard"];
export const REGIONS = ["All Regions", "Khumbu", "Gandaki", "Bagmati", "Eastern Nepal", "Karnali"];
export const DURATIONS = [
  { label: "Any Duration", min: 0,  max: Infinity },
  { label: "Under 7 days", min: 0,  max: 6 },
  { label: "7–14 days",    min: 7,  max: 14 },
  { label: "Over 14 days", min: 15, max: Infinity },
];
