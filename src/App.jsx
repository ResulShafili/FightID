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
import React from "react";
import { useState } from "react";
import { featuredFights, profile, topFighters } from "./data";

const navItems = ["Home", "Fighter Profile", "Rankings", "Challenges", "Federation"];

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

function AppHeader({ page, setPage }) {
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
          <button className="inline-flex items-center gap-2 rounded border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            <Search size={16} />
            Search
          </button>
          <button className="inline-flex items-center gap-2 rounded bg-blood px-4 py-2 text-sm font-black text-white shadow-red hover:bg-ember">
            Join FightID
            <ArrowRight size={16} />
          </button>
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
        </div>
      )}
    </header>
  );
}

function FighterCard({ fighter }) {
  return (
    <article className="group overflow-hidden rounded border border-white/10 bg-panel">
      <div className="relative h-64 overflow-hidden">
        <img src={fighter.image} alt={fighter.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute left-4 top-4 flex gap-2">
          <Badge tone={fighter.status === "Pro" ? "red" : "dark"}>{fighter.status}</Badge>
          <Badge tone="light">#{fighter.rank}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-sm font-semibold text-zinc-300">{fighter.flag} {fighter.country} • {fighter.weightClass}</div>
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
          <div className="text-xl font-black text-white">{fighter.streak}</div>
          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Streak</div>
        </div>
      </div>
    </article>
  );
}

function LandingPage({ setPage }) {
  return (
    <main>
      <section className="relative min-h-[92vh] overflow-hidden pt-24">
        <img src="/assets/hero-arena.png" alt="MMA arena walkout" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#07080a_0%,rgba(7,8,10,.88)_34%,rgba(7,8,10,.36)_72%,rgba(7,8,10,.82)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-canvas to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(92vh-6rem)] max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-3xl">
            <Badge tone="red">Verified MMA Fighter Platform</Badge>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.96] text-white sm:text-7xl lg:text-8xl">
              FightID
            </h1>
            <p className="mt-6 max-w-[calc(100vw-2rem)] break-words text-lg leading-8 text-zinc-300 sm:max-w-2xl sm:text-xl">
              Build a verified fighter identity, track real fight history, climb weight-class rankings, and challenge matched opponents through a confirmation-first fight system.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setPage("Fighter Profile")} className="inline-flex w-full items-center justify-center gap-2 rounded bg-blood px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-red hover:bg-ember sm:w-auto">
                View Fighter Profile
                <ChevronRight size={18} />
              </button>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-white/10 sm:w-auto">
                Start Registration
              </button>
            </div>
            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-2 sm:gap-4">
              <Stat value="18K" label="Fighters" />
              <Stat value="42" label="Countries" />
              <Stat value="8.7K" label="Fights" />
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
            <Badge>Top fighters preview</Badge>
            <h2 className="mt-4 font-display text-3xl font-black text-white sm:text-5xl">Ranked identities, real records.</h2>
          </div>
          <button className="inline-flex w-fit items-center gap-2 rounded border border-white/15 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">
            Full leaderboard
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {topFighters.map((fighter) => (
            <FighterCard key={fighter.id} fighter={fighter} />
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <Badge tone="red">Featured fights</Badge>
            <h2 className="mt-4 font-display text-3xl font-black text-white">Challenges worth watching.</h2>
            <p className="mt-4 text-zinc-400">Curated matchups and high-stakes accepted challenges surface on the home page to drive discovery.</p>
          </div>
          <div className="grid gap-4">
            {featuredFights.map((fight) => (
              <div key={fight.title} className="grid gap-4 rounded border border-white/10 bg-panel p-5 sm:grid-cols-[110px_1fr_auto] sm:items-center">
                <div className="rounded bg-white text-center text-black">
                  <div className="bg-blood px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">{fight.date.split(" ")[0]}</div>
                  <div className="px-3 py-3 font-display text-2xl font-black">{fight.date.split(" ")[1]}</div>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-500">{fight.title} • {fight.location}</p>
                  <h3 className="mt-1 font-display text-2xl font-black text-white">{fight.fighters}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{fight.stake}</p>
                </div>
                <button className="inline-flex items-center justify-center rounded border border-white/15 p-3 text-white hover:bg-white/10" aria-label="Open fight">
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function MethodBar({ method, total }) {
  const width = `${Math.round((method.value / total) * 100)}%`;
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

function FighterProfilePage() {
  const totalMethodWins = profile.methods.reduce((sum, method) => sum + method.value, 0);

  return (
    <main className="pt-20">
      <section className="relative min-h-[520px] overflow-hidden">
        <img src={profile.cover} alt={`${profile.name} cover`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#07080a_0%,rgba(7,8,10,.78)_45%,rgba(7,8,10,.52)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
          <div className="overflow-hidden rounded border border-white/10 bg-panel shadow-red">
            <img src={profile.image} alt={profile.name} className="h-[410px] w-full object-cover" />
          </div>
          <div className="flex flex-col justify-end pb-4">
            <div className="flex flex-wrap gap-3">
              <Badge tone="red"><ShieldCheck className="mr-2" size={14} /> {profile.status}</Badge>
              <Badge>{profile.federation}</Badge>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-none text-white sm:text-7xl">{profile.name}</h1>
            <p className="mt-3 text-2xl font-bold text-zinc-300">"{profile.nickname}"</p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">{profile.bio}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-zinc-300">
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Flag size={16} /> {profile.flag} {profile.country}</span>
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Dumbbell size={16} /> {profile.weightClass}</span>
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Globe2 size={16} /> {profile.gym}</span>
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
                <div className="mt-2 font-display text-4xl font-black text-white">{profile.record.wins}-{profile.record.losses}-{profile.record.draws}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Points</div>
                <div className="mt-2 font-display text-4xl font-black text-white">{profile.points}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Country rank</div>
                <div className="mt-2 font-display text-4xl font-black text-white">#{profile.countryRank}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Weight rank</div>
                <div className="mt-2 font-display text-4xl font-black text-white">#{profile.weightRank}</div>
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
                {profile.methods.map((method) => (
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
                    {profile.history.map((fight) => (
                      <tr key={`${fight.date}-${fight.opponent}`} className="text-zinc-300">
                        <td className="px-5 py-4 font-semibold">{fight.date}</td>
                        <td className="px-5 py-4 text-white">{fight.opponent}</td>
                        <td className="px-5 py-4">{fight.event}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded px-2 py-1 text-xs font-black ${fight.result === "Win" ? "bg-emerald-500/15 text-emerald-300" : "bg-blood/15 text-red-200"}`}>{fight.result}</span>
                        </td>
                        <td className="px-5 py-4">{fight.method}</td>
                        <td className="px-5 py-4">{fight.round}</td>
                        <td className="px-5 py-4">{fight.time}</td>
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
                  Jun 18 • Baku
                </div>
                <h3 className="mt-3 font-display text-2xl font-black text-white">Volkova vs. Imanova</h3>
                <p className="mt-2 text-sm text-zinc-400">MMA ruleset, Flyweight, accepted challenge pending event confirmation.</p>
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-xl font-black text-white">Verification</h2>
              <div className="mt-5 grid gap-3">
                {["Federation membership active", "Fight record reviewed", "License document approved"].map((item) => (
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
                <button className="flex items-center justify-between rounded border border-white/10 px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/10">
                  Instagram <span className="text-zinc-400">{profile.socials.instagram}</span>
                </button>
                <button className="flex items-center justify-between rounded border border-white/10 px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/10">
                  YouTube <span className="text-zinc-400">{profile.socials.youtube}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
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
          This section is queued for the next FightID build phase. The shared navigation, visual system, and sample data are already in place.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("Home");
  const pages = {
    Home: <LandingPage setPage={setPage} />,
    "Fighter Profile": <FighterProfilePage />,
    Rankings: <PlaceholderPage title="Rankings" icon={Trophy} />,
    Challenges: <PlaceholderPage title="Challenges" icon={Zap} />,
    Federation: <PlaceholderPage title="Federation Panel" icon={ShieldCheck} />,
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-canvas text-bone">
      <AppHeader page={page} setPage={setPage} />
      {pages[page]}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
        FightID frontend prototype • React + Tailwind CSS
      </footer>
    </div>
  );
}
