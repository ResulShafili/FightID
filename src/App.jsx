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
  Menu,
  Search,
  ShieldCheck,
  Swords,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { authApi, fighterApi, setAccessToken } from "./lib/api";

const navItems = ["Home", "Fighters", "Fighter Profile", "Rankings", "Challenges", "Federation"];
const fallbackPortrait = "/assets/fighter-portrait.png";
const fallbackCover = "/assets/hero-arena.png";
const refreshTokenStorageKey = "fightidRefreshToken";
const userStorageKey = "fightidUser";

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

function AppHeader({ page, setPage, user, onLoginClick, onRegisterClick, onLogout }) {
  const [open, setOpen] = useState(false);

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
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setPage(item)}
              className={`rounded px-4 py-2 text-sm font-semibold transition ${
                page === item ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button onClick={() => setPage("Fighters")} className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            <Search size={16} />
            Search
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="max-w-[180px] truncate text-sm font-bold text-white">{getUserDisplayName(user)}</span>
              <button onClick={onLogout} className="rounded border border-white/15 px-4 py-2 text-sm font-black text-white hover:bg-white/10">
                Logout
              </button>
            </div>
          ) : (
            <>
              <button onClick={onLoginClick} className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm font-black text-white hover:bg-white/10">
                Login
              </button>
              <button onClick={onRegisterClick} className="inline-flex items-center gap-2 rounded bg-blood px-4 py-2 text-sm font-black text-white shadow-red hover:bg-ember">
                Join FightID
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        <button className="rounded border border-white/15 p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-canvas px-4 py-3 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => {
                setPage(item);
                setOpen(false);
              }}
              className="block w-full rounded px-3 py-3 text-left text-sm font-semibold text-zinc-200 hover:bg-white/10"
            >
              {item}
            </button>
          ))}
          <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
            {user ? (
              <>
                <div className="rounded bg-white/5 px-3 py-3 text-sm font-bold text-white">{getUserDisplayName(user)}</div>
                <button
                  onClick={() => {
                    onLogout();
                    setOpen(false);
                  }}
                  className="block w-full rounded border border-white/15 px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10"
                >
                  Logout
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
                  Login
                </button>
                <button
                  onClick={() => {
                    onRegisterClick();
                    setOpen(false);
                  }}
                  className="block w-full rounded bg-blood px-3 py-3 text-left text-sm font-black text-white shadow-red hover:bg-ember"
                >
                  Join FightID
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
  const [stats, setStats] = useState({ fighters: "Live", fights: "Live", countries: "Live" });
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fighterApi
      .leaderboard({ limit: 3 })
      .then((result) => {
        if (ignore) return;
        const data = result.data || [];
        setFighters(data.map(normalizeCardFighter));
        setStats({
          fighters: result.pagination?.total || data.length,
          fights: "API",
          countries: new Set(data.map((fighter) => fighter.country)).size || "Live",
        });
      })
      .catch((caught) => {
        if (!ignore) setError(caught.message);
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
              <Stat value={stats.fights} label="Backend" />
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
          {error && <div className="md:col-span-3"><ErrorPanel message={error} /></div>}
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

function FighterProfilePage({ fighterId, openProfile }) {
  const [profile, setProfile] = useState(null);
  const [countryRank, setCountryRank] = useState("Live");
  const [weightRank, setWeightRank] = useState("Live");
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

  return (
    <main className="pt-20">
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
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-none text-white sm:text-7xl">{profile.fullName}</h1>
            <p className="mt-3 text-2xl font-bold text-zinc-300">"{profile.nickname || "No nickname"}"</p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">{profile.bio || "Verified FightID fighter profile."}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-zinc-300">
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Flag size={16} /> {profile.country} {countryNames[profile.country] || profile.country}</span>
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Dumbbell size={16} /> {formatWeightClass(profile.weightClass)}</span>
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Globe2 size={16} /> {profile.gym || "Independent"}</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded bg-blood px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-red hover:bg-ember">
                <Swords size={18} />
                Challenge this Fighter
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-white/10">
                <Bell size={18} />
                Follow
              </button>
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
                    {(profile.fights || []).map((fight) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="grid gap-5 self-start">
            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-xl font-black text-white">Upcoming fight</h2>
              <div className="mt-5 rounded border border-blood/30 bg-blood/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-red-100">
                  <CalendarDays size={16} />
                  Live challenge feed pending
                </div>
                <h3 className="mt-3 font-display text-2xl font-black text-white">No accepted challenge loaded</h3>
                <p className="mt-2 text-sm text-zinc-400">Challenge data will appear here when the authenticated challenge endpoints are connected.</p>
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
          <Badge tone="red">/api/fighters/leaderboard</Badge>
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
    "Fighter Profile": <FighterProfilePage fighterId={selectedFighterId} openProfile={openProfile} />,
    Rankings: <RankingsPage openProfile={openProfile} />,
    Challenges: <PlaceholderPage title="Challenges" icon={Zap} />,
    Federation: <PlaceholderPage title="Federation Panel" icon={ShieldCheck} />,
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-bone">
      <AppHeader
        page={page}
        setPage={setPage}
        user={user}
        onLoginClick={() => openAuth("login")}
        onRegisterClick={() => openAuth("register")}
        onLogout={handleLogout}
      />
      {pages[page]}
      {authModal && <AuthModal initialTab={authModal} onClose={closeAuth} onSuccess={setUser} />}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
        FightID frontend | React + Tailwind CSS | Live Railway API
      </footer>
    </div>
  );
}
