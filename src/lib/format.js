/** Shared display formatters used by both the public site and the admin panel. */

export const weightClassOptions = [
  "STRAWWEIGHT",
  "FLYWEIGHT",
  "BANTAMWEIGHT",
  "FEATHERWEIGHT",
  "LIGHTWEIGHT",
  "WELTERWEIGHT",
  "MIDDLEWEIGHT",
  "LIGHT_HEAVYWEIGHT",
  "HEAVYWEIGHT",
];

export const countryNames = {
  AZ: "Azerbaijan",
  BR: "Brazil",
  US: "United States",
  BG: "Bulgaria",
  PL: "Poland",
  TR: "Turkey",
  GE: "Georgia",
  MA: "Morocco",
};

const WEIGHT_CLASS_LABELS = {
  STRAWWEIGHT: "Salma çəki",
  FLYWEIGHT: "Milçək çəki",
  BANTAMWEIGHT: "Xoruz çəki",
  FEATHERWEIGHT: "Lələk çəki",
  LIGHTWEIGHT: "Yüngül çəki",
  WELTERWEIGHT: "Yarımorta çəki",
  MIDDLEWEIGHT: "Orta çəki",
  LIGHT_HEAVYWEIGHT: "Yarımağır çəki",
  HEAVYWEIGHT: "Ağır çəki",
};

/** Title-cases a SCREAMING_SNAKE enum as a readable fallback. */
export function formatResult(value = "") {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("/");
}

export function formatWeightClass(value = "") {
  return WEIGHT_CLASS_LABELS[value] || formatResult(value);
}

export const RULE_SET_LABELS = { MMA: "MMA", GRAPPLING: "Grappling", BOXING: "Boks", MUAY_THAI: "Muay Thai" };
export const formatRuleSet = (value = "") => RULE_SET_LABELS[value] || formatResult(value);

export const TRAINING_TYPE_LABELS = {
  STRIKING: "Zərbə texnikası",
  GRAPPLING: "Qreplinq",
  CONDITIONING: "Fiziki hazırlıq",
  SPARRING: "Sparrinq",
  DRILLING: "Təkrar məşq",
  RECOVERY: "Bərpa",
  OTHER: "Digər",
};
export const formatTrainingType = (value = "") => TRAINING_TYPE_LABELS[value] || formatResult(value);

export const FIGHT_RESULT_LABELS = { WIN: "Qələbə", LOSS: "Məğlub", DRAW: "Heç-heçə", NO_CONTEST: "Nəticəsiz" };
export const FIGHT_METHOD_LABELS = { KO_TKO: "KO/TKO", SUBMISSION: "Sabmişn", DECISION: "Hakim qərarı", DQ: "Diskvalifikasiya", OTHER: "Digər" };
export const formatFightResult = (value = "") => FIGHT_RESULT_LABELS[value] || formatResult(value);
export const formatFightMethod = (value = "") => FIGHT_METHOD_LABELS[value] || formatResult(value);

export const CHALLENGE_STATUS_META = {
  PENDING: { label: "Gözləyir", tone: "gold" },
  ACCEPTED: { label: "Qəbul edilib", tone: "emerald" },
  DECLINED: { label: "Rədd edilib", tone: "red" },
  COUNTERED: { label: "Qarşı təklif", tone: "blue" },
  CANCELLED: { label: "Ləğv edilib", tone: "muted" },
  COMPLETED: { label: "Tamamlanıb", tone: "muted" },
};

// Browsers ship poor "az" date data (it renders as "2026 M08 31"), so the
// Azerbaijani month names are applied by hand.
const AZ_MONTHS_SHORT = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
export function formatDate(value) {
  if (!value) return "Təyin edilməyib";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Təyin edilməyib";
  return `${String(date.getDate()).padStart(2, "0")} ${AZ_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * API-safe status: uppercased it matches the backend's PRO / AMATEUR role
 * filter, so do not localize this value. Use statusLabel() for display.
 */
export function getStatus(fighter) {
  return fighter?.isVerifiedPro || fighter?.user?.role === "PRO" ? "Pro" : "Amateur";
}

export function statusLabel(fighter) {
  return getStatus(fighter) === "Pro" ? "Pro" : "Həvəskar";
}

export function recordFromStats(stats) {
  const record = stats?.record || {};
  return `${record.wins || 0}-${record.losses || 0}-${record.draws || 0}`;
}

export function flagEmoji(code = "") {
  const normalized = String(code || "").trim().toUpperCase();
  if (normalized.length !== 2) return normalized;
  return normalized.replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

export function compactGymName(gym = "") {
  const value = gym || "Müstəqil";
  return value.length > 20 ? `${value.slice(0, 20)}…` : value;
}
