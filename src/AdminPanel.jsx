import {
  ArrowLeft,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Gauge,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trash2,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Avatar } from "./components/Avatar";
import { adminApi, fightApi, verificationApi } from "./lib/api";
import {
  countryNames,
  flagEmoji,
  formatDate,
  formatFightMethod,
  formatFightResult,
  formatWeightClass,
  statusLabel,
  weightClassOptions,
} from "./lib/format";

const REVIEW_ROLES = ["ADMIN", "FEDERATION_REP"];

/* ------------------------------- primitives ------------------------------- */

const panel = "rounded-xl border border-white/10 bg-[#15161b]";
const inputClass =
  "w-full rounded-lg border border-white/10 bg-[#0e0f13] px-3 py-2.5 text-sm font-medium text-white outline-none transition placeholder:text-zinc-600 focus:border-blood focus:ring-2 focus:ring-blood/25";

function Tag({ children, tone = "default" }) {
  const tones = {
    default: "border-white/12 bg-white/[0.04] text-zinc-300",
    red: "border-blood/45 bg-blood/15 text-red-100",
    gold: "border-gold/45 bg-gold/15 text-amber-100",
    emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Loading({ label = "Yüklənir" }) {
  return (
    <div className={`${panel} flex items-center gap-3 p-5 text-sm font-semibold text-zinc-400`}>
      <span className="h-2 w-2 animate-pulse rounded-full bg-blood" />
      {label}…
    </div>
  );
}

function ErrorBox({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-blood/30 bg-blood/10 p-5">
      <div className="flex items-center gap-2 font-bold text-white"><ShieldAlert size={16} className="text-blood" /> Xəta</div>
      <p className="mt-2 text-sm leading-6 text-red-100/80">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-4 rounded-lg border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/10">
          Yenidən cəhd et
        </button>
      )}
    </div>
  );
}

function Empty({ title, subtitle }) {
  return (
    <div className={`${panel} p-10 text-center`}>
      <div className="font-display text-lg font-bold uppercase text-white">{title}</div>
      {subtitle && <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>}
    </div>
  );
}

function SectionHead({ title, subtitle, right }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase leading-none text-white">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function Pager({ page, limit, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-white/8 px-4 py-3">
      <span className="font-mono text-xs text-zinc-500">
        {total} nəticə · səhifə {page}/{pages}
      </span>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-40"
        >
          <ChevronLeft size={14} /> Əvvəlki
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-40"
        >
          Növbəti <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function FighterCell({ fighter, onOpen }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/10">
        <Avatar name={fighter?.fullName} photoUrl={fighter?.profilePhotoUrl} />
      </div>
      <div className="min-w-0">
        <button onClick={() => fighter?.id && onOpen(fighter.id)} className="block max-w-[220px] truncate text-left text-sm font-bold text-white transition hover:text-red-100">
          {fighter?.fullName || "Naməlum"}
        </button>
        <div className="font-mono text-[11px] text-zinc-500">
          {flagEmoji(fighter?.country)} {fighter?.country} · {formatWeightClass(fighter?.weightClass)}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- sections -------------------------------- */

function Dashboard({ openProfile }) {
  const [stats, setStats] = useState(null);
  const [queues, setQueues] = useState({ verifications: 0, unverifiedFights: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([adminApi.stats(), verificationApi.pending(), adminApi.fights({ isVerified: "false", limit: 1 })])
      .then(([statsResult, pending, fights]) => {
        setStats(statsResult);
        setQueues({
          verifications: (pending || []).length,
          unverifiedFights: fights?.pagination?.total ?? (fights?.data || []).length,
        });
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading) return <Loading label="İcmal yüklənir" />;
  if (error) return <ErrorBox message={error} onRetry={load} />;

  const tiles = [
    ["Döyüşçülər", stats?.totalFighters ?? 0, Users],
    ["Pro döyüşçülər", stats?.proCount ?? 0, ShieldCheck],
    ["Qeydə alınmış döyüşlər", stats?.fightsLogged ?? 0, Swords],
    ["Aktiv çağırışlar", stats?.activeChallenges ?? 0, Gauge],
  ];

  return (
    <>
      <SectionHead
        title="İcmal"
        subtitle="Platformanın ümumi vəziyyəti və gözləyən işlər."
        right={
          <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
            <RefreshCw size={15} /> Yenilə
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(([label, value, Icon]) => (
          <div key={label} className={`${panel} p-5`}>
            <Icon size={16} className="text-blood" />
            <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">{label}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-9 font-display text-xl font-bold uppercase text-white">Gözləyən işlər</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <NavLink to="/admin/verifications" className={`${panel} group flex items-center justify-between p-5 transition hover:border-blood/40`}>
          <div>
            <div className="font-display text-2xl font-bold text-white">{queues.verifications}</div>
            <div className="mt-1 text-sm text-zinc-400">Pro təsdiqi gözləyən müraciət</div>
          </div>
          <BadgeCheck size={22} className="text-gold transition group-hover:scale-110" />
        </NavLink>
        <NavLink to="/admin/fights" className={`${panel} group flex items-center justify-between p-5 transition hover:border-blood/40`}>
          <div>
            <div className="font-display text-2xl font-bold text-white">{queues.unverifiedFights}</div>
            <div className="mt-1 text-sm text-zinc-400">Təsdiq gözləyən döyüş qeydi</div>
          </div>
          <Swords size={22} className="text-blood transition group-hover:scale-110" />
        </NavLink>
      </div>
    </>
  );
}

function FightersSection({ user, openProfile }) {
  const isAdmin = user?.role === "ADMIN";
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filters, setFilters] = useState({ search: "", weightClass: "", country: "", role: "" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    adminApi
      .fighters({ ...filters, page, limit: 20 })
      .then((result) => {
        setRows(result.data || []);
        setPagination(result.pagination || { page, limit: 20, total: (result.data || []).length });
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const changeRole = async (fighterId, role) => {
    setBusyId(fighterId);
    setError("");
    try {
      await adminApi.updateRole(fighterId, role);
      load();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusyId("");
    }
  };

  const setFilter = (patch) => {
    setPage(1);
    setFilters((current) => ({ ...current, ...patch }));
  };

  return (
    <>
      <SectionHead title="Döyüşçülər" subtitle="Bütün profilləri axtar, süz və rollarını idarə et." />

      <div className={`${panel} mb-4 grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4`}>
        <input value={filters.search} onChange={(e) => setFilter({ search: e.target.value })} placeholder="Ad ilə axtar" className={inputClass} />
        <select value={filters.weightClass} onChange={(e) => setFilter({ weightClass: e.target.value })} className={inputClass}>
          <option value="">Bütün çəkilər</option>
          {weightClassOptions.map((value) => (
            <option key={value} value={value}>{formatWeightClass(value)}</option>
          ))}
        </select>
        <input
          value={filters.country}
          onChange={(e) => setFilter({ country: e.target.value.toUpperCase().slice(0, 2) })}
          placeholder="Ölkə kodu (AZ)"
          className={inputClass}
        />
        <select value={filters.role} onChange={(e) => setFilter({ role: e.target.value })} className={inputClass}>
          <option value="">Bütün statuslar</option>
          <option value="PRO">Pro</option>
          <option value="AMATEUR">Həvəskar</option>
        </select>
      </div>

      {error && <div className="mb-4"><ErrorBox message={error} onRetry={load} /></div>}
      {loading && <Loading label="Döyüşçülər yüklənir" />}
      {!loading && rows.length === 0 && <Empty title="Nəticə yoxdur" subtitle="Axtarış və ya filtrləri dəyişin." />}

      {!loading && rows.length > 0 && (
        <div className={`${panel} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-black/40 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                <tr>
                  {["Döyüşçü", "Status", "Zal", "Xal", "Qeydiyyat", "Əməliyyat"].map((head) => (
                    <th key={head} className="px-4 py-3 font-bold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {rows.map((fighter) => (
                  <tr key={fighter.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3"><FighterCell fighter={fighter} onOpen={openProfile} /></td>
                    <td className="px-4 py-3">
                      <Tag tone={fighter.isVerifiedPro ? "red" : "default"}>{statusLabel(fighter)}</Tag>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-zinc-400">{fighter.gym || "Müstəqil"}</td>
                    <td className="px-4 py-3 font-mono font-bold text-white">{fighter.points}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{formatDate(fighter.createdAt)}</td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <div className="flex gap-2">
                          <button
                            disabled={busyId === fighter.id || fighter.isVerifiedPro}
                            onClick={() => changeRole(fighter.id, "PRO")}
                            className="rounded-lg border border-white/12 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-30"
                          >
                            Pro et
                          </button>
                          <button
                            disabled={busyId === fighter.id || !fighter.isVerifiedPro}
                            onClick={() => changeRole(fighter.id, "AMATEUR")}
                            className="rounded-lg border border-white/12 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-white/10 disabled:opacity-30"
                          >
                            Həvəskar et
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600">Yalnız admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={pagination.page} limit={pagination.limit} total={pagination.total} onPage={setPage} />
        </div>
      )}
    </>
  );
}

function VerificationsSection({ openProfile }) {
  const [requests, setRequests] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    verificationApi
      .pending()
      .then((result) => setRequests(result || []))
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const review = async (id, decision) => {
    setBusyId(id);
    setError("");
    try {
      if (decision === "approve") await verificationApi.approve(id, note);
      else await verificationApi.reject(id, note || "Kifayət qədər təsdiqlənmiş sənəd yoxdur.");
      setNote("");
      load();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <SectionHead
        title="Pro təsdiqləri"
        subtitle="Döyüşçülərin peşəkar status müraciətlərini yoxla."
        right={
          <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
            <RefreshCw size={15} /> Yenilə
          </button>
        }
      />

      <div className={`${panel} mb-4 p-4`}>
        <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">Yoxlama qeydi (istəyə bağlı)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Qərarın səbəbi" className={`${inputClass} mt-2`} />
      </div>

      {error && <div className="mb-4"><ErrorBox message={error} onRetry={load} /></div>}
      {loading && <Loading label="Müraciətlər yüklənir" />}
      {!loading && !error && requests.length === 0 && <Empty title="Gözləyən müraciət yoxdur" subtitle="Yeni Pro müraciətləri burada görünəcək." />}

      <div className="grid gap-3">
        {requests.map((request) => (
          <div key={request.id} className={`${panel} grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center`}>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10">
                <Avatar name={request.fighter?.fullName} photoUrl={request.fighter?.profilePhotoUrl} />
              </div>
              <div className="min-w-0">
                <button onClick={() => request.fighterId && openProfile(request.fighterId)} className="block truncate font-display text-lg font-bold uppercase text-white transition hover:text-red-100">
                  {request.fighter?.fullName || "Döyüşçü"}
                </button>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {request.federation?.name} · {formatDate(request.createdAt)}
                </div>
                {request.documentUrl && (
                  <a href={request.documentUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-blood transition hover:text-white">
                    Sənədi aç <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                disabled={busyId === request.id}
                onClick={() => review(request.id, "approve")}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                Təsdiqlə
              </button>
              <button
                disabled={busyId === request.id}
                onClick={() => review(request.id, "reject")}
                className="rounded-lg bg-blood px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                Rədd et
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function FightsSection({ user, openProfile }) {
  const isAdmin = user?.role === "ADMIN";
  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    adminApi
      .fights({ ...(tab === "pending" ? { isVerified: "false" } : {}), page, limit: 20 })
      .then((result) => {
        setRows(result.data || []);
        setPagination(result.pagination || { page, limit: 20, total: (result.data || []).length });
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [tab, page]);

  useEffect(load, [load]);

  const act = async (fn, id) => {
    setBusyId(id);
    setError("");
    try {
      await fn(id);
      load();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <>
      <SectionHead
        title="Döyüş qeydləri"
        subtitle="Döyüşçülərin göndərdiyi rekordları təsdiqlə və ya sil."
        right={
          <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-white/12 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10">
            <RefreshCw size={15} /> Yenilə
          </button>
        }
      />

      <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-[#15161b] p-1">
        {[["pending", "Təsdiq gözləyən"], ["all", "Hamısı"]].map(([value, label]) => (
          <button
            key={value}
            onClick={() => { setTab(value); setPage(1); }}
            className={`rounded-md px-4 py-2 text-sm font-bold transition ${tab === value ? "bg-blood text-white" : "text-zinc-400 hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4"><ErrorBox message={error} onRetry={load} /></div>}
      {loading && <Loading label="Döyüşlər yüklənir" />}
      {!loading && !error && rows.length === 0 && (
        <Empty title={tab === "pending" ? "Təsdiq gözləyən döyüş yoxdur" : "Döyüş qeydi yoxdur"} subtitle="Yeni göndərilən rekordlar burada görünəcək." />
      )}

      {!loading && rows.length > 0 && (
        <div className={`${panel} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left text-sm">
              <thead className="bg-black/40 text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                <tr>
                  {["Döyüşçü", "Rəqib", "Tədbir", "Tarix", "Nəticə", "Üsul", "Status", "Əməliyyat"].map((head) => (
                    <th key={head} className="px-4 py-3 font-bold">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {rows.map((fight) => (
                  <tr key={fight.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3"><FighterCell fighter={fight.fighter} onOpen={openProfile} /></td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-white">{fight.opponentName}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-zinc-400">{fight.eventName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-400">{formatDate(fight.fightDate)}</td>
                    <td className="px-4 py-3">
                      <Tag tone={fight.result === "WIN" ? "emerald" : fight.result === "LOSS" ? "red" : "default"}>{formatFightResult(fight.result)}</Tag>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{formatFightMethod(fight.method)}</td>
                    <td className="px-4 py-3">
                      {fight.isVerified ? <Tag tone="emerald">Təsdiqli</Tag> : <Tag tone="gold">Gözləyir</Tag>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!fight.isVerified && (
                          <button
                            disabled={busyId === fight.id}
                            onClick={() => act(fightApi.verify, fight.id)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-50"
                          >
                            Təsdiqlə
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            disabled={busyId === fight.id}
                            onClick={() => act(adminApi.deleteFight, fight.id)}
                            title="Döyüş qeydini sil"
                            className="inline-flex items-center gap-1 rounded-lg border border-white/12 px-3 py-1.5 text-xs font-bold text-white transition hover:border-blood/50 hover:bg-blood/10 disabled:opacity-50"
                          >
                            <Trash2 size={13} /> Sil
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={pagination.page} limit={pagination.limit} total={pagination.total} onPage={setPage} />
        </div>
      )}
    </>
  );
}

/* --------------------------------- shell ---------------------------------- */

function Gate({ icon: Icon, title, message, action }) {
  return (
    <div className="grid min-h-screen place-items-center bg-[#0b0c10] px-4">
      <div className={`${panel} w-full max-w-md p-8 text-center`}>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-xl border border-blood/30 bg-blood/10 text-blood">
          <Icon size={24} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold uppercase text-white">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{message}</p>
        {action}
      </div>
    </div>
  );
}

export default function AdminPanel({ user, onLoginClick, onLogout }) {
  const navigate = useNavigate();
  const canReview = REVIEW_ROLES.includes(user?.role);
  const openProfile = (fighterId) => navigate(`/fighters/${fighterId}`);

  if (!user) {
    return (
      <Gate
        icon={ShieldAlert}
        title="Giriş tələb olunur"
        message="Bu panel yalnız admin və federasiya nümayəndələri üçündür."
        action={
          <div className="mt-6 grid gap-2">
            <button onClick={onLoginClick} className="rounded-lg bg-blood px-5 py-3 font-bold text-white shadow-red">Giriş et</button>
            <button onClick={() => navigate("/")} className="rounded-lg border border-white/12 px-5 py-3 font-bold text-white transition hover:bg-white/10">Sayta qayıt</button>
          </div>
        }
      />
    );
  }

  if (!canReview) {
    return (
      <Gate
        icon={ShieldAlert}
        title="Giriş məhduddur"
        message="Hesabının bu paneli açmaq üçün icazəsi yoxdur. Yalnız ADMIN və FEDERATION_REP rolları daxil ola bilər."
        action={
          <button onClick={() => navigate("/")} className="mt-6 w-full rounded-lg border border-white/12 px-5 py-3 font-bold text-white transition hover:bg-white/10">
            Sayta qayıt
          </button>
        }
      />
    );
  }

  const links = [
    { to: "/admin", end: true, label: "İcmal", icon: LayoutDashboard },
    { to: "/admin/fighters", label: "Döyüşçülər", icon: Users },
    { to: "/admin/verifications", label: "Pro təsdiqləri", icon: BadgeCheck },
    { to: "/admin/fights", label: "Döyüş qeydləri", icon: Swords },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
      isActive ? "bg-blood text-white shadow-red" : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#0b0c10] lg:grid lg:grid-cols-[248px_1fr]">
      {/* Sidebar */}
      <aside className="border-b border-white/10 bg-[#0e0f13] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-blood font-display text-sm font-bold text-white">FB</span>
          <div>
            <div className="font-display text-base font-bold uppercase leading-none text-white">Admin panel</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">FightBase</div>
          </div>
        </div>

        <nav className="grid gap-1 p-3">
          {links.map(({ to, end, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3 lg:absolute lg:bottom-0 lg:w-[248px]">
          <div className="mb-2 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <div className="truncate text-sm font-bold text-white">{user.fighterProfile?.fullName || user.email}</div>
            <div className="mt-1"><Tag tone={user.role === "ADMIN" ? "red" : "gold"}>{user.role}</Tag></div>
          </div>
          <button onClick={() => navigate("/")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-zinc-400 transition hover:bg-white/[0.06] hover:text-white">
            <ArrowLeft size={15} /> Sayta qayıt
          </button>
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-zinc-400 transition hover:bg-white/[0.06] hover:text-white">
            <LogOut size={15} /> Çıxış
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 p-5 sm:p-8">
        <Routes>
          <Route index element={<Dashboard openProfile={openProfile} />} />
          <Route path="fighters" element={<FightersSection user={user} openProfile={openProfile} />} />
          <Route path="verifications" element={<VerificationsSection openProfile={openProfile} />} />
          <Route path="fights" element={<FightsSection user={user} openProfile={openProfile} />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
