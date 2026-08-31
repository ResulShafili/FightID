import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Crown,
  Filter,
  Flag,
  Flame,
  Gauge,
  Globe2,
  Instagram,
  Languages,
  MapPin,
  Medal,
  Menu,
  Pencil,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  X,
  Youtube,
  Zap,
} from "lucide-react";
import React, { useEffect, useId, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  authApi,
  badgeApi,
  fighterApi,
  gymApi,
  leaderboardApi,
  notificationApi,
  seekApi,
  setAccessToken,
  tournamentApi,
} from "./lib/api";
import { createFightIdSocket } from "./lib/socket";

const navGroups = [
  { label: "Home", page: "Home" },
  {
    label: "Database",
    items: ["Fighters", "Rankings", "National Champions", "Gyms"],
  },
  {
    label: "Match",
    items: ["Compare", "Fight Board", "Tournaments"],
  },
];
const pagePaths = {
  Home: "/",
  Fighters: "/fighters",
  Rankings: "/rankings",
  Compare: "/compare",
  "Fight Board": "/fight-board",
  Tournaments: "/tournaments",
  Gyms: "/gyms",
  "National Champions": "/national-champions",
  "My Profile": "/profile",
  "Fighter Profile": "/fighters",
};
const pathToPage = (pathname) => {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/fighters/")) return "Fighter Profile";
  if (pathname.startsWith("/fighters")) return "Fighters";
  if (pathname.startsWith("/rankings")) return "Rankings";
  if (pathname.startsWith("/compare")) return "Compare";
  if (pathname.startsWith("/fight-board")) return "Fight Board";
  if (pathname.startsWith("/tournaments")) return "Tournaments";
  if (pathname.startsWith("/gyms")) return "Gyms";
  if (pathname.startsWith("/national-champions")) return "National Champions";
  if (pathname.startsWith("/profile")) return "My Profile";
  return "";
};
const fightIdLogo = "/assets/fightid-logo.svg";
const refreshTokenStorageKey = "fightidRefreshToken";
const accessTokenStorageKey = "fightidAccessToken";
const userStorageKey = "fightidUser";
const settingsStorageKey = "fightidSettings";
const defaultSettings = {
  language: "az",
  accent: "#e5202d",
  compactMode: false,
  reduceMotion: false,
};
const languageOptions = [
  { value: "az", label: "AZ", name: "Azərbaycanca" },
  { value: "en", label: "EN", name: "English" },
  { value: "tr", label: "TR", name: "Türkçe" },
  { value: "ru", label: "RU", name: "Русский" },
];
const accentOptions = [
  { value: "#e5202d", label: "Blood" },
  { value: "#f3b433", label: "Gold" },
  { value: "#12b6a0", label: "Teal" },
  { value: "#7c5cff", label: "Violet" },
];
const translations = {
  az: {
    settings: "Ayarlar",
    fightIdControls: "İdarə paneli",
    settingsDescription: "Bu brauzer üçün dil, vurğu rəngi və rahatlıq ayarları.",
    language: "Dil",
    accentColor: "Vurğu rəngi",
    otherSettings: "Digər ayarlar",
    resetSettings: "Ayarları sıfırla",
    search: "Axtarış",
    login: "Giriş",
    logout: "Hesabdan çıxış",
    joinFightId: "Qoşul",
    notifications: "Bildirişlər",
    markAllRead: "Hamısını oxunmuş et",
    noNotifications: "Hələ bildiriş yoxdur.",
    compactMode: "Yığcam görünüş",
    compactModeDesc: "Sıx döyüşçü məlumatları üçün daha dar aralıqlar.",
    reduceMotion: "Animasiya azalt",
    reduceMotionDesc: "Animasiya və hover hərəkətlərini minimuma endir.",
  },
  en: {
    settings: "Settings",
    fightIdControls: "Control panel",
    settingsDescription: "Language, accent, and comfort settings for this browser.",
    language: "Language",
    accentColor: "Accent color",
    otherSettings: "Other settings",
    resetSettings: "Reset settings",
    search: "Search",
    login: "Login",
    logout: "Log out of account",
    joinFightId: "Join",
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet.",
    compactMode: "Compact mode",
    compactModeDesc: "Tighter spacing for dense fighter data.",
    reduceMotion: "Reduce motion",
    reduceMotionDesc: "Minimize animation and hover movement.",
  },
  tr: {
    settings: "Ayarlar",
    fightIdControls: "Kontrol paneli",
    settingsDescription: "Bu tarayıcı için dil, vurgu ve kullanım ayarları.",
    language: "Dil",
    accentColor: "Vurgu rengi",
    otherSettings: "Diğer ayarlar",
    resetSettings: "Ayarları sıfırla",
    search: "Arama",
    login: "Giriş",
    logout: "Hesaptan çıkış",
    joinFightId: "Katıl",
    notifications: "Bildirimler",
    markAllRead: "Tümünü okundu yap",
    noNotifications: "Henüz bildirim yok.",
    compactMode: "Kompakt mod",
    compactModeDesc: "Yoğun dövüşçü verileri için daha sıkı aralıklar.",
    reduceMotion: "Hareketi azalt",
    reduceMotionDesc: "Animasyon ve hover hareketlerini azalt.",
  },
  ru: {
    settings: "Настройки",
    fightIdControls: "Панель управления",
    settingsDescription: "Язык, акцент и параметры удобства для этого браузера.",
    language: "Язык",
    accentColor: "Акцентный цвет",
    otherSettings: "Другие настройки",
    resetSettings: "Сбросить настройки",
    search: "Поиск",
    login: "Войти",
    logout: "Выйти из аккаунта",
    joinFightId: "Войти",
    notifications: "Уведомления",
    markAllRead: "Отметить все",
    noNotifications: "Уведомлений пока нет.",
    compactMode: "Компактный режим",
    compactModeDesc: "Меньше отступов для плотных данных.",
    reduceMotion: "Меньше анимации",
    reduceMotionDesc: "Минимизировать анимации и движения.",
  },
};

const phraseTranslations = {
  Home: { az: "Ana səhifə", tr: "Ana sayfa", ru: "Главная" },
  Database: { az: "Baza", tr: "Veritabanı", ru: "База" },
  Match: { az: "Uyğunlaşdırma", tr: "Eşleşme", ru: "Матчмейкинг" },
  Fighters: { az: "Döyüşçülər", tr: "Dövüşçüler", ru: "Бойцы" },
  Rankings: { az: "Reytinqlər", tr: "Sıralamalar", ru: "Рейтинги" },
  "National Champions": { az: "Milli çempionlar", tr: "Ulusal şampiyonlar", ru: "Национальные чемпионы" },
  Gyms: { az: "Zallar", tr: "Salonlar", ru: "Залы" },
  Compare: { az: "Müqayisə", tr: "Karşılaştır", ru: "Сравнить" },
  "Fight Board": { az: "Döyüş lövhəsi", tr: "Dövüş panosu", ru: "Доска боев" },
  Tournaments: { az: "Turnirlər", tr: "Turnuvalar", ru: "Турниры" },
};
const weightClassOptions = ["STRAWWEIGHT", "FLYWEIGHT", "BANTAMWEIGHT", "FEATHERWEIGHT", "LIGHTWEIGHT", "WELTERWEIGHT", "MIDDLEWEIGHT", "LIGHT_HEAVYWEIGHT", "HEAVYWEIGHT"];
const BADGE_META = {
  FIRST_WIN: { label: "First Blood", emoji: "🩸", desc: "Won their first fight" },
  FIRST_KO: { label: "Lights Out", emoji: "💡", desc: "First KO/TKO victory" },
  FIRST_SUBMISSION: { label: "Tap Out", emoji: "🤙", desc: "First submission win" },
  WIN_STREAK_3: { label: "On Fire", emoji: "🔥", desc: "3 wins in a row" },
  WIN_STREAK_5: { label: "Unstoppable", emoji: "⚡", desc: "5 wins in a row" },
  WIN_STREAK_10: { label: "Wrecking Machine", emoji: "🤖", desc: "10 wins in a row" },
  UNDEFEATED: { label: "Perfect Record", emoji: "💎", desc: "Undefeated with 3+ fights" },
  VETERAN_10_FIGHTS: { label: "Veteran", emoji: "🎖️", desc: "10 fights on record" },
  VETERAN_25_FIGHTS: { label: "War Machine", emoji: "⚔️", desc: "25 fights on record" },
  KO_SPECIALIST: { label: "KO Artist", emoji: "💥", desc: "5+ KO/TKO wins" },
  SUBMISSION_SPECIALIST: { label: "Submission Wizard", emoji: "🧙", desc: "5+ submission wins" },
  DECISION_MASTER: { label: "Chess Player", emoji: "♟️", desc: "5+ decision wins" },
  POINTS_500: { label: "Silver Fighter", emoji: "🥈", desc: "Reached 500 points" },
  POINTS_1000: { label: "Gold Fighter", emoji: "🥇", desc: "Reached 1000 points" },
  POINTS_2000: { label: "Champion Class", emoji: "🏆", desc: "Reached 2000 points" },
  PLATFORM_PIONEER: { label: "Pioneer", emoji: "🚀", desc: "Among the first 100 fighters" },
};

function getFighterImage(url) {
  if (!url || url.includes("thispersondoesnotexist.com") || url.includes("fighter-portrait.png")) return fightIdLogo;
  return url;
}

function hasRealPhoto(url) {
  return Boolean(url) && !url.includes("thispersondoesnotexist.com") && !url.includes("fighter-portrait.png") && !url.includes("fightid-logo");
}

function initialsFromName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "FB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTE = [
  ["#e5202d", "#6f0910"],
  ["#3b82f6", "#0b2a4a"],
  ["#f3b433", "#7a4a00"],
  ["#12b6a0", "#0a4a44"],
  ["#7c5cff", "#241670"],
  ["#f0653f", "#6f2110"],
  ["#e0457a", "#5a0f33"],
];
function paletteFor(name = "") {
  let h = 0;
  const value = String(name);
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) % 9973;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

// Avatar renders a real photo when available, otherwise a deterministic
// gradient monogram (SVG so it scales perfectly to any container size).
function Avatar({ name, photoUrl, className = "", monogram = true }) {
  const id = useId().replace(/:/g, "");
  if (hasRealPhoto(photoUrl)) {
    return <img src={photoUrl} alt={name || ""} className={`h-full w-full object-cover ${className}`} loading="lazy" />;
  }
  const [c1, c2] = paletteFor(name);
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`} role="img" aria-label={name || "Fighter"}>
      <defs>
        <linearGradient id={`av-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#av-${id})`} />
      <text x="50" y="50" dy="0.35em" textAnchor="middle" fontFamily="Oswald, Inter, sans-serif" fontSize="38" fontWeight="700" fill="rgba(255,255,255,0.92)" letterSpacing="1">
        {initialsFromName(name)}
      </text>
    </svg>
  );
}

function applyPageTranslations(language) {
  const targetLanguage = ["az", "en", "tr", "ru"].includes(language) ? language : "az";
  const reverse = new Map();

  Object.entries(phraseTranslations).forEach(([english, values]) => {
    reverse.set(english, english);
    Object.values(values).forEach((value) => reverse.set(value, english));
  });

  const translateValue = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return value;
    const english = reverse.get(trimmed);
    if (!english) return value;
    const translated = targetLanguage === "en" ? english : phraseTranslations[english]?.[targetLanguage] || english;
    return value.replace(trimmed, translated);
  };

  const root = document.getElementById("root");
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const nextValue = translateValue(node.nodeValue);
    if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
  });

  root.querySelectorAll("[placeholder]").forEach((element) => {
    const current = element.getAttribute("placeholder");
    const nextValue = translateValue(current || "");
    if (nextValue !== current) element.setAttribute("placeholder", nextValue);
  });
}

const countryNames = {
  AZ: "Azerbaijan",
  BR: "Brazil",
  US: "United States",
  BG: "Bulgaria",
  PL: "Poland",
  TR: "Turkey",
  GE: "Georgia",
  MA: "Morocco",
};

function formatWeightClass(value = "") {
  const labels = {
    STRAWWEIGHT: "Minimum çəki",
    FLYWEIGHT: "Yüngül milçək çəki",
    BANTAMWEIGHT: "Xoruz çəki",
    FEATHERWEIGHT: "Lələk çəki",
    LIGHTWEIGHT: "Yüngül çəki",
    WELTERWEIGHT: "Yarım orta çəki",
    MIDDLEWEIGHT: "Orta çəki",
    LIGHT_HEAVYWEIGHT: "Yarım ağır çəki",
    HEAVYWEIGHT: "Ağır çəki",
  };
  if (labels[value]) return labels[value];
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatResult(value = "") {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("/");
}

function formatDate(value) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function getStatus(fighter) {
  return fighter.isVerifiedPro || fighter.user?.role === "PRO" ? "Pro" : "Amateur";
}

function recordFromStats(stats) {
  const record = stats?.record || {};
  return `${record.wins || 0}-${record.losses || 0}-${record.draws || 0}`;
}

function flagEmoji(code = "") {
  const normalized = String(code || "").trim().toUpperCase();
  if (normalized.length !== 2) return normalized;
  return normalized.replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

function compactGymName(gym = "") {
  const value = gym || "Independent";
  return value.length > 18 ? `${value.slice(0, 18)}…` : value;
}

function methodsFromStats(stats) {
  const methods = stats?.methods || {};
  return [
    { label: "KO/TKO", value: methods.KO_TKO || 0, tone: "blood" },
    { label: "Submission", value: methods.SUBMISSION || 0, tone: "gold" },
    { label: "Decision", value: methods.DECISION || 0, tone: "muted" },
  ];
}

function normalizeCardFighter(fighter, index = 0) {
  return {
    id: fighter.id,
    name: fighter.fullName,
    nickname: fighter.nickname || "",
    country: countryNames[fighter.country] || fighter.country,
    countryCode: fighter.country,
    weightClass: formatWeightClass(fighter.weightClass),
    record: fighter.stats ? recordFromStats(fighter.stats) : fighter.record || "0-0-0",
    points: fighter.points || 0,
    rank: fighter.rank || index + 1,
    status: getStatus(fighter),
    federation: fighter.verifiedByFederation?.name || null,
    gym: fighter.gym || "Independent",
    image: getFighterImage(fighter.profilePhotoUrl),
    photoUrl: fighter.profilePhotoUrl || "",
  };
}

/* ---------------------------------- UI PRIMITIVES ---------------------------------- */

function Chip({ children, tone = "default", icon: Icon }) {
  const tones = {
    default: "border-white/12 bg-white/[0.04] text-zinc-300",
    red: "border-blood/45 bg-blood/15 text-red-100",
    gold: "border-gold/45 bg-gold/15 text-amber-100",
    blue: "border-sky-400/40 bg-sky-400/10 text-sky-100",
    ghost: "border-transparent bg-white/[0.05] text-zinc-400",
    solid: "border-transparent bg-blood text-white",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${tones[tone]}`}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

function Kicker({ children, icon: Icon = Flame }) {
  return (
    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-blood">
      <Icon size={14} />
      {children}
    </div>
  );
}

function Panel({ children, className = "" }) {
  return <div className={`rounded-2xl border border-white/10 bg-surface/80 backdrop-blur ${className}`}>{children}</div>;
}

function LoadingPanel({ label = "Canlı FightBase məlumatları yüklənir" }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface/70 p-6">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blood opacity-70" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-blood" />
      </span>
      <span className="text-sm font-semibold text-zinc-300">{label}…</span>
    </div>
  );
}

function ErrorPanel({ message, action }) {
  return (
    <div className="rounded-2xl border border-blood/30 bg-blood/10 p-6">
      <h3 className="font-display text-xl font-bold uppercase text-white">Canlı məlumat əlçatan deyil</h3>
      <p className="mt-2 text-sm leading-6 text-red-100/80">{message}</p>
      {action && (
        <button onClick={action.onClick} className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">
          {action.label}
        </button>
      )}
    </div>
  );
}

function EmptyState({ emoji = "🥊", title, subtitle, children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-surface/50 px-6 py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-3xl">{emoji}</div>
      <div className="font-display text-xl font-bold uppercase tracking-wide text-white">{title}</div>
      {subtitle && <div className="mt-2 max-w-sm text-sm text-zinc-400">{subtitle}</div>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

function getUserDisplayName(user) {
  return user?.fighterProfile?.fullName || user?.email || "Fighter";
}

function loadStoredSettings() {
  try {
    const stored = localStorage.getItem(settingsStorageKey);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    localStorage.removeItem(settingsStorageKey);
    return defaultSettings;
  }
}

/* ---------------------------------- AUTH MODAL ---------------------------------- */

function AuthModal({ initialTab = "login", onClose, onSuccess }) {
  const [tab, setTab] = useState(initialTab);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(null);
  const [emailCode, setEmailCode] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetStep, setResetStep] = useState("request");
  const [resetForm, setResetForm] = useState({ email: "", code: "", password: "" });

  useEffect(() => {
    setTab(initialTab);
    setError("");
    setPendingVerification(null);
    setEmailCode("");
    setResetMode(false);
    setResetStep("request");
  }, [initialTab]);

  const handleAuthSuccess = (result) => {
    if (result.accessToken) setAccessToken(result.accessToken);
    if (result.refreshToken) localStorage.setItem(refreshTokenStorageKey, result.refreshToken);
    localStorage.setItem(userStorageKey, JSON.stringify(result.user));
    onSuccess(result.user);
    onClose();
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authApi.login(loginForm);
      handleAuthSuccess(result);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const payload = { fullName: registerForm.fullName, email: registerForm.email, password: registerForm.password };
    try {
      const result = await authApi.register(payload);
      handleAuthSuccess(result);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authApi.requestPasswordReset({ email: resetForm.email });
      if (result.devCode) setResetForm((form) => ({ ...form, code: result.devCode }));
      setResetStep("confirm");
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const submitPasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await authApi.resetPassword(resetForm);
      handleAuthSuccess(result);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const submitEmailCode = async (event) => {
    event.preventDefault();
    if (!pendingVerification) return;
    setLoading(true);
    setError("");
    try {
      const result = await authApi.verifyEmailCode({
        email: pendingVerification.email,
        purpose: pendingVerification.purpose,
        code: emailCode,
      });
      handleAuthSuccess(result);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-500 focus:border-blood focus:ring-2 focus:ring-blood/30";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 px-4 py-6 backdrop-blur-md">
      <div className="grid w-full max-w-4xl animate-fade-up overflow-hidden rounded-3xl border border-white/10 bg-coal shadow-panel lg:grid-cols-[1.05fr_1fr]">
        {/* Brand panel */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1c0507] via-coal to-coal p-8 lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-blood/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-8 -right-3 select-none font-display text-[9rem] font-bold uppercase leading-none text-stroke opacity-40">FB</span>
          <div className="relative flex items-center gap-3">
            <LogoMark size={44} />
            <span className="font-display text-2xl font-bold uppercase text-white">FightBase</span>
          </div>
          <div className="relative mt-auto pt-16">
            <h3 className="font-display text-4xl font-bold uppercase leading-[0.95] text-white">Döyüşçü<br />kimliyini qur</h3>
            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-400">Təsdiqli rekord, çəki reytinqləri və real uyğunlaşdırma — hamısı bir platformada.</p>
            <div className="mt-7 grid gap-3">
              {[[ShieldCheck, "Təsdiqli döyüş rekordları"], [Gauge, "Çəki üzrə reytinqlər"], [Swords, "Çağırış və uyğunlaşdırma"]].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-blood/30 bg-blood/10 text-blood"><Icon size={16} /></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex max-h-[92vh] flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div className="flex items-center gap-3 lg:hidden">
              <LogoMark size={36} />
              <span className="font-display text-xl font-bold uppercase text-white">FightBase</span>
            </div>
            <h2 className="hidden font-display text-xl font-bold uppercase text-white lg:block">
              {resetMode ? "Parolu yenilə" : pendingVerification ? "Email təsdiqi" : tab === "login" ? "Xoş gəldin" : "Hesab yarat"}
            </h2>
            <button onClick={onClose} className="rounded-lg border border-white/12 p-2 text-white transition hover:bg-white/10" aria-label="Close auth modal">
              <X size={18} />
            </button>
          </div>

          {!resetMode && !pendingVerification && (
            <div className="mx-6 mt-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/30 p-1">
              {["login", "register"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setTab(item);
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-black uppercase tracking-[0.12em] transition ${
                    tab === item ? "bg-blood text-white shadow-red" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item === "login" ? "Giriş" : "Qeydiyyat"}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
          {error && (
            <div className="mb-5 rounded-xl border border-blood/40 bg-blood/15 px-4 py-3 text-sm font-semibold text-red-100">{error}</div>
          )}

          {resetMode ? (
            <form onSubmit={resetStep === "request" ? requestPasswordReset : submitPasswordReset} className="grid gap-4">
              <Field label="Email">
                <input required type="email" value={resetForm.email} onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })} className={inputClass} placeholder="email@gmail.com" disabled={resetStep === "confirm"} />
              </Field>
              {resetStep === "confirm" && (
                <>
                  <Field label="Email kodu">
                    <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={resetForm.code} onChange={(e) => setResetForm({ ...resetForm, code: e.target.value.replace(/\D/g, "").slice(0, 6) })} className={`${inputClass} text-center text-2xl tracking-[0.5em]`} placeholder="000000" />
                  </Field>
                  <Field label="Yeni parol">
                    <input required minLength={8} type="password" value={resetForm.password} onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })} className={inputClass} placeholder="Ən az 8 simvol" />
                  </Field>
                </>
              )}
              <PrimaryButton disabled={loading}>{loading ? "Gözləyin…" : resetStep === "request" ? "Kod göndər" : "Parolu yenilə"}</PrimaryButton>
              <button type="button" onClick={() => { setResetMode(false); setResetStep("request"); setError(""); }} className="text-sm font-bold text-zinc-400 transition hover:text-white">
                ← Girişə qayıt
              </button>
            </form>
          ) : pendingVerification ? (
            <form onSubmit={submitEmailCode} className="grid gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-display text-lg font-bold uppercase text-white">Email təsdiqi</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Kodu <span className="font-bold text-white">{pendingVerification.email}</span> ünvanına göndərdik.
                </p>
                {!pendingVerification.emailSent && pendingVerification.devCode && (
                  <p className="mt-3 rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-sm font-bold text-amber-100">Test kodu: {pendingVerification.devCode}</p>
                )}
              </div>
              <Field label="Təsdiq kodu">
                <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className={`${inputClass} text-center text-2xl tracking-[0.5em]`} placeholder="000000" />
              </Field>
              <PrimaryButton disabled={loading || emailCode.length !== 6}>{loading ? "Təsdiqlənir…" : "Təsdiqlə və davam et"}</PrimaryButton>
              <button type="button" onClick={() => { setPendingVerification(null); setEmailCode(""); setError(""); }} className="text-sm font-bold text-zinc-400 transition hover:text-white">← Geri</button>
            </form>
          ) : tab === "login" ? (
            <form onSubmit={submitLogin} className="grid gap-4">
              <Field label="Email">
                <input required type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className={inputClass} placeholder="fighter@fightbase.app" />
              </Field>
              <Field label="Parol">
                <input required type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className={inputClass} placeholder="Parolun" />
              </Field>
              <PrimaryButton disabled={loading}>{loading ? "Giriş edilir…" : "Giriş"}</PrimaryButton>
              <button type="button" onClick={() => { setResetForm((form) => ({ ...form, email: loginForm.email })); setResetMode(true); setResetStep("request"); setError(""); }} className="text-left text-sm font-bold text-zinc-400 transition hover:text-white">
                Parolu unutdun? Kodla yenilə
              </button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="grid gap-4">
              <Field label="Ad və soyad">
                <input required value={registerForm.fullName} onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })} className={inputClass} placeholder="Ad Soyad" />
              </Field>
              <Field label="Email">
                <input required type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} className={inputClass} placeholder="fighter@fightbase.app" />
              </Field>
              <Field label="Parol">
                <input required type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} className={inputClass} placeholder="Ən az 8 simvol" />
              </Field>
              <p className="text-sm leading-6 text-zinc-500">Ləqəb, doğum tarixi, ölkə, çəki dərəcəsi və zal məlumatlarını sonra profilindən əlavə edə bilərsən.</p>
              <PrimaryButton disabled={loading}>{loading ? "Hesab yaradılır…" : "Qeydiyyatdan keç"}</PrimaryButton>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
      {label}
      {children}
    </label>
  );
}

function PrimaryButton({ children, disabled, className = "", ...rest }) {
  return (
    <button
      disabled={disabled}
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-blood px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-red transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- LOGO ---------------------------------- */

function LogoMark({ size = 40 }) {
  return (
    <span
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blood to-[#9d0d16] font-display font-bold text-white shadow-red"
      style={{ height: size, width: size, fontSize: size * 0.42 }}
    >
      <span className="absolute -left-1 top-0 h-full w-[3px] rotate-[18deg] bg-white/40" />
      FB
    </span>
  );
}

/* ---------------------------------- SETTINGS PANEL ---------------------------------- */

function SettingsPanel({ open, settings, onChange, onClose, t, user, onLogout }) {
  if (!open) return null;

  const toggleRows = [
    { key: "compactMode", label: t.compactMode, description: t.compactModeDesc },
    { key: "reduceMotion", label: t.reduceMotion, description: t.reduceMotionDesc },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="FightBase settings">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close settings" />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-coal shadow-panel">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
          <div>
            <Chip tone="red" icon={Settings}>{t.settings}</Chip>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase text-white">{t.fightIdControls}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t.settingsDescription}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/12 p-2 text-white transition hover:bg-white/10" aria-label="Close settings">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6">
          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
              <Languages size={16} />
              {t.language}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((language) => (
                <button
                  key={language.value}
                  onClick={() => onChange({ language: language.value })}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    settings.language === language.value ? "border-blood bg-blood/15 text-white" : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-black">{language.label}</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">{language.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
              <SlidersHorizontal size={16} />
              {t.accentColor}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {accentOptions.map((accent) => (
                <button
                  key={accent.value}
                  onClick={() => onChange({ accent: accent.value })}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    settings.accent === accent.value ? "border-white/40 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="h-5 w-5 rounded-full border border-white/30" style={{ backgroundColor: accent.value }} />
                  <span className="text-sm font-black">{accent.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">{t.otherSettings}</div>
            {toggleRows.map((row) => (
              <label key={row.key} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
                <span>
                  <span className="block text-sm font-bold text-white">{row.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-500">{row.description}</span>
                </span>
                <input type="checkbox" checked={Boolean(settings[row.key])} onChange={(e) => onChange({ [row.key]: e.target.checked })} className="h-5 w-5 accent-[#e5202d]" />
              </label>
            ))}
          </section>
        </div>

        <div className="grid gap-3 border-t border-white/10 p-6">
          <button onClick={() => onChange(defaultSettings)} className="w-full rounded-xl border border-white/12 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
            {t.resetSettings}
          </button>
          {user && (
            <button onClick={async () => { await onLogout?.(); onClose(); }} className="w-full rounded-xl bg-blood px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-red transition hover:brightness-110">
              {t.logout}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ---------------------------------- HEADER ---------------------------------- */

function AppHeader({ page, setPage, user, settings, t, onSettingsClick, onLoginClick, onRegisterClick }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const notificationsRef = useRef(null);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNotificationsOpen(false);
      return;
    }
    notificationApi.list().then(setNotifications).catch(() => setNotifications([]));
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggleNotifications = async () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    setNotificationError("");
    if (nextOpen) {
      try {
        setNotifications(await notificationApi.list());
      } catch (caught) {
        setNotificationError(caught.message);
      }
    }
  };

  const markNotificationRead = async (notification) => {
    try {
      const updated = await notificationApi.markRead(notification.id);
      setNotifications((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    } catch (caught) {
      setNotificationError(caught.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (caught) {
      setNotificationError(caught.message);
    }
  };

  const NotificationBell = () => (
    <div className="relative" ref={notificationsRef}>
      <button onClick={toggleNotifications} className="relative rounded-lg border border-white/12 p-2 text-white transition hover:bg-white/10" aria-label="Open notifications">
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-blood px-1 text-[10px] font-black text-white ring-2 ring-coal">{unreadCount}</span>
        )}
      </button>
      {notificationsOpen && (
        <div className="absolute right-0 top-12 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-coal shadow-panel">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-white">{t.notifications}</span>
            <button onClick={markAllNotificationsRead} className="rounded-lg bg-blood px-3 py-1.5 text-xs font-black text-white transition hover:brightness-110">{t.markAllRead}</button>
          </div>
          {notificationError && <div className="border-b border-blood/30 bg-blood/15 p-3 text-sm font-semibold text-red-100">{notificationError}</div>}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-5 text-center text-sm text-zinc-500">{t.noNotifications}</div>
            ) : (
              notifications.map((notification) => (
                <button key={notification.id} onClick={() => markNotificationRead(notification)} className={`block w-full border-b border-white/8 p-4 text-left transition hover:bg-white/[0.04] ${notification.isRead ? "" : "bg-blood/[0.08]"}`}>
                  <div className="flex items-start gap-3">
                    {!notification.isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blood" />}
                    <div>
                      <div className={`text-sm font-semibold ${notification.isRead ? "text-zinc-400" : "text-white"}`}>{notification.message}</div>
                      <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-600">{formatDate(notification.createdAt)}</div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/10 bg-ink/85 shadow-panel backdrop-blur-xl" : "border-b border-transparent bg-gradient-to-b from-ink/90 to-transparent"}`}>
      <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6">
        <button onClick={() => setPage("Home")} className="flex shrink-0 items-center gap-3">
          <LogoMark size={40} />
          <span className="text-left">
            <span className="block font-display text-xl font-bold uppercase leading-none tracking-wide text-white">FightBase</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500 max-[420px]:hidden">Verified fight records</span>
          </span>
        </button>

        <nav className="hidden min-w-0 items-center justify-center gap-1 lg:flex">
          {navGroups.map((group) => {
            const isActive = group.page === page || group.items?.includes(page);
            if (group.page) {
              return (
                <button
                  key={group.label}
                  onClick={() => setPage(group.page)}
                  className={`relative rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] transition ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`}
                >
                  {group.label}
                  {isActive && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-blood" />}
                </button>
              );
            }
            return (
              <div key={group.label} className="group relative">
                <button className={`relative inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold uppercase tracking-[0.1em] transition ${isActive ? "text-white" : "text-zinc-400 hover:text-white"}`}>
                  {group.label}
                  <ChevronDown className="transition group-hover:rotate-180" size={14} />
                  {isActive && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-blood" />}
                </button>
                <div className="invisible absolute left-1/2 top-full z-[70] w-56 -translate-x-1/2 translate-y-2 rounded-2xl border border-white/10 bg-coal p-2 opacity-0 shadow-panel transition-all duration-200 group-hover:visible group-hover:translate-y-1 group-hover:opacity-100">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${page === item ? "bg-blood/15 text-white" : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"}`}
                    >
                      {item}
                      <ChevronRight size={14} className="text-zinc-600" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <button onClick={() => setPage("Fighters")} className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/10">
            <Search size={16} />
            {t.search}
          </button>
          <button onClick={onSettingsClick} className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/10">
            <Settings size={16} />
            <span>{settings?.language?.toUpperCase() || "AZ"}</span>
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button onClick={() => setPage("My Profile")} className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-sm font-bold text-white transition hover:bg-white/10">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-blood text-[11px] font-black text-white">{getUserDisplayName(user).charAt(0).toUpperCase()}</span>
                <span className="max-w-[120px] truncate">Profilim</span>
              </button>
            </div>
          ) : (
            <>
              <button onClick={onLoginClick} className="inline-flex items-center rounded-lg border border-white/12 px-3 py-2 text-sm font-black text-white transition hover:bg-white/10">{t.login}</button>
              <button onClick={onRegisterClick} className="inline-flex items-center gap-1.5 rounded-lg bg-blood px-3.5 py-2 text-sm font-black text-white shadow-red transition hover:brightness-110">
                {t.joinFightId}
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {user ? <NotificationBell /> : (
            <button onClick={onLoginClick} className="rounded-lg bg-blood px-3.5 py-2 text-xs font-black text-white shadow-red md:hidden">{t.login}</button>
          )}
          <button onClick={onSettingsClick} className="rounded-lg border border-white/12 p-2 text-white transition hover:bg-white/10" aria-label="Open settings">
            <Settings size={18} />
          </button>
          <button className="rounded-lg border border-white/12 p-2 text-white transition hover:bg-white/10" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[65px] max-h-[calc(100vh-65px)] overflow-y-auto overscroll-contain border-t border-white/10 bg-ink/97 px-4 py-4 backdrop-blur-xl lg:hidden">
          {navGroups.map((group) => (
            <div key={group.label} className="py-1">
              {group.page ? (
                <button onClick={() => { setPage(group.page); setOpen(false); }} className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-bold uppercase tracking-wide ${page === group.page ? "bg-blood/15 text-white" : "text-zinc-300 hover:bg-white/[0.05]"}`}>
                  {group.label}
                </button>
              ) : (
                <>
                  <div className="px-4 pt-3 text-[11px] font-black uppercase tracking-[0.22em] text-zinc-600">{group.label}</div>
                  <div className="mt-1 grid gap-1">
                    {group.items.map((item) => (
                      <button key={item} onClick={() => { setPage(item); setOpen(false); }} className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold ${page === item ? "bg-blood/15 text-white" : "text-zinc-300 hover:bg-white/[0.05]"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="mt-3 grid gap-2 border-t border-white/10 pt-4">
            {user ? (
              <button onClick={() => { setPage("My Profile"); setOpen(false); }} className="block w-full rounded-xl bg-blood px-4 py-3 text-left text-sm font-black text-white shadow-red">Profilim</button>
            ) : (
              <>
                <button onClick={() => { onLoginClick(); setOpen(false); }} className="block w-full rounded-xl border border-white/12 px-4 py-3 text-left text-sm font-black text-white hover:bg-white/10">{t.login}</button>
                <button onClick={() => { onRegisterClick(); setOpen(false); }} className="block w-full rounded-xl bg-blood px-4 py-3 text-left text-sm font-black text-white shadow-red">{t.joinFightId}</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------------------------- FIGHTER CARD ---------------------------------- */

function FighterCard({ fighter, onOpen }) {
  const isPro = fighter.status === "Pro";
  return (
    <button
      onClick={() => onOpen?.(fighter.id)}
      className="card-sheen group relative overflow-hidden rounded-2xl border border-white/10 bg-surface text-left shadow-panel transition duration-300 hover:-translate-y-1 hover:border-blood/50 hover:shadow-glow"
    >
      <div className="relative flex gap-4 p-4">
        <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black">
          <Avatar name={fighter.name} photoUrl={fighter.photoUrl} className="transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 font-mono text-xs font-bold text-white backdrop-blur">#{fighter.rank}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip tone={isPro ? "red" : "default"}>{fighter.status}</Chip>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-500">{flagEmoji(fighter.countryCode)} {fighter.countryCode}</span>
          </div>
          <h3 className="mt-2.5 truncate font-display text-2xl font-bold uppercase leading-none text-white transition group-hover:text-red-100">{fighter.name}</h3>
          <p className="mt-1 h-4 truncate text-sm font-medium italic text-zinc-500">{fighter.nickname ? `“${fighter.nickname}”` : ""}</p>
          <p className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-zinc-500">{fighter.weightClass}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-white/8 border-t border-white/8 bg-black/20">
        <div className="px-3 py-3">
          <div className="font-mono text-lg font-bold text-white">{fighter.record}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">Rekord</div>
        </div>
        <div className="px-3 py-3">
          <div className="font-mono text-lg font-bold text-blood">{fighter.points}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">Xal</div>
        </div>
        <div className="px-3 py-3" title={fighter.gym}>
          <div className="truncate text-sm font-bold leading-6 text-white">{compactGymName(fighter.gym)}</div>
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-600">Zal</div>
        </div>
      </div>
    </button>
  );
}

/* ---------------------------------- LANDING ---------------------------------- */

function LandingPage({ setPage, openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [stats, setStats] = useState({ fighters: "—", gyms: "—", countries: "—" });
  const [error, setError] = useState("");

  useEffect(() => {
    const storedAccessToken = localStorage.getItem(accessTokenStorageKey);
    if (storedAccessToken) setAccessToken(storedAccessToken);

    let ignore = false;
    Promise.all([fighterApi.leaderboard({ limit: 5 }), fighterApi.list({ limit: 100 })])
      .then(([leaderboardResult, fighterResult]) => {
        if (ignore) return;
        const leaders = leaderboardResult.data || [];
        const allFighters = fighterResult.data || [];
        const sourceLeaders = leaders.map((leader) => {
          const fullRecord = allFighters.find((fighter) => fighter.id === leader.id);
          return fullRecord ? { ...leader, ...fullRecord, rank: leader.rank || fullRecord.rank } : leader;
        });
        setFighters(sourceLeaders.map(normalizeCardFighter));
        setStats({
          fighters: fighterResult.pagination?.total || allFighters.length || leaders.length,
          gyms: new Set(allFighters.map((fighter) => fighter.gym).filter(Boolean)).size || 0,
          countries: new Set(allFighters.map((fighter) => fighter.country)).size || 0,
        });
      })
      .catch((caught) => {
        if (ignore) return;
        setFighters([]);
        setStats({ fighters: 0, gyms: 0, countries: 0 });
        setError(caught.message);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const tickerItems = ["Verified fight records", "Weight-class rankings", "Head-to-head compare", "Amateur-first profiles", "Federation review", "National champions", "Gym network", "Challenge system"];

  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <span className="pointer-events-none absolute left-1/2 top-[14%] -z-0 -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] font-bold uppercase leading-none text-stroke opacity-[0.5]">Fight</span>
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:pb-20 lg:pt-28">
          <div className="animate-fade-up">
            <Chip tone="red" icon={ShieldCheck}>Verified MMA fighter platform</Chip>
            <h1 className="mt-6 font-display text-6xl font-bold uppercase leading-[0.92] text-white sm:text-7xl xl:text-8xl">
              Döyüş
              <br />
              rekord
              <br />
              <span className="relative inline-block text-blood">
                bazası
                <span className="absolute -bottom-2 left-0 h-1.5 w-full bg-gradient-to-r from-blood to-transparent" />
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400">
              FightBase ciddi döyüş idmanı bazasıdır: təsdiqli döyüşçü profilləri, axtarıla bilən həvəskar rekordları, çəki reytinqləri, zal bağlantıları və real uyğunlaşdırma üçün təmiz kəşf alətləri.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setPage("Fighters")} className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blood px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-red transition hover:brightness-110">
                Bazadan axtar
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </button>
              <button onClick={() => setPage("Rankings")} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-7 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/10">
                <Trophy size={18} className="text-gold" />
                Reytinqlər
              </button>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                [stats.fighters, "Döyüşçü", Users],
                [stats.countries, "Ölkə", Globe2],
                [stats.gyms, "Zal", Target],
              ].map(([value, label, Icon]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-surface/70 p-4">
                  <Icon size={16} className="text-blood" />
                  <div className="mt-2 font-display text-3xl font-bold text-white">{value}</div>
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live leaderboard card */}
          <div className="animate-fade-up rounded-3xl border border-white/10 bg-gradient-to-b from-surface to-coal p-1.5 shadow-panel lg:mt-4" style={{ animationDelay: "120ms" }}>
            <div className="rounded-[20px] border border-white/8 bg-black/30 p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blood">
                    <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blood opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-blood" /></span>
                    Canlı reytinq
                  </div>
                  <h2 className="mt-2 font-display text-xl font-bold uppercase text-white">Ən yüksək döyüşçülər</h2>
                </div>
                <button onClick={() => setPage("Rankings")} className="rounded-lg border border-white/12 px-3 py-2 text-xs font-black uppercase tracking-wide text-white transition hover:bg-white/10">Tam cədvəl</button>
              </div>
              <div className="mt-2 divide-y divide-white/8">
                {fighters.length === 0 && (
                  <div className="py-10 text-center text-sm text-zinc-500">Hələ canlı döyüşçü yoxdur. Yeni qeydiyyatlar burada görünəcək.</div>
                )}
                {fighters.slice(0, 5).map((fighter, index) => (
                  <button key={fighter.id} onClick={() => openProfile?.(fighter.id)} className="grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 py-3 text-left transition hover:bg-white/[0.03]">
                    <div className={`text-center font-display text-2xl font-bold ${index === 0 ? "text-gold" : index === 1 ? "text-zinc-300" : index === 2 ? "text-amber-700" : "text-zinc-600"}`}>{fighter.rank || index + 1}</div>
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10"><Avatar name={fighter.name} photoUrl={fighter.photoUrl} /></div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">{fighter.name}</div>
                        <div className="mt-0.5 truncate font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-500">{flagEmoji(fighter.countryCode)} {fighter.record}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-blood">{fighter.points}</div>
                      <div className="text-[10px] font-black uppercase tracking-wide text-zinc-600">xal</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="relative border-y border-white/10 bg-black/30 py-3">
          <div className="flex w-max animate-marquee gap-8">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="flex items-center gap-8 text-sm font-black uppercase tracking-[0.2em] text-zinc-500">
                {item}
                <span className="text-blood">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <Kicker icon={Zap}>Nə üçün FightBase</Kicker>
          <h2 className="mt-4 font-display text-4xl font-bold uppercase text-white sm:text-5xl">Bir platforma, bütün döyüş idmanı</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            [ShieldCheck, "Təsdiqli rekordlar", "Döyüşçü kimlikləri, zallar, ölkələr və döyüş tarixçələri bir ictimai bazada."],
            [Activity, "Həvəskar mərkəzli", "Gənc döyüşçülərə böyük promouşenlərə çatmadan təmiz profil səhifəsi."],
            [Gauge, "Çəkili reytinqlər", "Rəqib reytinqi, aktivlik və status həftəlik liderlik cədvəlinə təsir edir."],
            [Globe2, "Yerli kəşf", "Döyüşçüləri ölkə, zal, çəki, reytinq və aktivliyə görə tap."],
          ].map(([Icon, title, text], i) => (
            <div key={title} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface/70 p-6 transition hover:-translate-y-1 hover:border-blood/40">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blood/10 blur-2xl transition group-hover:bg-blood/20" />
              <div className="relative">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-blood/30 bg-blood/10 text-blood">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold uppercase text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOP FIGHTERS */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="flex flex-col justify-between gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end">
          <div>
            <Kicker icon={TrendingUp}>Döyüşçü indeksi</Kicker>
            <h2 className="mt-4 font-display text-4xl font-bold uppercase text-white sm:text-5xl">Reytinqli profillər, real rekordlar</h2>
          </div>
          <button onClick={() => setPage("Rankings")} className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/12 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
            Tam reytinq cədvəli
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {error && <div className="col-span-full"><ErrorPanel message="Canlı bağlantı yenidən qurulur. Mock döyüşçülər göstərilmir." /></div>}
          {!error && fighters.length === 0 && (
            <div className="col-span-full"><EmptyState title="Hələ döyüşçü yoxdur" subtitle="Yeni qeydiyyatlar avtomatik burada görünəcək." /></div>
          )}
          {fighters.map((fighter) => (
            <FighterCard key={fighter.id} fighter={fighter} onOpen={openProfile} />
          ))}
        </div>
      </section>
    </main>
  );
}

/* ---------------------------------- FIGHTERS PAGE ---------------------------------- */

function PageShell({ children, className = "" }) {
  return <main className={`mx-auto min-h-screen max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 ${className}`}>{children}</main>;
}

function PageHeader({ kicker, kickerIcon, title, subtitle, right }) {
  return (
    <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && <Kicker icon={kickerIcon}>{kicker}</Kicker>}
        <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-[0.95] text-white sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function FightersPage({ openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [weightClass, setWeightClass] = useState("");
  const [country, setCountry] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalFighters, setTotalFighters] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      fighterApi
        .list({ limit: 24, search, role, weightClass, country })
        .then((result) => {
          setFighters((result.data || []).map(normalizeCardFighter));
          setTotalFighters(result.pagination?.total || result.data?.length || 0);
        })
        .catch((caught) => {
          if (caught.name !== "AbortError") {
            setFighters([]);
            setError(caught.message);
          }
        })
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [search, role, weightClass, country]);

  const selectClass = "rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-blood";

  return (
    <PageShell>
      <PageHeader
        kicker="Canlı döyüşçü bazası"
        kickerIcon={Users}
        title="Döyüşçü Bazası"
        subtitle="Rekordları, zalları, ölkələri, xalları və profil statusunu bir yığcam döyüş idmanı bazasında axtar."
      />

      {totalFighters < 20 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-3 text-sm font-semibold text-amber-100/90">
          <Sparkles size={16} className="text-gold" /> FightBase açıq beta mərhələsindədir — bazamız böyüyür.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface/60 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ad, ləqəb və ya zal ilə axtar" className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-500 focus:border-blood" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass}>
          <option value="">Bütün statuslar</option>
          <option value="PRO">Pro</option>
          <option value="AMATEUR">Həvəskar</option>
        </select>
        <button onClick={() => setShowFilters((v) => !v)} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold text-white transition ${showFilters ? "border-blood bg-blood/15" : "border-white/12 hover:bg-white/10"}`}>
          <Filter size={16} />
          Filtr
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 grid gap-3 rounded-2xl border border-white/10 bg-surface/40 p-4 sm:grid-cols-3">
          <select value={weightClass} onChange={(e) => setWeightClass(e.target.value)} className={selectClass}>
            <option value="">Bütün çəki dərəcələri</option>
            {weightClassOptions.map((item) => <option key={item} value={item}>{formatWeightClass(item)}</option>)}
          </select>
          <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))} placeholder="Ölkə kodu, məsələn AZ" className={selectClass} />
          <button onClick={() => { setSearch(""); setRole(""); setWeightClass(""); setCountry(""); }} className="rounded-xl border border-white/12 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
            Filtrləri sıfırla
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading && <div className="col-span-full"><LoadingPanel label="Döyüşçülər yüklənir" /></div>}
        {error && <div className="col-span-full"><ErrorPanel message="Canlı bağlantı yenidən qurulur. Mock döyüşçülər göstərilmir." /></div>}
        {!loading && !error && fighters.length === 0 && (
          <div className="col-span-full"><EmptyState emoji="🔎" title="Döyüşçü tapılmadı" subtitle="Axtarışı və ya filtrləri dəyiş, yaxud yeni qeydiyyatları gözlə." /></div>
        )}
        {!loading && fighters.map((fighter) => <FighterCard key={fighter.id} fighter={fighter} onOpen={openProfile} />)}
      </div>
    </PageShell>
  );
}

function MethodBar({ method, total }) {
  const pct = total > 0 ? Math.round((method.value / total) * 100) : 0;
  const tones = { blood: "bg-blood", gold: "bg-gold", muted: "bg-zinc-500" };
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-white">{method.label}</span>
        <span className="font-mono text-zinc-400">{method.value} <span className="text-zinc-600">({pct}%)</span></span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
        <div className={`h-full rounded-full ${tones[method.tone]} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SimpleFeaturePage({ title, badge, loader, renderItem, empty = "Hələ heç nə yoxdur.", user, loginRequired = false, onLoginClick }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loginRequired && !user) {
      setLoading(false);
      return;
    }
    let ignore = false;
    setLoading(true);
    loader()
      .then((result) => {
        if (!ignore) setItems(result?.data || result || []);
      })
      .catch((caught) => {
        if (!ignore) setError(caught.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [user, loginRequired]);

  if (loginRequired && !user) {
    return (
      <PageShell>
        <Panel className="p-8">
          <Chip tone="red">{badge}</Chip>
          <h1 className="mt-5 font-display text-4xl font-bold uppercase text-white">Davam etmək üçün giriş et</h1>
          <button onClick={onLoginClick} className="mt-6 rounded-xl bg-blood px-5 py-3 font-black text-white shadow-red">Giriş</button>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {(badge || title) && (
        <div className="border-b border-white/10 pb-6">
          {badge && <Chip tone="red">{badge}</Chip>}
          {title && <h1 className="mt-4 font-display text-5xl font-bold uppercase leading-none text-white sm:text-6xl">{title}</h1>}
        </div>
      )}
      {loading && <div className="mt-8"><LoadingPanel /></div>}
      {error && <div className="mt-8"><ErrorPanel message={error} /></div>}
      {!loading && !error && items.length === 0 && <div className="mt-8"><EmptyState title={empty} /></div>}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
    </PageShell>
  );
}

/* ---------------------------------- MY PROFILE (edit) ---------------------------------- */

function MyProfilePage({ user, onLoginClick, onUserUpdate, openProfile }) {
  const profile = user?.fighterProfile;
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(() => ({
    fullName: profile?.fullName || "",
    nickname: profile?.nickname || "",
    dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
    country: profile?.country || "AZ",
    weightClass: profile?.weightClass || "LIGHTWEIGHT",
    gym: profile?.gym || "",
    bio: profile?.bio || "",
    instagramUrl: profile?.instagramUrl || "",
    youtubeUrl: profile?.youtubeUrl || "",
    coverPhotoUrl: profile?.coverPhotoUrl || "",
  }));
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName || "",
      nickname: profile.nickname || "",
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
      country: profile.country || "AZ",
      weightClass: profile.weightClass || "LIGHTWEIGHT",
      gym: profile.gym || "",
      bio: profile.bio || "",
      instagramUrl: profile.instagramUrl || "",
      youtubeUrl: profile.youtubeUrl || "",
      coverPhotoUrl: profile.coverPhotoUrl || "",
    });
  }, [profile]);

  if (!user) {
    return (
      <PageShell>
        <Panel className="p-8">
          <Chip tone="red">Profil</Chip>
          <h1 className="mt-5 font-display text-4xl font-bold uppercase text-white">Döyüşçü profilini redaktə etmək üçün giriş et</h1>
          <button onClick={onLoginClick} className="mt-6 rounded-xl bg-blood px-5 py-3 font-black text-white shadow-red">Giriş</button>
        </Panel>
      </PageShell>
    );
  }

  const inputClass = "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-500 focus:border-blood";
  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      let updatedProfile = await fighterApi.updateMe({
        fullName: form.fullName,
        nickname: form.nickname || null,
        dateOfBirth: form.dateOfBirth || undefined,
        country: (form.country || "AZ").toUpperCase(),
        weightClass: form.weightClass || "LIGHTWEIGHT",
        gym: form.gym || null,
        bio: form.bio || null,
        instagramUrl: form.instagramUrl || null,
        youtubeUrl: form.youtubeUrl || null,
        coverPhotoUrl: form.coverPhotoUrl || null,
      });

      let uploadWarning = "";
      if (photoFile) {
        try {
          updatedProfile = await fighterApi.uploadPhoto(photoFile);
          setPhotoFile(null);
        } catch (caught) {
          uploadWarning = caught.message?.includes("Cloudinary")
            ? "Şəkil yüklənmədi: serverdə Cloudinary ayarlanmayıb."
            : `Şəkil yüklənmədi: ${caught.message}`;
          setPhotoFile(null);
        }
      }

      const nextUser = { ...user, fighterProfile: { ...user.fighterProfile, ...updatedProfile } };
      localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
      onUserUpdate(nextUser);
      setMessage(uploadWarning || "Profil yeniləndi.");
      setEditMode(false);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  if (!editMode) {
    return (
      <div className="relative">
        <button onClick={() => setEditMode(true)} className="fixed right-4 top-24 z-40 inline-flex items-center gap-2 rounded-full border border-white/15 bg-coal px-4 py-3 text-sm font-black text-white shadow-red transition hover:border-blood hover:bg-blood" title="Profili redaktə et">
          <Pencil size={16} /> Redaktə
        </button>
        <FighterProfilePage fighterId={profile?.id} openProfile={openProfile} user={user} onLoginRequired={onLoginClick} />
      </div>
    );
  }

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="self-start rounded-2xl border border-white/10 bg-surface p-5">
          <Chip tone="red">Döyüşçü profili</Chip>
          <div className="mt-5 h-72 w-full overflow-hidden rounded-xl border border-white/10"><Avatar name={form.fullName} photoUrl={profile?.profilePhotoUrl} /></div>
          <label className="mt-4 block rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm font-bold text-zinc-200">
            Profil şəkli
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} className="mt-3 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-blood file:px-4 file:py-2 file:font-black file:text-white" />
          </label>
          <p className="mt-4 text-sm leading-6 text-zinc-500">İctimai döyüşçü səhifənin səliqəli görünməsi üçün bu məlumatları tamamla.</p>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Chip>Profilim</Chip>
              <h1 className="mt-4 font-display text-4xl font-bold uppercase text-white sm:text-5xl">Profili redaktə et</h1>
            </div>
            <button type="button" onClick={() => setEditMode(false)} className="rounded-xl border border-white/12 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">← Profilə qayıt</button>
          </div>

          {message && <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">{message}</div>}
          {error && <div className="mt-6 rounded-xl border border-blood/40 bg-blood/15 px-4 py-3 text-sm font-bold text-red-100">{error}</div>}

          <form onSubmit={saveProfile} className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Ad və soyad"><input required value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} className={inputClass} /></Field>
            <Field label="Ləqəb"><input value={form.nickname} onChange={(e) => updateField("nickname", e.target.value)} className={inputClass} placeholder="İstəyə bağlı" /></Field>
            <Field label="Doğum tarixi"><input type="date" value={form.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} className={inputClass} /></Field>
            <Field label="Ölkə"><input value={form.country} onChange={(e) => updateField("country", e.target.value.toUpperCase())} className={inputClass} maxLength={2} /></Field>
            <Field label="Çəki dərəcəsi">
              <select value={form.weightClass} onChange={(e) => updateField("weightClass", e.target.value)} className={inputClass}>
                {weightClassOptions.map((value) => <option key={value} value={value}>{formatWeightClass(value)}</option>)}
              </select>
            </Field>
            <Field label="Zal / klub"><input value={form.gym} onChange={(e) => updateField("gym", e.target.value)} className={inputClass} placeholder="Zal / klub adı" /></Field>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 sm:col-span-2">
              Bioqrafiya
              <textarea value={form.bio} onChange={(e) => updateField("bio", e.target.value)} className={`${inputClass} min-h-28 resize-y`} placeholder="Qısa döyüşçü bioqrafiyası" />
            </label>
            <Field label="Instagram URL"><input value={form.instagramUrl} onChange={(e) => updateField("instagramUrl", e.target.value)} className={inputClass} placeholder="https://instagram.com/…" /></Field>
            <Field label="YouTube URL"><input value={form.youtubeUrl} onChange={(e) => updateField("youtubeUrl", e.target.value)} className={inputClass} placeholder="https://youtube.com/…" /></Field>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-zinc-400 sm:col-span-2">
              Cover şəkil linki
              <input value={form.coverPhotoUrl} onChange={(e) => updateField("coverPhotoUrl", e.target.value)} className={inputClass} placeholder="https://…" />
            </label>
            <div className="sm:col-span-2">
              <PrimaryButton disabled={loading} className="w-full">{loading ? "Yadda saxlanılır…" : "Profili yadda saxla"}</PrimaryButton>
            </div>
          </form>
        </section>
      </div>
    </PageShell>
  );
}

/* ---------------------------------- COMPARE (TALE OF THE TAPE) ---------------------------------- */

function HeadToHead() {
  const [query, setQuery] = useState("");
  const [fighters, setFighters] = useState([]);
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [activeSlot, setActiveSlot] = useState("left");
  const [loadingPick, setLoadingPick] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fighterApi.list({ search: query, limit: 10 }).then((r) => setFighters(r.data || [])).catch(() => setFighters([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const selectFighter = async (id) => {
    setLoadingPick(id);
    try {
      const selected = await fighterApi.get(id);
      if (activeSlot === "left") {
        setLeft(selected);
        setActiveSlot("right");
      } else {
        setRight(selected);
        setActiveSlot("left");
      }
      setQuery("");
    } finally {
      setLoadingPick("");
    }
  };

  const clearSlot = (slot) => {
    if (slot === "left") setLeft(null);
    else setRight(null);
    setActiveSlot(slot);
  };

  const numeric = (l, r) => {
    const ln = Number(l) || 0;
    const rn = Number(r) || 0;
    return { leftWins: ln > rn, rightWins: rn > ln };
  };

  const rows = left && right ? [
    { label: "Rekord", l: recordFromStats(left.stats), r: recordFromStats(right.stats) },
    { label: "Xal", l: left.points || 0, r: right.points || 0, compare: true },
    { label: "KO/TKO", l: left.stats?.methods?.KO_TKO || 0, r: right.stats?.methods?.KO_TKO || 0, compare: true },
    { label: "Submission", l: left.stats?.methods?.SUBMISSION || 0, r: right.stats?.methods?.SUBMISSION || 0, compare: true },
    { label: "Decision", l: left.stats?.methods?.DECISION || 0, r: right.stats?.methods?.DECISION || 0, compare: true },
    { label: "Çəki dərəcəsi", l: formatWeightClass(left.weightClass), r: formatWeightClass(right.weightClass) },
    { label: "Status", l: getStatus(left), r: getStatus(right) },
    { label: "Ölkə", l: `${flagEmoji(left.country)} ${left.country}`, r: `${flagEmoji(right.country)} ${right.country}` },
  ] : [];

  const Corner = ({ slot, fighter, tone }) => {
    const active = activeSlot === slot;
    const glow = tone === "red" ? "corner-red" : "corner-blue";
    const ring = tone === "red" ? "border-blood/50" : "border-sky-400/50";
    return (
      <button onClick={() => setActiveSlot(slot)} className={`relative overflow-hidden rounded-2xl border bg-surface p-5 text-left transition ${active ? `${ring} shadow-panel` : "border-white/10 hover:bg-white/[0.04]"} ${glow}`}>
        <div className="relative flex items-center justify-between">
          <Chip tone={tone === "red" ? "red" : "blue"}>{tone === "red" ? "Qırmızı künc" : "Mavi künc"}</Chip>
          {fighter && <span onClick={(e) => { e.stopPropagation(); clearSlot(slot); }} className="rounded-lg border border-white/12 px-2.5 py-1 text-[11px] font-black text-white transition hover:bg-white/10">Sil</span>}
        </div>
        {fighter ? (
          <div className="relative mt-4">
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-2xl border border-white/10 bg-black sm:h-48 sm:w-48">
              <Avatar name={fighter.fullName} photoUrl={fighter.profilePhotoUrl} />
            </div>
            <h2 className="mt-4 text-center font-display text-2xl font-bold uppercase leading-tight text-white sm:text-3xl">{fighter.fullName}</h2>
            <p className="mt-1 text-center font-mono text-sm text-zinc-400">{recordFromStats(fighter.stats)} · {formatWeightClass(fighter.weightClass)}</p>
          </div>
        ) : (
          <div className="mt-4 grid h-56 place-items-center rounded-2xl border border-dashed border-white/12 text-center text-sm text-zinc-500">
            {active ? "Aşağıdan döyüşçü seç →" : "Bu küncü seç"}
          </div>
        )}
      </button>
    );
  };

  return (
    <PageShell>
      <PageHeader kicker="Üzbəüz müqayisə" kickerIcon={Swords} title="Tale of the Tape" subtitle="İki döyüşçünü qarşılaşdır — rekord, xal, bitirmə üsulları və statuslarını yan-yana gör." />

      <div className="relative mt-8 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        <Corner slot="left" fighter={left} tone="red" />
        <div className="hidden place-items-center sm:grid">
          <div className="grid h-16 w-16 place-items-center rounded-full border-2 border-white/15 bg-coal font-display text-2xl font-bold text-white shadow-red">VS</div>
        </div>
        <Corner slot="right" fighter={right} tone="blue" />
      </div>

      {/* fighter picker */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold uppercase text-white">Seçim: {activeSlot === "left" ? "qırmızı künc" : "mavi künc"}</h2>
          <button onClick={() => setActiveSlot(activeSlot === "left" ? "right" : "left")} className="rounded-lg border border-white/12 px-3 py-2 text-xs font-black text-white transition hover:bg-white/10">Küncü dəyiş</button>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Döyüşçü axtar" className="mt-4 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-blood" />
        <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {fighters.map((fighter) => (
            <button key={fighter.id} disabled={loadingPick === fighter.id} onClick={() => selectFighter(fighter.id)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-white transition hover:bg-white/10 disabled:opacity-60">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10"><Avatar name={fighter.fullName} photoUrl={fighter.profilePhotoUrl} /></div>
              <span className="min-w-0">
                <span className="block truncate font-bold">{fighter.fullName}</span>
                <span className="mt-0.5 block truncate font-mono text-xs text-zinc-500">{formatWeightClass(fighter.weightClass)} · {fighter.country}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {rows.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-surface">
          <div className="border-b border-white/10 bg-black/30 px-5 py-4 text-center font-display text-lg font-bold uppercase tracking-[0.2em] text-white">Statistika</div>
          {rows.map((row) => {
            const cmp = row.compare ? numeric(row.l, row.r) : { leftWins: false, rightWins: false };
            return (
              <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/8 px-4 py-3.5 text-center last:border-0">
                <span className={`font-mono text-lg font-bold ${cmp.leftWins ? "text-blood" : "text-white"}`}>{row.l}</span>
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">{row.label}</span>
                <span className={`font-mono text-lg font-bold ${cmp.rightWins ? "text-sky-300" : "text-white"}`}>{row.r}</span>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

/* ---------------------------------- FIGHT BOARD ---------------------------------- */

function FightSeekBoard({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    seekApi.list({ limit: 30 })
      .then((result) => { if (!ignore) setItems(result.data || []); })
      .catch((caught) => { if (!ignore) setError(caught.message); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  return (
    <PageShell>
      <PageHeader kicker="Döyüş axtarılır" kickerIcon={Swords} title="Döyüş Lövhəsi" subtitle="Döyüşçülərin açıq döyüş elanları — çəki, qayda dəsti və məkan üzrə." />
      {loading && <div className="mt-8"><LoadingPanel /></div>}
      {error && <div className="mt-8"><ErrorPanel message={error} /></div>}
      {!loading && !error && items.length === 0 && (
        <div className="mt-8">
          <EmptyState emoji="🥊" title="Hələ döyüş elanı yoxdur" subtitle="İlk döyüş elanını sən yerləşdir.">
            {user && <button className="rounded-xl bg-blood px-6 py-3 font-black text-white shadow-red">Döyüş elanı yerləşdir</button>}
          </EmptyState>
        </div>
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-surface p-5 transition hover:border-blood/50">
            <div className="flex items-center gap-2">
              <Chip tone="red" icon={Target}>Axtarır</Chip>
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold uppercase text-white">{item.fighter.fullName}</h3>
            <p className="mt-2 font-mono text-sm text-zinc-400">{formatWeightClass(item.weightClass)} · {formatResult(item.ruleSet)} · {item.location}</p>
            <p className="mt-3 text-sm leading-6 text-zinc-500">{item.message}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

/* ---------------------------------- TOURNAMENTS / GYMS / NATIONAL ---------------------------------- */

function TournamentHub() {
  const navigate = useNavigate();
  return (
    <SimpleFeaturePage
      title="Turnirlər"
      badge="Turnir mərkəzi"
      loader={() => tournamentApi.list({ limit: 30 })}
      empty="Hal-hazırda aktiv turnir yoxdur."
      renderItem={(item) => (
        <button key={item.id} onClick={() => navigate(`/tournaments/${item.id}`)} className="group cursor-pointer rounded-2xl border border-white/10 bg-surface p-5 text-left transition hover:-translate-y-1 hover:border-blood/50">
          <Chip tone={item.status === "ACTIVE" ? "red" : "default"}>{item.status === "ACTIVE" ? "AKTİV" : item.status}</Chip>
          <h3 className="mt-4 font-display text-2xl font-bold uppercase text-white">{item.name}</h3>
          <p className="mt-2 font-mono text-sm text-zinc-400">{formatWeightClass(item.weightClass)} · {formatResult(item.ruleSet)} · {item.size} yer</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blood transition group-hover:gap-2">Braketi gör <ArrowRight size={15} /></span>
        </button>
      )}
    />
  );
}

function GymHub() {
  const [tab, setTab] = useState("gyms");
  const navigate = useNavigate();
  return (
    <PageShell>
      <PageHeader kicker="Zal şəbəkəsi" kickerIcon={Target} title="Zallar" subtitle="Döyüş klublarını və onların döyüşçü gücünü kəşf et." />
      <div className="mt-6 inline-flex rounded-xl border border-white/10 bg-surface p-1">
        <button onClick={() => setTab("gyms")} className={`rounded-lg px-5 py-2.5 text-sm font-black uppercase tracking-wide transition ${tab === "gyms" ? "bg-blood text-white shadow-red" : "text-zinc-400 hover:text-white"}`}>Zallar</button>
        <button onClick={() => setTab("leaderboard")} className={`rounded-lg px-5 py-2.5 text-sm font-black uppercase tracking-wide transition ${tab === "leaderboard" ? "bg-blood text-white shadow-red" : "text-zinc-400 hover:text-white"}`}>Zal liderliyi</button>
      </div>
      <SimpleFeaturePage
        title=""
        badge=""
        loader={tab === "gyms" ? () => gymApi.list({ limit: 30 }) : gymApi.leaderboard}
        empty="Hələ zal yoxdur."
        renderItem={(gym) => (
          <div key={gym.id} onClick={() => navigate(`/gyms/${gym.id}`)} className="group cursor-pointer rounded-2xl border border-white/10 bg-surface p-5 transition hover:-translate-y-1 hover:border-blood/50">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-blood/10 text-blood"><Target size={20} /></div>
              <div>
                <h3 className="font-display text-2xl font-bold uppercase leading-none text-white">{gym.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{flagEmoji(gym.country)} {gym.city}, {gym.country}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2"><div className="font-mono text-lg font-bold text-white">{gym.fighterCount || 0}</div><div className="text-[10px] font-black uppercase tracking-wide text-zinc-600">Döyüşçü</div></div>
              <div className="rounded-xl border border-white/8 bg-black/20 px-3 py-2"><div className="font-mono text-lg font-bold text-blood">{gym.totalPoints || 0}</div><div className="text-[10px] font-black uppercase tracking-wide text-zinc-600">Xal</div></div>
            </div>
          </div>
        )}
      />
    </PageShell>
  );
}

function NationalChampions({ openProfile }) {
  const [data, setData] = useState({});
  const [weight, setWeight] = useState("LIGHTWEIGHT");
  useEffect(() => { leaderboardApi.national().then(setData).catch(() => setData({})); }, []);
  const rows = data[weight] || [];
  return (
    <PageShell>
      <PageHeader kicker="Milli çempionlar" kickerIcon={Crown} title="Ölkə üzrə #1" subtitle="Hər ölkənin seçilmiş çəki dərəcəsində ən yüksək reytinqli döyüşçüsü." />
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {weightClassOptions.map((item) => (
          <button key={item} onClick={() => setWeight(item)} className={`shrink-0 rounded-lg px-4 py-2 text-sm font-black uppercase tracking-wide transition ${weight === item ? "bg-blood text-white shadow-red" : "border border-white/10 text-zinc-400 hover:text-white"}`}>{formatWeightClass(item)}</button>
        ))}
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-surface">
        {rows.length === 0 ? (
          <div className="py-16"><EmptyState emoji="👑" title="Çempion yoxdur" subtitle="Bu çəki dərəcəsində hələ çempion müəyyən edilməyib." /></div>
        ) : (
          <div className="divide-y divide-white/8">
            {rows.map((row, i) => (
              <div key={row.country} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{flagEmoji(row.country)}</span>
                  <span className="font-mono text-sm font-bold text-zinc-500">{row.country}</span>
                </div>
                <button onClick={() => openProfile(row.fighter.id)} className="flex items-center gap-2 text-left font-display text-xl font-bold uppercase text-white transition hover:text-blood">
                  {i === 0 && <Crown size={16} className="text-gold" />}
                  {row.fighter.fullName}
                </button>
                <span className="font-mono text-sm font-bold text-blood">{row.fighter.points} xal</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

/* ---------------------------------- FIGHTER PROFILE ---------------------------------- */

function FighterProfilePage({ fighterId, openProfile }) {
  const [profile, setProfile] = useState(null);
  const [countryRank, setCountryRank] = useState("—");
  const [weightRank, setWeightRank] = useState("—");
  const [shareCopied, setShareCopied] = useState(false);
  const [badges, setBadges] = useState([]);
  const [nationalChampion, setNationalChampion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    const loadProfile = async () => {
      const id = fighterId || (await fighterApi.list({ limit: 1 })).data?.[0]?.id;
      if (!id) throw new Error("No fighters returned by the API.");
      const fighter = await fighterApi.get(id);
      const [countryBoard, weightBoard] = await Promise.all([
        fighterApi.leaderboard({ country: fighter.country }),
        fighterApi.leaderboard({ weightClass: fighter.weightClass, role: getStatus(fighter).toUpperCase() }),
      ]);
      if (ignore) return;
      setProfile(fighter);
      setCountryRank(countryBoard.data?.find((item) => item.id === fighter.id)?.rank || "—");
      setWeightRank(weightBoard.data?.find((item) => item.id === fighter.id)?.rank || "—");
    };

    loadProfile()
      .catch((caught) => { if (!ignore) setError(caught.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [fighterId]);

  useEffect(() => {
    if (!profile) return;
    badgeApi.forFighter(profile.id).then(setBadges).catch(() => setBadges([]));
    leaderboardApi.isChampion(profile.id).then(setNationalChampion).catch(() => setNationalChampion(null));
  }, [profile]);

  if (loading) return <PageShell><LoadingPanel label="Döyüşçü profili yüklənir" /></PageShell>;
  if (error) return <PageShell><ErrorPanel message={error} action={{ label: "Döyüşçülərə bax", onClick: () => openProfile(null) }} /></PageShell>;

  const methods = methodsFromStats(profile.stats);
  const totalMethodWins = methods.reduce((sum, method) => sum + method.value, 0);
  const status = getStatus(profile);
  const record = profile.stats?.record || {};
  const fightHistory = profile.fights || [];
  const earnedBadges = Object.keys(BADGE_META).filter((type) => badges.find((b) => b.type === type)).length;

  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  };

  return (
    <main className="pt-[65px]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Avatar name={profile.fullName} photoUrl={profile.profilePhotoUrl} className="scale-110 opacity-20 blur-2xl saturate-150" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/85 to-ink" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(229,32,45,0.22),transparent_45%)]" />
        </div>
        <div className="relative mx-auto grid max-w-7xl items-end gap-8 px-4 pb-10 pt-14 sm:px-6 lg:grid-cols-[1fr_400px]">
          <div className="animate-fade-up">
            <div className="flex flex-wrap gap-2">
              <Chip tone={status === "Pro" ? "red" : "default"}>{formatWeightClass(profile.weightClass)}</Chip>
              <Chip tone="ghost">#{weightRank} çəki reytinqi</Chip>
              <Chip tone={status === "Pro" ? "gold" : "ghost"} icon={status === "Pro" ? ShieldCheck : undefined}>{status}</Chip>
            </div>
            <h1 className="mt-6 font-display text-6xl font-bold uppercase leading-[0.9] text-white sm:text-7xl xl:text-8xl">{profile.fullName}</h1>
            {profile.nickname && <p className="mt-3 font-display text-2xl font-medium italic text-zinc-400">“{profile.nickname}”</p>}
            {nationalChampion?.isChampion && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/15 px-4 py-2.5 text-sm font-black uppercase tracking-[0.1em] text-amber-100">
                <Crown size={16} /> {flagEmoji(profile.country)} {profile.country} milli çempionu
              </div>
            )}
            <div className="mt-8 grid max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur">
              {[
                [record.wins || 0, "Qələbə", "text-emerald-400"],
                [record.losses || 0, "Məğlub", "text-blood"],
                [record.draws || 0, "Heçə", "text-zinc-400"],
              ].map(([value, label, tone]) => (
                <div key={label} className="border-r border-white/10 px-5 py-5 text-center last:border-0">
                  <div className={`font-display text-5xl font-bold leading-none ${tone}`}>{value}</div>
                  <div className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="grid gap-4 self-end">
            <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-panel">
              <div className="h-[360px] w-full"><Avatar name={profile.fullName} photoUrl={profile.profilePhotoUrl} /></div>
              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-black/30">
                <div className="px-2 py-3 text-center"><div className="font-mono text-lg font-bold text-white">{profile.points || 0}</div><div className="text-[9px] font-black uppercase tracking-wide text-zinc-600">Xal</div></div>
                <div className="px-2 py-3 text-center"><div className="font-mono text-lg font-bold text-white">#{countryRank}</div><div className="text-[9px] font-black uppercase tracking-wide text-zinc-600">Ölkə</div></div>
                <div className="px-2 py-3 text-center"><div className="font-mono text-lg font-bold text-white">{earnedBadges}</div><div className="text-[9px] font-black uppercase tracking-wide text-zinc-600">Nişan</div></div>
              </div>
            </div>
            <button onClick={shareProfile} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-black uppercase tracking-[0.1em] text-white transition hover:bg-white/10">
              <Share2 size={16} /> {shareCopied ? "Link kopyalandı!" : "Profili paylaş"}
            </button>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                ["Rekord", `${record.wins || 0}-${record.losses || 0}-${record.draws || 0}`, Activity],
                ["Xal", profile.points || 0, Zap],
                ["Ölkə reytinqi", `#${countryRank}`, Flag],
                ["Çəki reytinqi", `#${weightRank}`, Gauge],
              ].map(([label, value, Icon]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-surface p-5">
                  <Icon size={16} className="text-blood" />
                  <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-[11px] font-black uppercase tracking-[0.14em] text-zinc-500">{label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold uppercase text-white">Qələbə üsulları</h2>
                  <p className="mt-1 text-sm text-zinc-500">Təsdiqli qələbələr bitirmə üsuluna görə.</p>
                </div>
                <Activity className="text-blood" />
              </div>
              <div className="mt-6 grid gap-5">
                {methods.map((method) => <MethodBar key={method.label} method={method} total={totalMethodWins} />)}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface">
              <div className="border-b border-white/10 p-5">
                <h2 className="font-display text-2xl font-bold uppercase text-white">Döyüş tarixçəsi</h2>
                <p className="mt-1 text-sm text-zinc-500">Təsdiqlənmiş döyüşlər və yoxlanmış rekordlar.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-black/30 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    <tr>{["Tarix", "Rəqib", "Tədbir", "Nəticə", "Üsul", "Raund", "Vaxt"].map((head) => <th key={head} className="px-5 py-4 font-black">{head}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {fightHistory.length === 0 ? (
                      <tr><td colSpan={7} className="px-5 py-10 text-center font-semibold text-zinc-500">Hələ döyüş qeydi yoxdur.</td></tr>
                    ) : (
                      fightHistory.map((fight) => (
                        <tr key={fight.id} className="text-zinc-300 transition hover:bg-white/[0.02]">
                          <td className="px-5 py-4 font-mono text-zinc-400">{formatDate(fight.fightDate)}</td>
                          <td className="px-5 py-4 font-bold text-white">{fight.opponentName}</td>
                          <td className="px-5 py-4">{fight.eventName}</td>
                          <td className="px-5 py-4"><span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${fight.result === "WIN" ? "bg-emerald-500/15 text-emerald-300" : fight.result === "LOSS" ? "bg-blood/15 text-red-200" : "bg-white/10 text-zinc-300"}`}>{formatResult(fight.result)}</span></td>
                          <td className="px-5 py-4">{formatResult(fight.method)}</td>
                          <td className="px-5 py-4 font-mono">{fight.round}</td>
                          <td className="px-5 py-4 font-mono">{fight.fightTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold uppercase text-white">Nişanlar</h2>
                <Chip tone="gold" icon={Award}>{earnedBadges}/{Object.keys(BADGE_META).length}</Chip>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(BADGE_META).map(([type, meta]) => {
                  const earned = badges.find((badge) => badge.type === type);
                  return (
                    <div key={type} title={`${meta.desc}${earned ? ` · ${formatDate(earned.earnedAt)}` : ""}`} className={`rounded-xl border p-4 text-center transition ${earned ? "border-gold/30 bg-gold/[0.06]" : "border-white/8 bg-white/[0.02] opacity-40"}`}>
                      <div className="text-3xl">{earned ? meta.emoji : "🔒"}</div>
                      <div className="mt-2 text-[11px] font-black uppercase tracking-[0.1em] text-white">{meta.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="grid gap-5 self-start">
            <div className="rounded-2xl border border-white/10 bg-surface p-5">
              <h2 className="font-display text-xl font-bold uppercase text-white">Döyüşçü haqqında</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{profile.bio || "Təsdiqli FightBase döyüşçü profili."}</p>
              <div className="mt-5 grid gap-3 text-sm font-semibold text-zinc-300">
                <span className="inline-flex items-center gap-2"><Flag size={16} className="text-blood" /> {flagEmoji(profile.country)} {countryNames[profile.country] || profile.country}</span>
                <span className="inline-flex items-center gap-2"><Target size={16} className="text-blood" /> {profile.gym || "Müstəqil"}</span>
                <span className="inline-flex items-center gap-2"><Trophy size={16} className="text-blood" /> {earnedBadges} nişan qazanılıb</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-5">
              <h2 className="font-display text-xl font-bold uppercase text-white">Profil statusu</h2>
              <div className="mt-5 grid gap-3">
                {[
                  `${status} statusu təsdiqlənib`,
                  profile.verifiedByFederation?.name || "Açıq həvəskar profil",
                  profile.isVerifiedPro ? "Pro təsdiqi aktivdir" : "Həvəskar profil aktivdir",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <CheckCircle2 className="shrink-0 text-emerald-400" size={18} /> {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface p-5">
              <h2 className="font-display text-xl font-bold uppercase text-white">Sosial linklər</h2>
              <div className="mt-4 grid gap-3">
                {profile.instagramUrl && (
                  <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                    <span className="inline-flex items-center gap-2"><Instagram size={16} /> Instagram</span>
                    <ArrowUpRight size={16} className="text-zinc-500" />
                  </a>
                )}
                {profile.youtubeUrl && (
                  <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                    <span className="inline-flex items-center gap-2"><Youtube size={16} /> YouTube</span>
                    <ArrowUpRight size={16} className="text-zinc-500" />
                  </a>
                )}
                {!profile.instagramUrl && !profile.youtubeUrl && <p className="text-sm text-zinc-500">Hələ açıq sosial link yoxdur.</p>}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* ---------------------------------- RANKINGS ---------------------------------- */

function RankingsPage({ openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [role, setRole] = useState("AMATEUR");
  const [weightClass, setWeightClass] = useState("LIGHTWEIGHT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const rankingTitle = role === "PRO" ? "Pro reytinqi" : "Həvəskar reytinqi";

  useEffect(() => {
    setLoading(true);
    setError("");
    fighterApi.leaderboard({ limit: 50, role, weightClass })
      .then((result) => setFighters((result.data || []).map(normalizeCardFighter)))
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [role, weightClass]);

  const podium = fighters.slice(0, 3);
  const rest = fighters.slice(3);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  return (
    <PageShell>
      <PageHeader
        kicker="Ayrı reytinqlər"
        kickerIcon={Trophy}
        title={rankingTitle}
        subtitle="Pro və həvəskar döyüşçülər ayrı sıralanır. Hər reytinq yalnız seçilmiş çəki dərəcəsinə aiddir."
        right={
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="inline-flex rounded-xl border border-white/10 bg-surface p-1">
              {["PRO", "AMATEUR"].map((r) => (
                <button key={r} onClick={() => setRole(r)} className={`rounded-lg px-4 py-2 text-sm font-black uppercase tracking-wide transition ${role === r ? "bg-blood text-white shadow-red" : "text-zinc-400 hover:text-white"}`}>{r === "PRO" ? "Pro" : "Həvəskar"}</button>
              ))}
            </div>
            <select value={weightClass} onChange={(e) => setWeightClass(e.target.value)} className="rounded-xl border border-white/10 bg-surface px-4 py-2 text-sm font-bold uppercase tracking-wide text-white outline-none focus:border-blood">
              {weightClassOptions.map((value) => <option key={value} value={value}>{formatWeightClass(value)}</option>)}
            </select>
          </div>
        }
      />

      {loading && <div className="mt-8"><LoadingPanel label="Reytinq yüklənir" /></div>}
      {error && <div className="mt-8"><ErrorPanel message={error} /></div>}
      {!loading && !error && fighters.length === 0 && (
        <div className="mt-8"><EmptyState emoji="🏆" title="Reytinq boşdur" subtitle="Bu bölmədə hələ reytinqə düşən döyüşçü yoxdur." /></div>
      )}

      {!loading && !error && podium.length > 0 && (
        <div className="mt-10 grid grid-cols-3 items-end gap-3 sm:gap-5">
          {podiumOrder.map((fighter) => {
            const place = fighter.rank || fighters.indexOf(fighter) + 1;
            const isFirst = place === 1;
            const tone = place === 1 ? "gold" : place === 2 ? "zinc-300" : "amber-700";
            return (
              <button key={fighter.id} onClick={() => openProfile(fighter.id)} className={`group relative overflow-hidden rounded-2xl border bg-surface p-4 text-center transition hover:-translate-y-1 ${isFirst ? "border-gold/40 shadow-glow" : "border-white/10"} ${isFirst ? "pb-8 pt-8" : "pt-5"}`}>
                {isFirst && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />}
                <div className={`mx-auto grid h-9 w-9 place-items-center rounded-full font-display text-lg font-bold ${place === 1 ? "bg-gold text-black" : place === 2 ? "bg-zinc-300 text-black" : "bg-amber-700 text-white"}`}>{place}</div>
                <div className="mx-auto mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black" style={{ height: isFirst ? 120 : 90, width: isFirst ? 120 : 90 }}>
                  <Avatar name={fighter.name} photoUrl={fighter.photoUrl} className="transition group-hover:scale-105" />
                </div>
                {place === 1 && <Crown size={20} className="mx-auto mt-3 text-gold" />}
                <h3 className="mt-2 truncate font-display text-lg font-bold uppercase text-white sm:text-xl">{fighter.name}</h3>
                <p className="mt-1 font-mono text-xs text-zinc-500">{fighter.record}</p>
                <p className="mt-1 font-mono text-sm font-bold text-blood">{fighter.points} xal</p>
              </button>
            );
          })}
        </div>
      )}

      {!loading && !error && rest.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-surface">
          {rest.map((fighter) => (
            <button key={fighter.id} onClick={() => openProfile(fighter.id)} className="group grid w-full grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-white/8 px-4 py-3.5 text-left transition last:border-0 hover:bg-white/[0.03]">
              <div className="text-center font-display text-2xl font-bold text-zinc-600 group-hover:text-white">{fighter.rank}</div>
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/10"><Avatar name={fighter.name} photoUrl={fighter.photoUrl} /></div>
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-bold uppercase leading-none text-white group-hover:text-red-100">{fighter.name}</div>
                  <div className="mt-1 truncate font-mono text-[11px] font-bold uppercase tracking-wide text-zinc-500">{flagEmoji(fighter.countryCode)} {fighter.countryCode} · {compactGymName(fighter.gym)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-bold text-white">{fighter.record}</div>
                <div className="font-mono text-[11px] font-bold uppercase tracking-wide text-blood">{fighter.points} xal</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </PageShell>
  );
}

/* ---------------------------------- ROUTES ---------------------------------- */

function FighterProfileRoute({ openProfile, user, onLoginRequired }) {
  const { id } = useParams();
  return <FighterProfilePage fighterId={id} openProfile={openProfile} user={user} onLoginRequired={onLoginRequired} />;
}

function RequireAuth({ user, onLoginRequired, children }) {
  useEffect(() => {
    if (!user) onLoginRequired?.();
  }, [user, onLoginRequired]);
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="font-display text-[10rem] font-bold leading-none text-blood">404</div>
      <h1 className="mt-2 font-display text-3xl font-bold uppercase text-white">Səhifə tapılmadı</h1>
      <p className="mt-3 max-w-md text-zinc-400">Açdığın FightBase səhifəsi mövcud deyil.</p>
      <button onClick={() => navigate("/")} className="mt-6 rounded-xl bg-blood px-6 py-3 font-black text-white shadow-red">Ana səhifəyə qayıt</button>
    </main>
  );
}

function Footer({ setPage }) {
  return (
    <footer className="relative mt-10 border-t border-white/10 bg-coal/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <button onClick={() => setPage("Home")} className="flex items-center gap-3">
            <LogoMark size={44} />
            <span className="font-display text-2xl font-bold uppercase text-white">FightBase</span>
          </button>
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">Döyüşçülər, zallar və döyüş idmanı izləyiciləri üçün təsdiqli rekord bazası.</p>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Baza</div>
          <div className="mt-4 grid gap-2.5">
            {["Fighters", "Rankings", "National Champions", "Gyms"].map((item) => (
              <button key={item} onClick={() => setPage(item)} className="text-left text-sm font-semibold text-zinc-400 transition hover:text-white">{item}</button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Uyğunlaşdırma</div>
          <div className="mt-4 grid gap-2.5">
            {["Compare", "Fight Board", "Tournaments"].map((item) => (
              <button key={item} onClick={() => setPage(item)} className="text-left text-sm font-semibold text-zinc-400 transition hover:text-white">{item}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/8 px-4 py-6 text-center text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600 sm:px-6">
        © {new Date().getFullYear()} FightBase — Verified MMA record database
      </div>
    </footer>
  );
}

/* ---------------------------------- APP ---------------------------------- */

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = pathToPage(location.pathname);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(userStorageKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(userStorageKey);
      return null;
    }
  });
  const [authModal, setAuthModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState(loadStoredSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = translations[settings.language] || translations.az;
  const navigatePage = (nextPage) => navigate(pagePaths[nextPage] || "/");

  useEffect(() => {
    localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    document.documentElement.dataset.fightidLanguage = settings.language;
    document.documentElement.dataset.fightidCompact = String(settings.compactMode);
    document.documentElement.dataset.fightidReduceMotion = String(settings.reduceMotion);

    const accent = settings.accent || "#e5202d";
    document.documentElement.style.setProperty("--accent", accent);

    const styleId = "fightid-accent-overrides";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = `
      .bg-blood { background-color: ${accent} !important; }
      .text-blood { color: ${accent} !important; }
      .border-blood { border-color: ${accent} !important; }
      .bg-blood\\/10 { background-color: color-mix(in srgb, ${accent} 10%, transparent) !important; }
      .bg-blood\\/15 { background-color: color-mix(in srgb, ${accent} 16%, transparent) !important; }
      .bg-blood\\/\\[0\\.08\\] { background-color: color-mix(in srgb, ${accent} 8%, transparent) !important; }
      .border-blood\\/30 { border-color: color-mix(in srgb, ${accent} 30%, transparent) !important; }
      .border-blood\\/40 { border-color: color-mix(in srgb, ${accent} 40%, transparent) !important; }
      .border-blood\\/45 { border-color: color-mix(in srgb, ${accent} 45%, transparent) !important; }
      .border-blood\\/50 { border-color: color-mix(in srgb, ${accent} 50%, transparent) !important; }
      .shadow-red { box-shadow: 0 20px 60px -18px color-mix(in srgb, ${accent} 45%, transparent) !important; }
      .from-blood { --tw-gradient-from: ${accent} !important; }
    `;
  }, [settings]);

  useEffect(() => {
    let ignore = false;
    const storedRefreshToken = localStorage.getItem(refreshTokenStorageKey);

    const clearSession = () => {
      setAccessToken(null);
      localStorage.removeItem(accessTokenStorageKey);
      localStorage.removeItem(refreshTokenStorageKey);
      localStorage.removeItem(userStorageKey);
      setUser(null);
    };

    const restoreSession = async () => {
      try {
        let result = await authApi.me();
        if (!result?.user && storedRefreshToken) result = await authApi.refresh(storedRefreshToken);
        if (ignore) return;
        if (result.accessToken) setAccessToken(result.accessToken);
        if (result.refreshToken) localStorage.setItem(refreshTokenStorageKey, result.refreshToken);
        if (result.user) {
          localStorage.setItem(userStorageKey, JSON.stringify(result.user));
          setUser(result.user);
        }
      } catch {
        if (ignore) return;
        clearSession();
      }
    };

    restoreSession();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    const socket = createFightIdSocket(user.id);
    const showToast = (message) => {
      setToast(message);
      window.setTimeout(() => setToast(null), 3000);
    };
    socket.on("fighter:won", () => showToast("Döyüşçün qalib gəldi!"));
    socket.on("notification:new", (notification) => showToast(notification.message));
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    const translate = () => applyPageTranslations(settings.language);
    const root = document.getElementById("root");
    translate();
    if (!root) return undefined;
    const observer = new MutationObserver(() => window.requestAnimationFrame(translate));
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder"] });
    return () => observer.disconnect();
  }, [settings.language, page, authModal, settingsOpen, user]);

  useEffect(() => {
    const handleForcedLogout = () => {
      setAccessToken(null);
      localStorage.removeItem(accessTokenStorageKey);
      localStorage.removeItem(refreshTokenStorageKey);
      localStorage.removeItem(userStorageKey);
      setUser(null);
      navigate("/");
    };
    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, [navigate]);

  const openProfile = (fighterId) => navigate(fighterId ? `/fighters/${fighterId}` : "/fighters");
  const openAuth = (tab) => setAuthModal(tab);
  const closeAuth = () => setAuthModal(null);
  const updateSettings = (patch) => setSettings((current) => ({ ...current, ...patch }));

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      localStorage.removeItem(accessTokenStorageKey);
      localStorage.removeItem(refreshTokenStorageKey);
      localStorage.removeItem(userStorageKey);
      setUser(null);
      navigate("/");
    }
  };

  const handleAuthSuccess = (nextUser) => {
    setUser(nextUser);
    navigate("/profile");
  };

  const handleUserUpdate = (nextUser) => setUser(nextUser);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <AppHeader
        page={page}
        setPage={navigatePage}
        user={user}
        settings={settings}
        t={t}
        onSettingsClick={() => setSettingsOpen(true)}
        onLoginClick={() => openAuth("login")}
        onRegisterClick={() => openAuth("register")}
      />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage setPage={navigatePage} openProfile={openProfile} />} />
          <Route path="/fighters" element={<FightersPage openProfile={openProfile} />} />
          <Route path="/fighters/:id" element={<FighterProfileRoute openProfile={openProfile} user={user} onLoginRequired={() => openAuth("login")} />} />
          <Route path="/rankings" element={<RankingsPage openProfile={openProfile} />} />
          <Route
            path="/profile"
            element={
              <RequireAuth user={user} onLoginRequired={() => openAuth("login")}>
                <MyProfilePage user={user} onLoginClick={() => openAuth("login")} onUserUpdate={handleUserUpdate} openProfile={openProfile} />
              </RequireAuth>
            }
          />
          <Route path="/gyms" element={<GymHub />} />
          <Route path="/gyms/:id" element={<GymHub />} />
          <Route path="/tournaments" element={<TournamentHub user={user} />} />
          <Route path="/tournaments/:id" element={<TournamentHub user={user} />} />
          <Route path="/compare" element={<HeadToHead />} />
          <Route path="/fight-board" element={<FightSeekBoard user={user} onLoginClick={() => openAuth("login")} />} />
          <Route path="/national-champions" element={<NationalChampions openProfile={openProfile} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer setPage={navigatePage} />
      {authModal && <AuthModal initialTab={authModal} onClose={closeAuth} onSuccess={handleAuthSuccess} />}
      <SettingsPanel open={settingsOpen} settings={settings} onChange={updateSettings} onClose={() => setSettingsOpen(false)} t={t} user={user} onLogout={handleLogout} />
      {toast && (
        <div className="fixed bottom-5 right-5 z-[120] flex items-center gap-3 rounded-xl border border-blood/40 bg-coal px-5 py-4 font-bold text-white shadow-panel">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blood/15 text-blood"><Bell size={16} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}
