import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Filter,
  Flag,
  Gauge,
  Globe2,
  Languages,
  Menu,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Swords,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  apiRequest,
  adminApi,
  authApi,
  badgeApi,
  cardApi,
  challengeApi,
  cornerManApi,
  fighterApi,
  gymApi,
  leaderboardApi,
  micCheckApi,
  seekApi,
  setAccessToken,
  tournamentApi,
  trainingApi,
  verificationApi,
} from "./lib/api";
import { createFightIdSocket } from "./lib/socket";

const navGroups = [
  { label: "Home", page: "Home" },
  {
    label: "Discover",
    items: ["Fighters", "Rankings", "National Champions", "Gyms"],
  },
  {
    label: "Fight Tools",
    items: ["Compare", "Fight Board", "Sparring", "Tournaments"],
  },
  {
    label: "Community",
    items: ["Challenges", "Mic Check 🎤"],
  },
  {
    label: "Manage",
    items: ["Federation"],
  },
];
const fallbackPortrait = "/assets/fighter-portrait.png";
const fallbackCover = "/assets/hero-arena.png";
const fallbackFeaturedFighters = [
  { id: "fallback-resad", name: "Rəşad Məmmədov", nickname: "Qartal", country: "Azerbaijan", countryCode: "AZ", weightClass: "Lightweight", record: "8-1-0", points: 1420, rank: 1, status: "Pro", gym: "Bakı Combat Club", image: fallbackPortrait },
  { id: "fallback-tural", name: "Tural Həsənov", nickname: "Wolf", country: "Azerbaijan", countryCode: "AZ", weightClass: "Welterweight", record: "7-2-0", points: 1280, rank: 2, status: "Pro", gym: "Xəzər MMA", image: fallbackPortrait },
  { id: "fallback-kamran", name: "Kamran Əliyev", nickname: "Iron", country: "Azerbaijan", countryCode: "AZ", weightClass: "Middleweight", record: "6-1-1", points: 1185, rank: 3, status: "Amateur", gym: "Neftçi Fight Team", image: fallbackPortrait },
];
const refreshTokenStorageKey = "fightidRefreshToken";
const userStorageKey = "fightidUser";
const settingsStorageKey = "fightidSettings";
const defaultSettings = {
  language: "az",
  theme: "dark",
  accent: "#dc1f26",
  compactMode: false,
  reduceMotion: false,
  showLiveErrors: true,
  notificationSound: false,
};
const languageOptions = [
  { value: "az", label: "AZ", name: "Azərbaycanca" },
  { value: "en", label: "EN", name: "English" },
  { value: "tr", label: "TR", name: "Türkçe" },
  { value: "ru", label: "RU", name: "Русский" },
];
const themeOptions = [
  { value: "dark", label: "Dark", description: "Classic FightID charcoal" },
  { value: "midnight", label: "Midnight", description: "Deeper black arena look" },
  { value: "contrast", label: "High Contrast", description: "Sharper text and panels" },
];
const accentOptions = [
  { value: "#dc1f26", label: "Blood Red" },
  { value: "#d6a21d", label: "Gold" },
  { value: "#18a999", label: "Teal" },
  { value: "#7c3aed", label: "Violet" },
];
const themePalettes = {
  dark: { canvas: "#07080a", panel: "#101114", elevated: "#111113", text: "#f4f0e8", border: "rgba(255,255,255,0.10)" },
  midnight: { canvas: "#02030a", panel: "#090b16", elevated: "#0d1020", text: "#f7f8ff", border: "rgba(117,139,255,0.22)" },
  contrast: { canvas: "#000000", panel: "#181818", elevated: "#202020", text: "#ffffff", border: "rgba(255,255,255,0.28)" },
};
const translations = {
  az: {
    settings: "Ayarlar",
    fightIdControls: "FightID idarə paneli",
    settingsDescription: "Bu brauzer üçün tema, dil, bildiriş və rahatlıq ayarları.",
    language: "Dil",
    theme: "Tema",
    accentColor: "Vurğu rəngi",
    otherSettings: "Digər ayarlar",
    resetSettings: "Ayarları sıfırla",
    search: "Axtarış",
    login: "Giriş",
    logout: "Çıxış",
    joinFightId: "FightID-ə qoşul",
    notifications: "Bildirişlər",
    markAllRead: "Hamısını oxunmuş et",
    noNotifications: "Hələ bildiriş yoxdur.",
    cards: "Kartlar",
    myFighters: "Mənim döyüşçülərim",
    compactMode: "Yığcam görünüş",
    compactModeDesc: "Sıx döyüşçü məlumatları üçün daha dar aralıqlar.",
    reduceMotion: "Animasiya azalt",
    reduceMotionDesc: "Animasiya və hover hərəkətlərini minimuma endir.",
    showLiveErrors: "Canlı API xətalarını göstər",
    showLiveErrorsDesc: "Backend bağlantı mesajlarını görünən saxla.",
    notificationSound: "Bildiriş səsi",
    notificationSoundDesc: "Gələcək bildiriş səsləri üçün hazırlıq.",
  },
  en: {
    settings: "Settings",
    fightIdControls: "FightID controls",
    settingsDescription: "Theme, language, notification, and comfort settings for this browser.",
    language: "Language",
    theme: "Theme",
    accentColor: "Accent color",
    otherSettings: "Other settings",
    resetSettings: "Reset settings",
    search: "Search",
    login: "Login",
    logout: "Logout",
    joinFightId: "Join FightID",
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet.",
    cards: "Cards",
    myFighters: "My Fighters",
    compactMode: "Compact mode",
    compactModeDesc: "Tighter spacing for dense fighter data.",
    reduceMotion: "Reduce motion",
    reduceMotionDesc: "Minimize animation and hover movement.",
    showLiveErrors: "Show live API errors",
    showLiveErrorsDesc: "Keep backend connection messages visible.",
    notificationSound: "Notification sound",
    notificationSoundDesc: "Prepare sound alerts for future notifications.",
  },
  tr: {
    settings: "Ayarlar",
    fightIdControls: "FightID kontrolleri",
    settingsDescription: "Bu tarayıcı için tema, dil, bildirim ve kullanım ayarları.",
    language: "Dil",
    theme: "Tema",
    accentColor: "Vurgu rengi",
    otherSettings: "Diğer ayarlar",
    resetSettings: "Ayarları sıfırla",
    search: "Arama",
    login: "Giriş",
    logout: "Çıkış",
    joinFightId: "FightID'e katıl",
    notifications: "Bildirimler",
    markAllRead: "Tümünü okundu yap",
    noNotifications: "Henüz bildirim yok.",
    cards: "Kartlar",
    myFighters: "Dövüşçülerim",
    compactMode: "Kompakt mod",
    compactModeDesc: "Yoğun dövüşçü verileri için daha sıkı aralıklar.",
    reduceMotion: "Hareketi azalt",
    reduceMotionDesc: "Animasyon ve hover hareketlerini azalt.",
    showLiveErrors: "Canlı API hatalarını göster",
    showLiveErrorsDesc: "Backend bağlantı mesajlarını görünür tut.",
    notificationSound: "Bildirim sesi",
    notificationSoundDesc: "Gelecek bildirim sesleri için hazırlık.",
  },
  ru: {
    settings: "Настройки",
    fightIdControls: "Панель FightID",
    settingsDescription: "Тема, язык, уведомления и параметры удобства для этого браузера.",
    language: "Язык",
    theme: "Тема",
    accentColor: "Акцентный цвет",
    otherSettings: "Другие настройки",
    resetSettings: "Сбросить настройки",
    search: "Поиск",
    login: "Войти",
    logout: "Выйти",
    joinFightId: "Присоединиться",
    notifications: "Уведомления",
    markAllRead: "Отметить все",
    noNotifications: "Уведомлений пока нет.",
    cards: "Карты",
    myFighters: "Мои бойцы",
    compactMode: "Компактный режим",
    compactModeDesc: "Меньше отступов для плотных данных.",
    reduceMotion: "Меньше анимации",
    reduceMotionDesc: "Минимизировать анимации и движения.",
    showLiveErrors: "Показывать API ошибки",
    showLiveErrorsDesc: "Оставлять сообщения backend видимыми.",
    notificationSound: "Звук уведомлений",
    notificationSoundDesc: "Подготовка звуков для будущих уведомлений.",
  },
};
const weightClassOptions = ["STRAWWEIGHT", "FLYWEIGHT", "BANTAMWEIGHT", "FEATHERWEIGHT", "LIGHTWEIGHT", "WELTERWEIGHT", "MIDDLEWEIGHT", "LIGHT_HEAVYWEIGHT", "HEAVYWEIGHT"];
const ruleSetOptions = ["MMA", "GRAPPLING", "BOXING", "MUAY_THAI"];
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

const notificationApi = {
  list: () => apiRequest("/notifications"),
  markRead: (id) => apiRequest(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () => apiRequest("/notifications/read-all", { method: "PUT" }),
};

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

function methodsFromStats(stats) {
  const methods = stats?.methods || {};
  return [
    { label: "KO/TKO", value: methods.KO_TKO || 0, color: "bg-blood" },
    { label: "Submission", value: methods.SUBMISSION || 0, color: "bg-white" },
    { label: "Decision", value: methods.DECISION || 0, color: "bg-zinc-500" },
  ];
}

function normalizeCardFighter(fighter, index = 0) {
  return {
    id: fighter.id,
    name: fighter.fullName,
    nickname: fighter.nickname || "No nickname",
    country: countryNames[fighter.country] || fighter.country,
    countryCode: fighter.country,
    weightClass: formatWeightClass(fighter.weightClass),
    record: fighter.stats ? recordFromStats(fighter.stats) : "Live",
    points: fighter.points || 0,
    rank: fighter.rank || index + 1,
    status: getStatus(fighter),
    federation: fighter.verifiedByFederation?.name || null,
    gym: fighter.gym || "Independent",
    image: fighter.profilePhotoUrl || fallbackPortrait,
  };
}

function Badge({ children, tone = "dark" }) {
  const tones = {
    dark: "border-white/10 bg-white/5 text-zinc-200",
    red: "border-blood/40 bg-blood/15 text-red-100",
    light: "border-white/15 bg-white/10 text-white",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Stat({ value, label }) {
  return (
    <div className="min-w-0 border-l border-white/10 pl-3 sm:pl-4">
      <div className="font-display text-2xl font-black text-white sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</div>
    </div>
  );
}

function LoadingPanel({ label = "Loading live FightID data" }) {
  return (
    <div className="rounded border border-white/10 bg-panel p-6 text-sm font-semibold text-zinc-300">
      {label}...
    </div>
  );
}

function ErrorPanel({ message, action }) {
  return (
    <div className="rounded border border-blood/30 bg-blood/10 p-6">
      <h3 className="font-display text-xl font-black text-white">Live data unavailable</h3>
      <p className="mt-2 text-sm leading-6 text-red-100">{message}</p>
      {action && (
        <button onClick={action.onClick} className="mt-4 rounded border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
          {action.label}
        </button>
      )}
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

function getChallengeOpponent(challenge, user) {
  const profileId = user?.fighterProfile?.id;
  if (!profileId) return challenge.receiver?.fullName || challenge.sender?.fullName || "Opponent";
  return challenge.senderId === profileId ? challenge.receiver?.fullName : challenge.sender?.fullName;
}

function ChallengeModal({ receiver, onClose }) {
  const [form, setForm] = useState({
    proposedDateFrom: "",
    proposedDateTo: "",
    location: "",
    weightClass: receiver?.weightClass || "LIGHTWEIGHT",
    ruleSet: "MMA",
    senderMessage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass = "w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-blood";

  const submitChallenge = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await challengeApi.send({
        receiverId: receiver.id,
        proposedDateFrom: form.proposedDateFrom,
        proposedDateTo: form.proposedDateTo,
        location: form.location,
        weightClass: form.weightClass,
        ruleSet: form.ruleSet,
        senderMessage: form.senderMessage || undefined,
      });
      setSuccess("Challenge sent!");
      window.setTimeout(onClose, 2000);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 px-4 backdrop-blur">
      <div className="mx-auto mt-20 max-w-lg rounded border border-white/10 bg-[#111113] p-5 shadow-red">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-black text-white">Challenge {receiver.fullName}</h2>
            <p className="mt-1 text-sm text-zinc-400">Send a formal FightID challenge request.</p>
          </div>
          <button onClick={onClose} className="rounded border border-white/15 p-2 text-white hover:bg-white/10" aria-label="Close challenge modal">
            <X size={18} />
          </button>
        </div>

        {error && <div className="mt-4 rounded border border-blood/40 bg-blood/15 px-4 py-3 text-sm font-semibold text-red-100">{error}</div>}
        {success && <div className="mt-4 rounded border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-200">{success}</div>}

        <form onSubmit={submitChallenge} className="mt-5 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-200">
              Date from
              <input required type="date" value={form.proposedDateFrom} onChange={(event) => setForm({ ...form, proposedDateFrom: event.target.value })} className={inputClass} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-200">
              Date to
              <input required type="date" value={form.proposedDateTo} onChange={(event) => setForm({ ...form, proposedDateTo: event.target.value })} className={inputClass} />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            Location
            <input required minLength={2} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className={inputClass} placeholder="Baku, Azerbaijan" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-zinc-200">
              Weight class
              <select required value={form.weightClass} onChange={(event) => setForm({ ...form, weightClass: event.target.value })} className={inputClass}>
                {weightClassOptions.map((value) => (
                  <option key={value} value={value}>{formatWeightClass(value)}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-zinc-200">
              Rule set
              <select required value={form.ruleSet} onChange={(event) => setForm({ ...form, ruleSet: event.target.value })} className={inputClass}>
                {ruleSetOptions.map((value) => (
                  <option key={value} value={value}>{formatResult(value)}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-zinc-200">
            Message
            <textarea
              maxLength={1000}
              value={form.senderMessage}
              onChange={(event) => setForm({ ...form, senderMessage: event.target.value })}
              className={`${inputClass} min-h-28 resize-y`}
              placeholder="Optional note to the fighter"
            />
          </label>
          <button disabled={loading || success} className="rounded bg-[#dc1f26] px-5 py-3 font-black text-white hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Sending..." : success || "Send Challenge"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AuthModal({ initialTab = "login", onClose, onSuccess }) {
  const [tab, setTab] = useState(initialTab);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    nickname: "",
    dateOfBirth: "",
    country: "",
    weightClass: "",
    gym: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTab(initialTab);
    setError("");
  }, [initialTab]);

  const handleAuthSuccess = (result) => {
    setAccessToken(result.accessToken);
    localStorage.setItem(refreshTokenStorageKey, result.refreshToken);
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

    const payload = {
      fullName: registerForm.fullName,
      email: registerForm.email,
      password: registerForm.password,
      nickname: registerForm.nickname || undefined,
      dateOfBirth: registerForm.dateOfBirth || "2000-01-01",
      country: (registerForm.country || "AZ").toUpperCase(),
      weightClass: registerForm.weightClass || "LIGHTWEIGHT",
      gym: registerForm.gym || undefined,
    };

    try {
      const result = await authApi.register(payload);
      handleAuthSuccess(result);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded border border-white/10 bg-[#111113] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-blood";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded border border-white/10 bg-[#111113] shadow-red">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-display text-2xl font-black text-white">FightID Access</h2>
            <p className="mt-1 text-sm text-zinc-400">Log in or register your fighter account.</p>
          </div>
          <button onClick={onClose} className="rounded border border-white/15 p-2 text-white hover:bg-white/10" aria-label="Close auth modal">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-white/10">
          {["login", "register"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setTab(item);
                setError("");
              }}
              className={`px-4 py-4 text-sm font-black uppercase tracking-[0.16em] transition ${
                tab === item ? "bg-blood text-white" : "bg-white/[0.03] text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          {error && (
            <div className="mb-5 rounded border border-blood/40 bg-blood/15 px-4 py-3 text-sm font-semibold text-red-100">
              {error}
            </div>
          )}

          {tab === "login" ? (
            <form onSubmit={submitLogin} className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Email
                <input
                  required
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  className={inputClass}
                  placeholder="fighter@fightid.app"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Password
                <input
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  className={inputClass}
                  placeholder="Your password"
                />
              </label>
              <button disabled={loading} className="mt-2 rounded bg-blood px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-red hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-zinc-200 sm:col-span-2">
                  Full name
                  <input
                    required
                    value={registerForm.fullName}
                    onChange={(event) => setRegisterForm({ ...registerForm, fullName: event.target.value })}
                    className={inputClass}
                    placeholder="Rəşad Məmmədov"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Email
                  <input
                    required
                    type="email"
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                    className={inputClass}
                    placeholder="fighter@fightid.app"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Password
                  <input
                    required
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                    className={inputClass}
                    placeholder="At least 8 characters"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Nickname
                  <input
                    value={registerForm.nickname}
                    onChange={(event) => setRegisterForm({ ...registerForm, nickname: event.target.value })}
                    className={inputClass}
                    placeholder="Optional"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Date of birth
                  <input
                    type="date"
                    value={registerForm.dateOfBirth}
                    onChange={(event) => setRegisterForm({ ...registerForm, dateOfBirth: event.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Country
                  <input
                    value={registerForm.country}
                    onChange={(event) => setRegisterForm({ ...registerForm, country: event.target.value })}
                    className={inputClass}
                    placeholder="AZ"
                    maxLength={2}
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Weight class
                  <select
                    value={registerForm.weightClass}
                    onChange={(event) => setRegisterForm({ ...registerForm, weightClass: event.target.value })}
                    className={inputClass}
                  >
                    <option value="">Lightweight default</option>
                    {["STRAWWEIGHT", "FLYWEIGHT", "BANTAMWEIGHT", "FEATHERWEIGHT", "LIGHTWEIGHT", "WELTERWEIGHT", "MIDDLEWEIGHT", "LIGHT_HEAVYWEIGHT", "HEAVYWEIGHT"].map((value) => (
                      <option key={value} value={value}>{formatWeightClass(value)}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200 sm:col-span-2">
                  Gym
                  <input
                    value={registerForm.gym}
                    onChange={(event) => setRegisterForm({ ...registerForm, gym: event.target.value })}
                    className={inputClass}
                    placeholder="Bakı Combat Club"
                  />
                </label>
              </div>
              <button disabled={loading} className="mt-2 rounded bg-blood px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-red hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ open, settings, onChange, onClose, t }) {
  if (!open) return null;

  const toggleRows = [
    { key: "compactMode", label: t.compactMode, description: t.compactModeDesc },
    { key: "reduceMotion", label: t.reduceMotion, description: t.reduceMotionDesc },
    { key: "showLiveErrors", label: t.showLiveErrors, description: t.showLiveErrorsDesc },
    { key: "notificationSound", label: t.notificationSound, description: t.notificationSoundDesc },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur" role="dialog" aria-modal="true" aria-label="FightID settings">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close settings" />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#111113] shadow-red">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blood/40 bg-blood/15 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-red-100">
              <Settings size={14} />
              {t.settings}
            </div>
            <h2 className="mt-4 font-display text-3xl font-black text-white">{t.fightIdControls}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t.settingsDescription}</p>
          </div>
          <button onClick={onClose} className="rounded border border-white/15 p-2 text-white hover:bg-white/10" aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
              <Languages size={17} />
              {t.language}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((language) => (
                <button
                  key={language.value}
                  onClick={() => onChange({ language: language.value })}
                  className={`rounded border px-4 py-3 text-left transition ${
                    settings.language === language.value ? "border-blood bg-blood/20 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-black">{language.label}</span>
                  <span className="mt-1 block text-xs text-zinc-400">{language.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
              <Palette size={17} />
              {t.theme}
            </div>
            <div className="grid gap-2">
              {themeOptions.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => onChange({ theme: theme.value })}
                  className={`rounded border px-4 py-3 text-left transition ${
                    settings.theme === theme.value ? "border-blood bg-blood/20 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-black">{theme.label}</span>
                  <span className="mt-1 block text-xs text-zinc-400">{theme.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
              <SlidersHorizontal size={17} />
              {t.accentColor}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {accentOptions.map((accent) => (
                <button
                  key={accent.value}
                  onClick={() => onChange({ accent: accent.value })}
                  className={`flex items-center gap-3 rounded border px-4 py-3 text-left transition ${
                    settings.accent === accent.value ? "border-white bg-white/10 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="h-5 w-5 rounded-full border border-white/30" style={{ backgroundColor: accent.value }} />
                  <span className="text-sm font-black">{accent.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <div className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-white">{t.otherSettings}</div>
            {toggleRows.map((row) => (
              <label key={row.key} className="flex cursor-pointer items-center justify-between gap-4 rounded border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                <span>
                  <span className="block text-sm font-black text-white">{row.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-400">{row.description}</span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(settings[row.key])}
                  onChange={(event) => onChange({ [row.key]: event.target.checked })}
                  className="h-5 w-5 accent-[#dc1f26]"
                />
              </label>
            ))}
          </section>
        </div>

        <div className="border-t border-white/10 p-5">
          <button onClick={() => onChange(defaultSettings)} className="w-full rounded border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
            {t.resetSettings}
          </button>
        </div>
      </aside>
    </div>
  );
}

function AppHeader({ page, setPage, user, settings, t, onSettingsClick, onLoginClick, onRegisterClick, onLogout }) {
  const [open, setOpen] = useState(false);
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
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <button onClick={toggleNotifications} className="relative rounded border border-white/15 p-2 text-white hover:bg-white/10" aria-label="Open notifications">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#dc1f26] px-1 text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {notificationsOpen && (
        <div className="absolute right-0 top-12 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded border border-white/10 bg-[#111113] shadow-red">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-white">{t.notifications}</span>
            <button onClick={markAllNotificationsRead} className="rounded bg-[#dc1f26] px-3 py-2 text-xs font-black text-white">
              {t.markAllRead}
            </button>
          </div>
          {notificationError && <div className="border-b border-blood/30 bg-blood/15 p-3 text-sm font-semibold text-red-100">{notificationError}</div>}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-zinc-400">{t.noNotifications}</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markNotificationRead(notification)}
                  className={`block w-full border-b border-white/10 p-4 text-left hover:bg-white/10 ${notification.isRead ? "bg-white/[0.02]" : "bg-blood/10"}`}
                >
                  <div className={`text-sm font-semibold ${notification.isRead ? "text-zinc-300" : "text-white"}`}>{notification.message}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">{formatDate(notification.createdAt)}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-canvas/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button onClick={() => setPage("Home")} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded bg-blood text-lg font-black text-white shadow-red">F</span>
          <span>
            <span className="block font-display text-lg font-black uppercase text-white">FightID</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">Verified Combat Network</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navGroups.map((group) => {
            const isActive = group.page === page || group.items?.includes(page);

            if (group.page) {
              return (
                <button
                  key={group.label}
                  onClick={() => setPage(group.page)}
                  className={`rounded px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {group.label}
                </button>
              );
            }

            return (
              <div key={group.label} className="group relative">
                <button
                  className={`inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {group.label}
                  <ChevronRight className="rotate-90" size={14} />
                </button>
                <div className="invisible absolute left-0 top-full z-[70] min-w-56 translate-y-2 rounded border border-white/10 bg-[#111113] p-2 opacity-0 shadow-red transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`block w-full rounded px-3 py-3 text-left text-sm font-bold transition ${
                        page === item ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button onClick={() => setPage("Fighters")} className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            <Search size={16} />
            {t.search}
          </button>
          <button onClick={onSettingsClick} className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            <Settings size={16} />
            <span>{settings?.language?.toUpperCase() || "AZ"}</span>
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <span className="max-w-[180px] truncate text-sm font-bold text-white">{getUserDisplayName(user)}</span>
              <button onClick={() => setPage("My Collection")} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10">{t.cards}</button>
              <button onClick={() => setPage("My Fighters")} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10">{t.myFighters}</button>
              <button onClick={onLogout} className="rounded border border-white/15 px-4 py-2 text-sm font-black text-white hover:bg-white/10">
                {t.logout}
              </button>
            </div>
          ) : (
            <>
              <button onClick={onLoginClick} className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm font-black text-white hover:bg-white/10">
                {t.login}
              </button>
              <button onClick={onRegisterClick} className="inline-flex items-center gap-2 rounded bg-blood px-4 py-2 text-sm font-black text-white shadow-red hover:bg-ember">
                {t.joinFightId}
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {user ? (
            <button
              onClick={() => setOpen(!open)}
              className="max-w-[112px] truncate rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 md:hidden"
            >
              {getUserDisplayName(user)}
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="rounded bg-blood px-4 py-2 text-xs font-black text-white shadow-red hover:bg-ember md:hidden"
            >
              {t.login}
            </button>
          )}
          <button className="rounded border border-white/15 p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-canvas px-4 py-3 lg:hidden">
          {navGroups.map((group) => (
            <div key={group.label} className="py-1">
              {group.page ? (
                <button
                  onClick={() => {
                    setPage(group.page);
                    setOpen(false);
                  }}
                  className={`block w-full rounded px-3 py-3 text-left text-sm font-semibold ${
                    page === group.page ? "bg-white text-black" : "text-zinc-200 hover:bg-white/10"
                  }`}
                >
                  {group.label}
                </button>
              ) : (
                <>
                  <div className="px-3 pt-3 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">{group.label}</div>
                  <div className="mt-1 grid gap-1">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setPage(item);
                          setOpen(false);
                        }}
                        className={`block w-full rounded px-3 py-2 text-left text-sm font-semibold ${
                          page === item ? "bg-white text-black" : "text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
            <button
              onClick={() => {
                onSettingsClick();
                setOpen(false);
              }}
              className="block w-full rounded border border-white/15 px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10"
            >
              {t.settings} / {settings?.language?.toUpperCase() || "AZ"}
            </button>
            {user ? (
              <>
                <div className="flex items-center justify-between rounded bg-white/5 px-3 py-3">
                  <span className="text-sm font-bold text-white">{getUserDisplayName(user)}</span>
                  <NotificationBell />
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setOpen(false);
                  }}
                  className="block w-full rounded border border-white/15 px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onLoginClick();
                    setOpen(false);
                  }}
                  className="block w-full rounded border border-white/15 px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => {
                    onRegisterClick();
                    setOpen(false);
                  }}
                  className="block w-full rounded bg-blood px-3 py-3 text-left text-sm font-black text-white shadow-red hover:bg-ember"
                >
                  {t.joinFightId}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function FighterCard({ fighter, onOpen }) {
  return (
    <article className="group overflow-hidden rounded border border-white/10 bg-panel">
      <button onClick={() => onOpen?.(fighter.id)} className="block w-full text-left">
        <div className="relative h-64 overflow-hidden">
          <img src={fighter.image} alt={fighter.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute left-4 top-4 flex gap-2">
            <Badge tone={fighter.status === "Pro" ? "red" : "dark"}>{fighter.status}</Badge>
            <Badge tone="light">#{fighter.rank}</Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-sm font-semibold text-zinc-300">{fighter.countryCode} | {fighter.country} | {fighter.weightClass}</div>
            <h3 className="mt-1 font-display text-2xl font-black text-white">{fighter.name}</h3>
            <p className="text-sm text-zinc-400">"{fighter.nickname}"</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
          <div className="p-4">
            <div className="text-xl font-black text-white">{fighter.record}</div>
            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Record</div>
          </div>
          <div className="p-4">
            <div className="text-xl font-black text-white">{fighter.points}</div>
            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Points</div>
          </div>
          <div className="p-4">
            <div className="truncate text-xl font-black text-white">{fighter.gym}</div>
            <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Gym</div>
          </div>
        </div>
      </button>
    </article>
  );
}

function LandingPage({ setPage, openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [stats, setStats] = useState({ fighters: "Live", fights: "Active", countries: "Live" });
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.all([fighterApi.leaderboard({ limit: 3 }), fighterApi.list({ limit: 100 })])
      .then(([leaderboardResult, fighterResult]) => {
        if (ignore) return;
        const leaders = leaderboardResult.data || [];
        const allFighters = fighterResult.data || [];
        setFighters(leaders.map(normalizeCardFighter));
        setStats({
          fighters: fighterResult.pagination?.total || allFighters.length || leaderboardResult.pagination?.total || leaders.length,
          fights: "Active",
          countries: new Set(allFighters.map((fighter) => fighter.country)).size || "Live",
        });
      })
      .catch((caught) => {
        if (ignore) return;
        setFighters(fallbackFeaturedFighters);
        setStats({ fighters: "10+", fights: "Active", countries: "1+" });
        setError(caught.message);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main>
      <section className="relative min-h-[92vh] overflow-hidden pt-24">
        <img src="/assets/hero-arena.png" alt="MMA arena walkout" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#07080a_0%,rgba(7,8,10,.88)_34%,rgba(7,8,10,.36)_72%,rgba(7,8,10,.82)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-canvas to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(92vh-6rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-3xl">
            <Badge tone="red">Verified MMA Fighter Platform</Badge>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.96] text-white sm:text-7xl lg:text-8xl">FightID</h1>
            <p className="mt-6 max-w-[calc(100vw-2rem)] break-words text-lg leading-8 text-zinc-300 sm:max-w-2xl sm:text-xl">
              Build a verified fighter identity, track real fight history, climb weight-class rankings, and challenge matched opponents through a confirmation-first fight system.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setPage("Fighters")} className="inline-flex w-full items-center justify-center gap-2 rounded bg-blood px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-red hover:bg-ember sm:w-auto">
                View Fighters
                <ChevronRight size={18} />
              </button>
              <button onClick={() => setPage("Rankings")} className="inline-flex w-full items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-white/10 sm:w-auto">
                Live Rankings
              </button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:gap-4">
              <Stat value={stats.fighters} label="Fighters" />
              <Stat value={stats.countries} label="Countries" />
              <Stat value={stats.fights} label="Active" />
            </div>
            <div className="mt-8 flex max-w-3xl flex-wrap gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-300">
              {["Verified records", "Challenge-ready profiles", "Live rankings", "Federation review"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            [ShieldCheck, "Federation verified", "Pro badges are granted through admin and federation review, never self-declared."],
            [Swords, "Challenge workflow", "Send, counter, accept, confirm, and escalate disputed results in one flow."],
            [Gauge, "Weighted rankings", "Opponent rank, activity, and status influence weekly leaderboard movement."],
            [Bell, "Fight notifications", "Challenge and ranking changes trigger in-app and email-ready events."],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded border border-white/10 bg-panel p-5">
              <Icon className="text-blood" size={24} />
              <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Badge>Live top fighters</Badge>
            <h2 className="mt-4 font-display text-3xl font-black text-white sm:text-5xl">Ranked identities, real records.</h2>
          </div>
          <button onClick={() => setPage("Rankings")} className="inline-flex w-fit items-center gap-2 rounded border border-white/15 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">
            Full leaderboard
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {error && (
            <div className="md:col-span-3 rounded border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-300">
              Live sync is reconnecting. Showing a polished preview while the fight database comes back online.
            </div>
          )}
          {!error && fighters.length === 0 && <div className="md:col-span-3"><LoadingPanel /></div>}
          {fighters.map((fighter) => (
            <FighterCard key={fighter.id} fighter={fighter} onOpen={openProfile} />
          ))}
        </div>
      </section>
    </main>
  );
}

function FightersPage({ openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fighterApi
      .list({ limit: 24, search, role })
      .then((result) => {
        setFighters((result.data || []).map(normalizeCardFighter));
      })
      .catch((caught) => {
        if (caught.name !== "AbortError") setError(caught.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [search, role]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="red">Live fighter database</Badge>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Fighter List</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, nickname, or gym"
            className="rounded border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-blood"
          />
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded border border-white/10 bg-canvas px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blood">
            <option value="">All roles</option>
            <option value="PRO">Pro</option>
            <option value="AMATEUR">Amateur</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading && <div className="md:col-span-2 xl:col-span-3"><LoadingPanel label="Fetching fighters from /api/fighters" /></div>}
        {error && <div className="md:col-span-2 xl:col-span-3"><ErrorPanel message={error} /></div>}
        {!loading && !error && fighters.length === 0 && <div className="md:col-span-2 xl:col-span-3"><LoadingPanel label="No fighters matched this filter" /></div>}
        {fighters.map((fighter) => (
          <FighterCard key={fighter.id} fighter={fighter} onOpen={openProfile} />
        ))}
      </div>
    </main>
  );
}

function MethodBar({ method, total }) {
  const width = total > 0 ? `${Math.round((method.value / total) * 100)}%` : "0%";
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-bold text-white">{method.label}</span>
        <span className="text-zinc-400">{method.value} wins</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${method.color}`} style={{ width }} />
      </div>
    </div>
  );
}

function ChallengeStatusBadge({ status }) {
  const tones = {
    PENDING: "border-yellow-400/30 bg-yellow-400/15 text-yellow-200",
    ACCEPTED: "border-emerald-400/30 bg-emerald-400/15 text-emerald-200",
    DECLINED: "border-blood/40 bg-blood/15 text-red-100",
    COUNTERED: "border-blue-400/30 bg-blue-400/15 text-blue-200",
    CANCELLED: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
    COMPLETED: "border-white/30 bg-white/15 text-white",
  };

  return <span className={`rounded border px-2 py-1 text-xs font-black ${tones[status] || tones.CANCELLED}`}>{status}</span>;
}

function ChallengesPage({ user, onLoginClick }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  const loadChallenges = async () => {
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      setChallenges(await challengeApi.mine());
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [user]);

  const runAction = async (id, action) => {
    setActionLoading(id);
    setError("");

    try {
      if (action === "accept") await challengeApi.accept(id);
      if (action === "decline") await challengeApi.decline(id);
      if (action === "cancel") await apiRequest(`/challenges/${id}/cancel`, { method: "PUT" });
      await loadChallenges();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setActionLoading("");
    }
  };

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <div className="rounded border border-white/10 bg-[#111113] p-8">
          <Badge tone="red">Challenges</Badge>
          <h1 className="mt-5 font-display text-4xl font-black text-white">Please login to view your challenges</h1>
          <button onClick={onLoginClick} className="mt-6 rounded bg-[#dc1f26] px-5 py-3 font-black text-white">
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="red">Challenge Center</Badge>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Challenges</h1>
        </div>
        <button onClick={loadChallenges} className="rounded border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
          Refresh
        </button>
      </div>

      <div className="mt-8 overflow-hidden rounded border border-white/10 bg-[#111113]">
        {loading && <div className="p-5"><LoadingPanel label="Loading your challenges" /></div>}
        {error && <div className="m-5 rounded border border-blood/40 bg-blood/15 p-4 text-sm font-semibold text-red-100">{error}</div>}
        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-zinc-500">
                <tr>
                  {["Opponent", "Status", "Rule Set", "Location", "Date Range", "Actions"].map((head) => (
                    <th key={head} className="px-5 py-4 font-black">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {challenges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center font-semibold text-zinc-400">No challenges yet.</td>
                  </tr>
                ) : (
                  challenges.map((challenge) => {
                    const isReceiver = challenge.receiverId === user.fighterProfile?.id;
                    const isSender = challenge.senderId === user.fighterProfile?.id;

                    return (
                      <tr key={challenge.id} className="text-zinc-300">
                        <td className="px-5 py-4 font-bold text-white">{getChallengeOpponent(challenge, user)}</td>
                        <td className="px-5 py-4"><ChallengeStatusBadge status={challenge.status} /></td>
                        <td className="px-5 py-4">{formatResult(challenge.ruleSet)}</td>
                        <td className="px-5 py-4">{challenge.location}</td>
                        <td className="px-5 py-4">{formatDate(challenge.proposedDateFrom)} - {formatDate(challenge.proposedDateTo)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {challenge.status === "PENDING" && isReceiver && (
                              <>
                                <button disabled={actionLoading === challenge.id} onClick={() => runAction(challenge.id, "accept")} className="rounded bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-60">
                                  Accept
                                </button>
                                <button disabled={actionLoading === challenge.id} onClick={() => runAction(challenge.id, "decline")} className="rounded bg-[#dc1f26] px-3 py-2 text-xs font-black text-white disabled:opacity-60">
                                  Decline
                                </button>
                              </>
                            )}
                            {challenge.status === "PENDING" && isSender && (
                              <button disabled={actionLoading === challenge.id} onClick={() => runAction(challenge.id, "cancel")} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 disabled:opacity-60">
                                Cancel
                              </button>
                            )}
                            {challenge.status !== "PENDING" && <span className="text-xs font-semibold text-zinc-500">No actions</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function SimpleFeaturePage({ title, badge, loader, renderItem, empty = "Nothing here yet.", user, loginRequired = false, onLoginClick }) {
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
    return <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8"><div className="rounded border border-white/10 bg-[#111113] p-8"><Badge tone="red">{badge}</Badge><h1 className="mt-5 font-display text-4xl font-black text-white">Please login to continue</h1><button onClick={onLoginClick} className="mt-6 rounded bg-[#dc1f26] px-5 py-3 font-black text-white">Login</button></div></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      {badge && <Badge tone="red">{badge}</Badge>}
      {title && <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">{title}</h1>}
      {loading && <div className="mt-8"><LoadingPanel /></div>}
      {error && <div className="mt-8"><ErrorPanel message={error} /></div>}
      {!loading && !error && items.length === 0 && <div className="mt-8 rounded border border-white/10 bg-[#111113] p-8 text-zinc-400">{empty}</div>}
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
    </main>
  );
}

function MyCollectionPage({ user, onLoginClick }) {
  return <SimpleFeaturePage title="My Collection" badge="Fighter Cards" user={user} loginRequired onLoginClick={onLoginClick} loader={cardApi.myCollection} empty="No cards yet. Explore fighters and collect your first card." renderItem={(item) => <div key={item.id} className="rounded border border-yellow-400/30 bg-[#111113] p-5"><img src={item.card.fighter.profilePhotoUrl || fallbackPortrait} className="h-52 w-full rounded object-cover" /><h3 className="mt-4 font-display text-2xl font-black text-white">{item.card.fighter.fullName}</h3><Badge tone="red">{item.card.tier}</Badge></div>} />;
}

function MyFightersPage({ user, onLoginClick }) {
  return <SimpleFeaturePage title="My Fighters" badge="Corner Men" user={user} loginRequired onLoginClick={onLoginClick} loader={cornerManApi.myFighters} empty="You are not cornering any fighters yet." renderItem={(item) => <div key={item.id} className="rounded border border-white/10 bg-[#111113] p-5"><img src={item.fighter.profilePhotoUrl || fallbackPortrait} className="h-48 w-full rounded object-cover" /><h3 className="mt-4 font-display text-2xl font-black text-white">{item.fighter.fullName}</h3><button onClick={() => cornerManApi.remove(item.fighter.id)} className="mt-4 rounded bg-[#dc1f26] px-5 py-3 font-black text-white">Remove Corner</button></div>} />;
}

function HeadToHead() {
  const [query, setQuery] = useState("");
  const [fighters, setFighters] = useState([]);
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  useEffect(() => { const timer = window.setTimeout(() => fighterApi.list({ search: query, limit: 10 }).then((r) => setFighters(r.data || [])).catch(() => setFighters([])), 300); return () => window.clearTimeout(timer); }, [query]);
  const selectFighter = async (id) => (left ? setRight(await fighterApi.get(id)) : setLeft(await fighterApi.get(id)));
  const rows = left && right ? [["Record", recordFromStats(left.stats), recordFromStats(right.stats)], ["Points", left.points, right.points], ["KO/TKO wins", left.stats?.methods?.KO_TKO || 0, right.stats?.methods?.KO_TKO || 0], ["Submission wins", left.stats?.methods?.SUBMISSION || 0, right.stats?.methods?.SUBMISSION || 0], ["Decision wins", left.stats?.methods?.DECISION || 0, right.stats?.methods?.DECISION || 0], ["Weight class", formatWeightClass(left.weightClass), formatWeightClass(right.weightClass)], ["Status", getStatus(left), getStatus(right)], ["Country", left.country, right.country]] : [];
  return <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8"><Badge tone="red">Head to Head</Badge><h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Compare Fighters</h1><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fighters" className="mt-8 w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white" /><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{fighters.map((fighter) => <button key={fighter.id} onClick={() => selectFighter(fighter.id)} className="rounded border border-white/10 bg-[#111113] p-3 text-left text-white">{fighter.fullName}</button>)}</div><div className="mt-8 grid gap-5 md:grid-cols-2">{[left, right].map((fighter, index) => <div key={index} className="rounded border border-white/10 bg-[#111113] p-5">{fighter ? <><img src={fighter.profilePhotoUrl || fallbackPortrait} className="h-64 w-full rounded object-cover" /><h2 className="mt-4 font-display text-3xl font-black text-white">{fighter.fullName}</h2></> : <p className="text-zinc-400">Select fighter {index + 1}</p>}</div>)}</div>{rows.length > 0 && <div className="mt-8 rounded border border-white/10 bg-[#111113] p-5">{rows.map(([label, l, r]) => <div key={label} className="grid grid-cols-3 border-b border-white/10 py-3 text-center text-white"><span>{l}</span><b>{label}</b><span>{r}</span></div>)}</div>}</main>;
}

function FightSeekBoard() {
  return <SimpleFeaturePage title="Fight Board" badge="Fight Wanted" loader={() => seekApi.list({ limit: 30 })} empty="No fight listings for this weight class yet. Be the first to post." renderItem={(item) => <div key={item.id} className="rounded border border-white/10 bg-[#111113] p-5"><h3 className="font-display text-2xl font-black text-white">{item.fighter.fullName}</h3><p className="mt-2 text-zinc-400">{formatWeightClass(item.weightClass)} · {formatResult(item.ruleSet)} · {item.location}</p><p className="mt-3 text-sm text-zinc-500">{item.message}</p></div>} />;
}

function SparringFinder() {
  return <SimpleFeaturePage title="Sparring Finder" badge="Sparring" loader={() => fighterApi.list({ seekingSparring: "true", limit: 30 })} empty="No fighters are looking for sparring right now." renderItem={(fighter) => <div key={fighter.id} className="rounded border border-white/10 bg-[#111113] p-5"><img src={fighter.profilePhotoUrl || fallbackPortrait} className="h-48 w-full rounded object-cover" /><h3 className="mt-4 font-display text-2xl font-black text-white">{fighter.fullName}</h3><p className="mt-2 text-zinc-400">{fighter.sparringLocation || fighter.country}</p><p className="mt-2 text-sm text-emerald-300">Seeking sparring partner</p></div>} />;
}

function TournamentHub() {
  return <SimpleFeaturePage title="Tournaments" badge="Bracket Hub" loader={() => tournamentApi.list({ limit: 30 })} empty="No tournaments yet." renderItem={(item) => <div key={item.id} className="rounded border border-white/10 bg-[#111113] p-5"><Badge tone="red">{item.status}</Badge><h3 className="mt-4 font-display text-2xl font-black text-white">{item.name}</h3><p className="mt-2 text-zinc-400">{formatWeightClass(item.weightClass)} · {formatResult(item.ruleSet)} · {item.size} slots</p></div>} />;
}

function GymHub() {
  const [tab, setTab] = useState("gyms");
  return <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8"><Badge tone="red">Gym Network</Badge><h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Gyms</h1><div className="mt-6 flex gap-3"><button onClick={() => setTab("gyms")} className="rounded bg-[#dc1f26] px-5 py-3 font-black text-white">Gyms</button><button onClick={() => setTab("leaderboard")} className="rounded border border-white/10 px-5 py-3 font-black text-white">Gym Leaderboard</button></div><SimpleFeaturePage title="" badge="" loader={tab === "gyms" ? () => gymApi.list({ limit: 30 }) : gymApi.leaderboard} empty="No gyms yet." renderItem={(gym) => <div key={gym.id} className="rounded border border-white/10 bg-[#111113] p-5"><h3 className="font-display text-2xl font-black text-white">{gym.name}</h3><p className="mt-2 text-zinc-400">{gym.city}, {gym.country}</p><p className="mt-2 text-sm text-zinc-500">{gym.fighterCount || 0} fighters · {gym.totalPoints || 0} points</p></div>} /></main>;
}

function MicCheckFeed({ user }) {
  const emojis = ["🔥", "💀", "😂", "🥶", "👊"];
  return <SimpleFeaturePage title="Mic Check 🎤" badge="Fight Talk" loader={micCheckApi.feed} empty="No Mic Checks yet." user={user} renderItem={(item) => <div key={item.id} className="rounded border border-blood/30 bg-[#111113] p-5"><div className="flex gap-4"><img src={item.fighter.profilePhotoUrl || fallbackPortrait} className="h-20 w-20 rounded object-cover" /><div><h3 className="font-display text-2xl font-black text-white">{item.fighter.fullName}</h3><p className="text-zinc-400">{formatWeightClass(item.challenge.weightClass)} · {formatResult(item.challenge.ruleSet)}</p></div></div><p className="mt-5 text-2xl font-black italic text-white">"{item.message}"</p><div className="mt-5 flex gap-2">{emojis.map((emoji) => <button key={emoji} onClick={() => user && micCheckApi.react(item.id, emoji)} className="rounded border border-white/10 px-3 py-2 text-white">{emoji} {item.reactionCounts?.[emoji] || 0}</button>)}</div></div>} />;
}

function NationalChampions({ openProfile }) {
  const [data, setData] = useState({});
  const [weight, setWeight] = useState("LIGHTWEIGHT");
  useEffect(() => { leaderboardApi.national().then(setData).catch(() => setData({})); }, []);
  const rows = data[weight] || [];
  return <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8"><Badge tone="red">National Champions</Badge><h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Country #1 Fighters</h1><div className="mt-6 flex gap-2 overflow-x-auto">{weightClassOptions.map((item) => <button key={item} onClick={() => setWeight(item)} className={`rounded px-4 py-2 text-sm font-black ${weight === item ? "bg-[#dc1f26] text-white" : "border border-white/10 text-zinc-300"}`}>{formatWeightClass(item)}</button>)}</div><div className="mt-8 overflow-hidden rounded border border-white/10 bg-[#111113]"><table className="w-full text-left text-sm"><tbody>{rows.map((row) => <tr key={row.country} className="border-b border-white/10"><td className="p-4 text-white">{row.country}</td><td className="p-4"><button onClick={() => openProfile(row.fighter.id)} className="font-bold text-white">{row.fighter.fullName}</button></td><td className="p-4 text-zinc-300">{row.fighter.points} pts</td></tr>)}</tbody></table></div></main>;
}

function FighterProfilePage({ fighterId, openProfile, user, onLoginRequired }) {
  const [profile, setProfile] = useState(null);
  const [countryRank, setCountryRank] = useState("Live");
  const [weightRank, setWeightRank] = useState("Live");
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [upcomingFight, setUpcomingFight] = useState(null);
  const [upcomingStatus, setUpcomingStatus] = useState("Login to view your challenges");
  const [badges, setBadges] = useState([]);
  const [card, setCard] = useState(null);
  const [nationalChampion, setNationalChampion] = useState(null);
  const [corner, setCorner] = useState({ count: 0, hasCornered: false });
  const [training, setTraining] = useState(null);
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
      setCountryRank(countryBoard.data?.find((item) => item.id === fighter.id)?.rank || "Live");
      setWeightRank(weightBoard.data?.find((item) => item.id === fighter.id)?.rank || "Live");
    };

    loadProfile()
      .catch((caught) => {
        if (!ignore) setError(caught.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [fighterId]);

  useEffect(() => {
    if (!profile) return;

    const isOwnProfile = user?.fighterProfile?.id === profile.id;
    if (!user || !isOwnProfile) {
      setUpcomingFight(null);
      setUpcomingStatus("Login to view your challenges");
      return;
    }

    let ignore = false;
    setUpcomingStatus("Loading challenges...");

    challengeApi
      .mine()
      .then((challenges) => {
        if (ignore) return;
        const accepted = challenges.find((challenge) => challenge.status === "ACCEPTED");
        setUpcomingFight(accepted || null);
        setUpcomingStatus(accepted ? "" : "No upcoming fight scheduled");
      })
      .catch((caught) => {
        if (!ignore) setUpcomingStatus(caught.message);
      });

    return () => {
      ignore = true;
    };
  }, [profile, user]);

  useEffect(() => {
    if (!profile) return;
    badgeApi.forFighter(profile.id).then(setBadges).catch(() => setBadges([]));
    cardApi.getForFighter(profile.id).then(setCard).catch(() => setCard(null));
    leaderboardApi.isChampion(profile.id).then(setNationalChampion).catch(() => setNationalChampion(null));
    cornerManApi.count(profile.id).then(setCorner).catch(() => setCorner({ count: 0, hasCornered: false }));
    trainingApi.forFighter(profile.id).then(setTraining).catch(() => setTraining(null));
  }, [profile]);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <LoadingPanel label="Fetching fighter profile from /api/fighters/:id" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <ErrorPanel message={error} action={{ label: "Browse fighters", onClick: () => openProfile(null) }} />
      </main>
    );
  }

  const methods = methodsFromStats(profile.stats);
  const totalMethodWins = methods.reduce((sum, method) => sum + method.value, 0);
  const status = getStatus(profile);
  const record = profile.stats?.record || {};
  const fightHistory = profile.fights || [];
  const upcomingOpponent = upcomingFight ? getChallengeOpponent(upcomingFight, user) : null;

  const openChallenge = () => {
    if (!user) {
      onLoginRequired();
      return;
    }

    setChallengeModalOpen(true);
  };

  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  };

  const toggleCorner = async () => {
    if (!user) {
      onLoginRequired();
      return;
    }
    if (corner.hasCornered) await cornerManApi.remove(profile.id);
    else await cornerManApi.add(profile.id);
    const next = await cornerManApi.count(profile.id);
    setCorner(next);
  };

  const collectCard = async () => {
    if (!user) {
      onLoginRequired();
      return;
    }
    if (card) await cardApi.collect(card.id);
  };

  return (
    <main className="pt-20">
      {challengeModalOpen && <ChallengeModal receiver={profile} onClose={() => setChallengeModalOpen(false)} />}
      <section className="relative min-h-[520px] overflow-hidden">
        <img src={profile.coverPhotoUrl || fallbackCover} alt={`${profile.fullName} cover`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#07080a_0%,rgba(7,8,10,.78)_45%,rgba(7,8,10,.52)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
          <div className="overflow-hidden rounded border border-white/10 bg-panel shadow-red">
            <img src={profile.profilePhotoUrl || fallbackPortrait} alt={profile.fullName} className="h-[410px] w-full object-cover" />
          </div>
          <div className="flex flex-col justify-end pb-4">
            <div className="flex flex-wrap gap-3">
              <Badge tone={status === "Pro" ? "red" : "dark"}><ShieldCheck className="mr-2" size={14} /> {status}</Badge>
              {profile.verifiedByFederation?.name && <Badge>{profile.verifiedByFederation.name}</Badge>}
              <Badge tone="light">🎖️ {badges.length} badges</Badge>
              {profile.seekingSparring && <Badge tone="light">🥊 Seeking Sparring {profile.sparringLocation ? `· ${profile.sparringLocation}` : ""}</Badge>}
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-none text-white sm:text-7xl">{profile.fullName}</h1>
            {nationalChampion?.isChampion && (
              <div className="mt-5 rounded border border-yellow-300/40 bg-yellow-400/20 px-5 py-4 text-lg font-black text-yellow-100">
                🥇 {profile.country} National Champion · {formatWeightClass(profile.weightClass)}
              </div>
            )}
            <p className="mt-3 text-2xl font-bold text-zinc-300">"{profile.nickname || "No nickname"}"</p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">{profile.bio || "Verified FightID fighter profile."}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-zinc-300">
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Flag size={16} /> {profile.country} {countryNames[profile.country] || profile.country}</span>
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Dumbbell size={16} /> {formatWeightClass(profile.weightClass)}</span>
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Globe2 size={16} /> {profile.gym || "Independent"}</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={openChallenge} className="inline-flex items-center justify-center gap-2 rounded bg-blood px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-red hover:bg-ember">
                <Swords size={18} />
                Challenge this Fighter
              </button>
              <button onClick={shareProfile} className="inline-flex items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-white/10">
                <ArrowRight size={18} />
                {shareCopied ? "Link copied!" : "Share Profile"}
              </button>
              {user?.fighterProfile?.id !== profile.id && (
                <button onClick={toggleCorner} className={`inline-flex items-center justify-center gap-2 rounded px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white ${corner.hasCornered ? "bg-blood" : "border border-white/15 bg-white/5 hover:bg-white/10"}`}>
                  🧤 {corner.hasCornered ? "In Your Corner ✓" : "Corner This Fighter"} · {corner.count}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Record</div>
                <div className="mt-2 font-display text-4xl font-black text-white">{record.wins || 0}-{record.losses || 0}-{record.draws || 0}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Points</div>
                <div className="mt-2 font-display text-4xl font-black text-white">{profile.points || 0}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Country rank</div>
                <div className="mt-2 font-display text-4xl font-black text-white">#{countryRank}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Weight rank</div>
                <div className="mt-2 font-display text-4xl font-black text-white">#{weightRank}</div>
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">Win method breakdown</h2>
                  <p className="mt-1 text-sm text-zinc-400">Verified wins grouped by finish type.</p>
                </div>
                <Activity className="text-blood" />
              </div>
              <div className="mt-6 grid gap-5">
                {methods.map((method) => (
                  <MethodBar key={method.label} method={method} total={totalMethodWins} />
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded border border-white/10 bg-panel">
              <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">Fight history</h2>
                  <p className="mt-1 text-sm text-zinc-400">Confirmed bouts and federation-reviewed records.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                  <Filter size={16} />
                  Filter
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-zinc-500">
                    <tr>
                      {["Date", "Opponent", "Event", "Result", "Method", "Round", "Time"].map((head) => (
                        <th key={head} className="px-5 py-4 font-black">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {fightHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center font-semibold text-zinc-400">No recorded fights yet.</td>
                      </tr>
                    ) : (
                      fightHistory.map((fight) => (
                        <tr key={fight.id} className="text-zinc-300">
                          <td className="px-5 py-4 font-semibold">{formatDate(fight.fightDate)}</td>
                          <td className="px-5 py-4 text-white">{fight.opponentName}</td>
                          <td className="px-5 py-4">{fight.eventName}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded px-2 py-1 text-xs font-black ${fight.result === "WIN" ? "bg-emerald-500/15 text-emerald-300" : "bg-blood/15 text-red-200"}`}>{formatResult(fight.result)}</span>
                          </td>
                          <td className="px-5 py-4">{formatResult(fight.method)}</td>
                          <td className="px-5 py-4">{fight.round}</td>
                          <td className="px-5 py-4">{fight.fightTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-2xl font-black text-white">Badges</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(BADGE_META).map(([type, meta]) => {
                  const earned = badges.find((badge) => badge.type === type);
                  return (
                    <div key={type} title={`${meta.desc}${earned ? ` · Earned ${formatDate(earned.earnedAt)}` : ""}`} className={`rounded border border-white/10 bg-white/5 p-4 text-center ${earned ? "opacity-100" : "opacity-30"}`}>
                      <div className="text-3xl">{earned ? meta.emoji : "🔒"}</div>
                      <div className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-white">{meta.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">Training Activity</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    This month: {training?.summary?.totalSessionsThisMonth || 0} sessions · {Number(training?.summary?.totalHoursThisMonth || 0).toFixed(1)} hours
                  </p>
                </div>
                {user?.fighterProfile?.id === profile.id && <button className="rounded bg-[#dc1f26] px-5 py-3 font-black text-white">Log Training Session</button>}
              </div>
              <div className="mt-5 grid gap-3">
                {(training?.data || []).slice(0, 10).map((log) => (
                  <div key={log.id} className="rounded border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                    <b className="text-white">{formatResult(log.type)}</b> · {log.durationMins} mins · {formatDate(log.date)}
                    {log.note && <p className="mt-1 text-zinc-400">{log.note}</p>}
                  </div>
                ))}
                {(!training?.data || training.data.length === 0) && <p className="text-sm text-zinc-500">No training logs yet.</p>}
              </div>
            </div>
          </div>

          <aside className="grid gap-5 self-start">
            {card && (
              <div className="rounded border border-yellow-400/30 bg-panel p-5 shadow-red">
                <Badge tone="red">{card.tier}</Badge>
                <h2 className="mt-4 font-display text-xl font-black text-white">Collectible Fighter Card</h2>
                <img src={profile.profilePhotoUrl || fallbackPortrait} alt={profile.fullName} className="mt-4 h-52 w-full rounded object-cover" />
                <button disabled={user?.fighterProfile?.id === profile.id} onClick={collectCard} className="mt-4 w-full rounded bg-[#dc1f26] px-5 py-3 font-black text-white disabled:opacity-60">
                  {user?.fighterProfile?.id === profile.id ? "Your Card" : "Collect"}
                </button>
              </div>
            )}
            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-xl font-black text-white">Upcoming fight</h2>
              <div className="mt-5 rounded border border-blood/30 bg-blood/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-red-100">
                  <CalendarDays size={16} />
                  {upcomingFight ? formatDate(upcomingFight.proposedDateFrom) : "Challenge schedule"}
                </div>
                <h3 className="mt-3 font-display text-2xl font-black text-white">{upcomingFight ? upcomingOpponent : upcomingStatus}</h3>
                {upcomingFight && (
                  <p className="mt-2 text-sm text-zinc-400">
                    {formatResult(upcomingFight.ruleSet)} in {upcomingFight.location} from {formatDate(upcomingFight.proposedDateFrom)}.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-xl font-black text-white">Verification</h2>
              <div className="mt-5 grid gap-3">
                {[
                  `${status} status from backend`,
                  profile.verifiedByFederation?.name || "Federation review pending",
                  profile.isVerifiedPro ? "Pro verification active" : "Amateur profile active",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <CheckCircle2 className="text-emerald-400" size={18} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-xl font-black text-white">Social links</h2>
              <div className="mt-4 grid gap-3">
                <a href={profile.instagramUrl || "#"} className="flex items-center justify-between rounded border border-white/10 px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/10">
                  Instagram <span className="text-zinc-400">{profile.instagramUrl ? "Open" : "Not set"}</span>
                </a>
                <a href={profile.youtubeUrl || "#"} className="flex items-center justify-between rounded border border-white/10 px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/10">
                  YouTube <span className="text-zinc-400">{profile.youtubeUrl ? "Open" : "Not set"}</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function RankingsPage({ openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [role, setRole] = useState("");
  const [weightClass, setWeightClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fighterApi
      .leaderboard({ limit: 50, role, weightClass })
      .then((result) => {
        setFighters((result.data || []).map(normalizeCardFighter));
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [role, weightClass]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="red">Live Rankings</Badge>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Rankings</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded border border-white/10 bg-canvas px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blood">
            <option value="">All roles</option>
            <option value="PRO">Pro</option>
            <option value="AMATEUR">Amateur</option>
          </select>
          <select value={weightClass} onChange={(event) => setWeightClass(event.target.value)} className="rounded border border-white/10 bg-canvas px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blood">
            <option value="">All weights</option>
            {["LIGHTWEIGHT", "WELTERWEIGHT", "MIDDLEWEIGHT", "FLYWEIGHT", "BANTAMWEIGHT", "FEATHERWEIGHT"].map((value) => (
              <option key={value} value={value}>{formatWeightClass(value)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded border border-white/10 bg-panel">
        {loading && <div className="p-5"><LoadingPanel label="Fetching rankings from /api/fighters/leaderboard" /></div>}
        {error && <div className="p-5"><ErrorPanel message={error} /></div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-zinc-500">
                <tr>
                  {["Rank", "Fighter", "Status", "Country", "Weight", "Gym", "Points"].map((head) => (
                    <th key={head} className="px-5 py-4 font-black">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {fighters.map((fighter) => (
                  <tr key={fighter.id} className="text-zinc-300">
                    <td className="px-5 py-4 font-display text-2xl font-black text-white">#{fighter.rank}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => openProfile(fighter.id)} className="font-bold text-white hover:text-red-100">{fighter.name}</button>
                      <div className="text-xs text-zinc-500">"{fighter.nickname}"</div>
                    </td>
                    <td className="px-5 py-4"><Badge tone={fighter.status === "Pro" ? "red" : "dark"}>{fighter.status}</Badge></td>
                    <td className="px-5 py-4">{fighter.country}</td>
                    <td className="px-5 py-4">{fighter.weightClass}</td>
                    <td className="px-5 py-4">{fighter.gym}</td>
                    <td className="px-5 py-4 font-black text-white">{fighter.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function FederationPanel({ user, onLoginClick, openProfile }) {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [note, setNote] = useState("");
  const canReview = ["ADMIN", "FEDERATION_REP"].includes(user?.role);
  const isAdmin = user?.role === "ADMIN";

  const loadPanel = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsResult, pendingResult, fightersResult] = await Promise.all([
        adminApi.stats(),
        verificationApi.pending(),
        adminApi.fighters({ limit: 8 }),
      ]);
      setStats(statsResult);
      setRequests(pendingResult || []);
      setFighters(fightersResult.data || []);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canReview) loadPanel();
  }, [canReview]);

  const reviewRequest = async (requestId, decision) => {
    setActionLoading(requestId);
    setError("");
    try {
      if (decision === "approve") await verificationApi.approve(requestId, note);
      else await verificationApi.reject(requestId, note || "Not enough verified documentation.");
      setNote("");
      await loadPanel();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setActionLoading("");
    }
  };

  const updateRole = async (fighterId, role) => {
    setActionLoading(fighterId);
    setError("");
    try {
      await adminApi.updateRole(fighterId, role);
      await loadPanel();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setActionLoading("");
    }
  };

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <div className="rounded border border-white/10 bg-panel p-8">
          <Badge tone="red">Federation</Badge>
          <h1 className="mt-5 font-display text-4xl font-black text-white">Login required</h1>
          <p className="mt-3 text-zinc-400">Federation tools are protected for admins and federation representatives.</p>
          <button onClick={onLoginClick} className="mt-6 rounded bg-blood px-5 py-3 font-black text-white shadow-red">Login</button>
        </div>
      </main>
    );
  }

  if (!canReview) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <div className="rounded border border-white/10 bg-panel p-8">
          <Badge tone="red">Federation</Badge>
          <h1 className="mt-5 font-display text-4xl font-black text-white">Access restricted</h1>
          <p className="mt-3 text-zinc-400">This panel is available only for ADMIN and FEDERATION_REP accounts.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="red">Federation Command</Badge>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Federation Panel</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">Review Pro requests, monitor platform health, and manage fighter status.</p>
        </div>
        <button onClick={loadPanel} className="rounded border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10">Refresh</button>
      </div>

      {loading && <div className="mt-8"><LoadingPanel label="Loading federation data" /></div>}
      {error && <div className="mt-8"><ErrorPanel message={error} action={{ label: "Try again", onClick: loadPanel }} /></div>}

      {!loading && !error && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded border border-white/10 bg-panel p-5"><div className="text-3xl font-black text-white">{stats?.totalFighters || 0}</div><div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Fighters</div></div>
            <div className="rounded border border-white/10 bg-panel p-5"><div className="text-3xl font-black text-white">{stats?.proCount || 0}</div><div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Pros</div></div>
            <div className="rounded border border-white/10 bg-panel p-5"><div className="text-3xl font-black text-white">{stats?.fightsLogged || 0}</div><div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Fights</div></div>
            <div className="rounded border border-white/10 bg-panel p-5"><div className="text-3xl font-black text-white">{stats?.activeChallenges || 0}</div><div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Active challenges</div></div>
          </div>

          <section className="mt-8 rounded border border-white/10 bg-panel p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-black text-white">Pending Pro Verification</h2>
                <p className="mt-1 text-sm text-zinc-400">{requests.length} request{requests.length === 1 ? "" : "s"} waiting for review.</p>
              </div>
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Review note, optional for approve" className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blood sm:max-w-md" />
            </div>
            <div className="mt-5 grid gap-3">
              {requests.length === 0 && <div className="rounded border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">No pending Pro verification requests.</div>}
              {requests.map((request) => (
                <div key={request.id} className="grid gap-4 rounded border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <button onClick={() => openProfile(request.fighterId)} className="font-display text-xl font-black text-white hover:text-red-100">{request.fighter?.fullName || "Fighter"}</button>
                    <div className="mt-1 text-sm text-zinc-400">{request.federation?.name} · submitted {formatDate(request.createdAt)}</div>
                    {request.documentUrl && <a href={request.documentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-bold text-red-100 hover:text-white">Open document</a>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={actionLoading === request.id} onClick={() => reviewRequest(request.id, "approve")} className="rounded bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">Approve</button>
                    <button disabled={actionLoading === request.id} onClick={() => reviewRequest(request.id, "reject")} className="rounded bg-blood px-4 py-3 text-sm font-black text-white disabled:opacity-60">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded border border-white/10 bg-panel">
            <div className="border-b border-white/10 p-5">
              <h2 className="font-display text-2xl font-black text-white">Recent Fighters</h2>
              <p className="mt-1 text-sm text-zinc-400">Fast status overview for federation review.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <tr>{["Fighter", "Role", "Country", "Weight", "Points", "Admin Action"].map((head) => <th key={head} className="px-5 py-4 font-black">{head}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {fighters.map((fighter) => (
                    <tr key={fighter.id} className="text-zinc-300">
                      <td className="px-5 py-4"><button onClick={() => openProfile(fighter.id)} className="font-bold text-white hover:text-red-100">{fighter.fullName}</button></td>
                      <td className="px-5 py-4"><Badge tone={fighter.isVerifiedPro ? "red" : "dark"}>{fighter.user?.role || "AMATEUR"}</Badge></td>
                      <td className="px-5 py-4">{fighter.country}</td>
                      <td className="px-5 py-4">{formatWeightClass(fighter.weightClass)}</td>
                      <td className="px-5 py-4 font-black text-white">{fighter.points}</td>
                      <td className="px-5 py-4">
                        {isAdmin ? (
                          <div className="flex gap-2">
                            <button disabled={actionLoading === fighter.id} onClick={() => updateRole(fighter.id, "PRO")} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 disabled:opacity-60">Make Pro</button>
                            <button disabled={actionLoading === fighter.id} onClick={() => updateRole(fighter.id, "AMATEUR")} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 disabled:opacity-60">Amateur</button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">Admin only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function PlaceholderPage({ title, icon: Icon }) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="rounded border border-white/10 bg-panel p-8">
        <Icon className="text-blood" size={34} />
        <h1 className="mt-5 font-display text-4xl font-black text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          This section is queued for the next FightID build phase. The live fighter, profile, and leaderboard API integrations are now connected.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("Home");
  const [selectedFighterId, setSelectedFighterId] = useState(null);
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

  useEffect(() => {
    const palette = themePalettes[settings.theme] || themePalettes.dark;

    localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    document.documentElement.dataset.fightidTheme = settings.theme;
    document.documentElement.dataset.fightidLanguage = settings.language;
    document.documentElement.dataset.fightidCompact = String(settings.compactMode);
    document.documentElement.dataset.fightidReduceMotion = String(settings.reduceMotion);

    const styleId = "fightid-settings-overrides";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      :root {
        --fightid-accent: ${settings.accent};
        --fightid-canvas: ${palette.canvas};
        --fightid-panel: ${palette.panel};
        --fightid-elevated: ${palette.elevated};
        --fightid-text: ${palette.text};
        --fightid-border: ${palette.border};
      }
      body { background: var(--fightid-canvas) !important; color: var(--fightid-text) !important; }
      .bg-canvas,
      .bg-canvas\\/80 { background-color: var(--fightid-canvas) !important; }
      .bg-panel,
      .bg-\\[\\#111113\\],
      .bg-\\[\\#0a0a0b\\] { background-color: var(--fightid-panel) !important; }
      .text-bone { color: var(--fightid-text) !important; }
      .border-white\\/10,
      .border-white\\/15 { border-color: var(--fightid-border) !important; }
      .bg-blood { background-color: var(--fightid-accent) !important; }
      .bg-blood\\/10 { background-color: color-mix(in srgb, var(--fightid-accent), transparent 90%) !important; }
      .bg-blood\\/15 { background-color: color-mix(in srgb, var(--fightid-accent), transparent 85%) !important; }
      .bg-blood\\/20 { background-color: color-mix(in srgb, var(--fightid-accent), transparent 80%) !important; }
      .text-blood { color: var(--fightid-accent) !important; }
      .border-blood { border-color: var(--fightid-accent) !important; }
      .border-blood\\/30,
      .border-blood\\/40 { border-color: color-mix(in srgb, var(--fightid-accent), transparent 58%) !important; }
      .shadow-red { box-shadow: 0 0 30px color-mix(in srgb, var(--fightid-accent), transparent 58%) !important; }
      html[data-fightid-theme="contrast"] .text-zinc-400 { color: #d4d4d8 !important; }
      html[data-fightid-theme="contrast"] .text-zinc-500 { color: #b7b7c0 !important; }
      html[data-fightid-compact="true"] { font-size: 14px; }
      html[data-fightid-reduce-motion="true"] *,
      html[data-fightid-reduce-motion="true"] *::before,
      html[data-fightid-reduce-motion="true"] *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
    `;
  }, [settings]);

  useEffect(() => {
    const refreshToken = localStorage.getItem(refreshTokenStorageKey);
    if (!refreshToken) return;

    let ignore = false;
    authApi
      .refresh(refreshToken)
      .then((result) => {
        if (ignore) return;
        setAccessToken(result.accessToken);
        localStorage.setItem(refreshTokenStorageKey, result.refreshToken);
      })
      .catch(() => {
        if (ignore) return;
        setAccessToken(null);
        localStorage.removeItem(refreshTokenStorageKey);
        localStorage.removeItem(userStorageKey);
        setUser(null);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    const socket = createFightIdSocket(user.id);
    const showToast = (message) => {
      setToast(message);
      window.setTimeout(() => setToast(null), 3000);
    };
    socket.on("fighter:won", () => showToast("Your fighter just won!"));
    socket.on("training:new", () => showToast("Your fighter just logged a training session 💪"));
    socket.on("miccheck:new", () => showToast("Your opponent just dropped a Mic Check 🎤 — check it out!"));
    socket.on("notification:new", (notification) => showToast(notification.message));
    return () => socket.disconnect();
  }, [user]);

  const openProfile = (fighterId) => {
    setSelectedFighterId(fighterId);
    setPage(fighterId ? "Fighter Profile" : "Fighters");
  };

  const openAuth = (tab) => {
    setAuthModal(tab);
  };

  const closeAuth = () => {
    setAuthModal(null);
  };

  const updateSettings = (patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem(refreshTokenStorageKey);

    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      setAccessToken(null);
      localStorage.removeItem(refreshTokenStorageKey);
      localStorage.removeItem(userStorageKey);
      setUser(null);
    }
  };

  const pages = {
    Home: <LandingPage setPage={setPage} openProfile={openProfile} />,
    Fighters: <FightersPage openProfile={openProfile} />,
    Compare: <HeadToHead />,
    "Fight Board": <FightSeekBoard user={user} onLoginClick={() => openAuth("login")} />,
    Sparring: <SparringFinder />,
    Tournaments: <TournamentHub user={user} />,
    Gyms: <GymHub />,
    "National Champions": <NationalChampions openProfile={openProfile} />,
    "Mic Check 🎤": <MicCheckFeed user={user} />,
    "My Collection": <MyCollectionPage user={user} onLoginClick={() => openAuth("login")} />,
    "My Fighters": <MyFightersPage user={user} onLoginClick={() => openAuth("login")} />,
    "Fighter Profile": <FighterProfilePage fighterId={selectedFighterId} openProfile={openProfile} user={user} onLoginRequired={() => openAuth("login")} />,
    Rankings: <RankingsPage openProfile={openProfile} />,
    Challenges: <ChallengesPage user={user} onLoginClick={() => openAuth("login")} />,
    Federation: <FederationPanel user={user} onLoginClick={() => openAuth("login")} openProfile={openProfile} />,
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-bone">
      <AppHeader
        page={page}
        setPage={setPage}
        user={user}
        settings={settings}
        t={t}
        onSettingsClick={() => setSettingsOpen(true)}
        onLoginClick={() => openAuth("login")}
        onRegisterClick={() => openAuth("register")}
        onLogout={handleLogout}
      />
      {pages[page]}
      {authModal && <AuthModal initialTab={authModal} onClose={closeAuth} onSuccess={setUser} />}
      <SettingsPanel open={settingsOpen} settings={settings} onChange={updateSettings} onClose={() => setSettingsOpen(false)} t={t} />
      {toast && <div className="fixed bottom-5 right-5 z-[120] rounded border border-blood/40 bg-[#111113] px-5 py-4 font-bold text-white shadow-red">{toast}</div>}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
        <span className="font-black uppercase tracking-[0.18em] text-zinc-300">FightID</span>
        <span className="mx-3 text-zinc-700">/</span>
        Verified combat network for fighters, federations, and fight fans.
      </footer>
    </div>
  );
}
