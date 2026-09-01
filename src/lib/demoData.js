/**
 * Demo dataset used as a read-only fallback when the backend is unreachable.
 *
 * It mirrors the shapes produced by fightid-backend (see prisma/seed.js and the
 * controllers) so every public page renders exactly as it would against a live
 * API. Only public GET endpoints are covered: auth and any mutation still hit
 * the real backend and fail honestly when it is down.
 */

const FEDERATION = { id: "demo-fed-1", name: "Azərbaycan MMA Federasiyası", country: "AZ" };

const GYM_SEEDS = [
  { id: "demo-gym-1", name: "Bakı Combat Club", city: "Bakı", country: "AZ", description: "Bakının elit MMA zalı: pro və həvəskar döyüşçülər üçün tam hazırlıq bazası." },
  { id: "demo-gym-2", name: "Xəzər MMA", city: "Bakı", country: "AZ", description: "Xəzər bölgəsinin qreplinq və zərbə texnikası üzrə ixtisaslaşmış komandası." },
  { id: "demo-gym-3", name: "Neftçi Fight Team", city: "Bakı", country: "AZ", description: "Yüksək tempdə çalışan, gənc döyüşçü yetişdirən döyüş düşərgəsi." },
];

// [fullName, nickname, weightClass, gymIndex, isVerifiedPro, points, country]
const FIGHTER_SEEDS = [
  ["Rəşad Məmmədov", "Qartal", "LIGHTWEIGHT", 0, true, 1420, "AZ"],
  ["Tural Həsənov", "Xəzər", "WELTERWEIGHT", 1, true, 1360, "AZ"],
  ["Elnur Quliyev", "Şimşək", "MIDDLEWEIGHT", 2, false, 980, "AZ"],
  ["Kamran Əliyev", "Daş Yumruq", "LIGHTWEIGHT", 0, true, 1285, "AZ"],
  ["Nicat Hüseynov", "Aslan", "WELTERWEIGHT", 1, false, 910, "AZ"],
  ["Müşfiq Babayev", "Səssiz", "MIDDLEWEIGHT", 2, true, 1510, "AZ"],
  ["Tərlan İsmayılov", "Qara Kəmər", "LIGHTWEIGHT", 0, false, 870, "AZ"],
  ["Orxan Nəcəfov", "Kaspi", "WELTERWEIGHT", 1, true, 1335, "AZ"],
  ["Bəhruz Əhmədov", "Polad", "MIDDLEWEIGHT", 2, false, 760, "AZ"],
  ["Fərid Rzayev", "Alov", "LIGHTWEIGHT", 0, true, 1395, "AZ"],
];

// [fighterIndex, opponentIndex, event, date, result, method, round, time, isVerified]
const FIGHT_SEEDS = [
  [0, 3, "Baku Grand Prix 2024", "2024-03-16", "WIN", "DECISION", 3, "5:00", true],
  [0, 6, "Caspian Cage Night 12", "2024-06-22", "WIN", "KO_TKO", 2, "3:18", true],
  [0, 9, "Azerbaijan Fight Series", "2025-02-08", "LOSS", "SUBMISSION", 2, "4:02", true],
  [1, 4, "Baku Warriors 9", "2024-02-10", "WIN", "KO_TKO", 1, "2:41", true],
  [1, 7, "Caspian Combat League 18", "2024-09-14", "DRAW", "DECISION", 3, "5:00", true],
  [1, 4, "FightBase Showcase Baku", "2025-04-19", "WIN", "DECISION", 3, "5:00", true],
  [2, 5, "Neftçi Fight Open", "2024-01-28", "LOSS", "DECISION", 3, "5:00", true],
  [2, 8, "Baku Amateur Cup", "2024-05-25", "WIN", "SUBMISSION", 2, "3:55", true],
  [3, 6, "Baku Combat Night", "2023-11-11", "WIN", "SUBMISSION", 1, "4:44", true],
  [3, 9, "Caspian Cage Night 15", "2024-10-05", "LOSS", "DECISION", 3, "5:00", true],
  [4, 7, "Xəzər MMA Open", "2024-04-13", "LOSS", "KO_TKO", 2, "1:59", true],
  [4, 1, "FightBase Showcase Baku", "2025-04-19", "LOSS", "DECISION", 3, "5:00", true],
  [5, 8, "Neftçi Fight League", "2024-07-20", "WIN", "KO_TKO", 2, "2:26", true],
  [5, 2, "Caspian Trials", "2025-01-18", "WIN", "KO_TKO", 1, "4:12", true],
  [6, 0, "Caspian Cage Night 12", "2024-06-22", "LOSS", "KO_TKO", 2, "3:18", true],
  [6, 3, "Baku Combat Night", "2023-11-11", "LOSS", "SUBMISSION", 1, "4:44", true],
  [7, 1, "Caspian Combat League 18", "2024-09-14", "DRAW", "DECISION", 3, "5:00", true],
  [8, 2, "Baku Amateur Cup", "2024-05-25", "LOSS", "SUBMISSION", 2, "3:55", true],
  [9, 0, "Azerbaijan Fight Series", "2025-02-08", "WIN", "SUBMISSION", 2, "4:02", true],
];

const BADGE_SEEDS = {
  0: ["FIRST_WIN", "FIRST_KO", "POINTS_1000", "PLATFORM_PIONEER"],
  1: ["FIRST_WIN", "FIRST_KO", "POINTS_1000", "PLATFORM_PIONEER"],
  2: ["FIRST_WIN", "FIRST_SUBMISSION", "PLATFORM_PIONEER"],
  3: ["FIRST_WIN", "FIRST_SUBMISSION", "POINTS_1000"],
  5: ["FIRST_WIN", "FIRST_KO", "KO_SPECIALIST", "POINTS_1000", "UNDEFEATED"],
  9: ["FIRST_WIN", "FIRST_SUBMISSION", "POINTS_1000"],
};

const gyms = GYM_SEEDS.map((gym) => ({ ...gym, logoUrl: null, websiteUrl: null, createdAt: "2024-01-05T00:00:00.000Z" }));

const fighters = FIGHTER_SEEDS.map(([fullName, nickname, weightClass, gymIndex, isVerifiedPro, points, country], index) => ({
  id: `demo-fighter-${index + 1}`,
  userId: `demo-user-${index + 1}`,
  fullName,
  nickname,
  country,
  weightClass,
  gym: gyms[gymIndex].name,
  gymId: gyms[gymIndex].id,
  bio: `${nickname} ləqəbli ${fullName}, ${gyms[gymIndex].name} komandasının ${isVerifiedPro ? "peşəkar" : "həvəskar"} döyüşçüsüdür.`,
  profilePhotoUrl: null,
  coverPhotoUrl: null,
  instagramUrl: index % 3 === 0 ? "https://instagram.com/fightbase" : null,
  youtubeUrl: index % 4 === 0 ? "https://youtube.com/@fightbase" : null,
  isVerifiedPro,
  verifiedByFederation: isVerifiedPro ? FEDERATION : null,
  points,
  seekingSparring: index === 0 || index === 5,
  user: { role: isVerifiedPro ? "PRO" : "AMATEUR" },
}));

const fights = FIGHT_SEEDS.map(([fighterIndex, opponentIndex, eventName, fightDate, result, method, round, fightTime, isVerified], index) => ({
  id: `demo-fight-${index + 1}`,
  fighterId: fighters[fighterIndex].id,
  opponentProfileId: fighters[opponentIndex].id,
  opponentName: fighters[opponentIndex].fullName,
  eventName,
  fightDate: `${fightDate}T00:00:00.000Z`,
  result,
  method,
  round,
  fightTime,
  isVerified,
}));

function statsFor(fighterId) {
  const own = fights.filter((fight) => fight.fighterId === fighterId && fight.isVerified);
  const record = { wins: 0, losses: 0, draws: 0 };
  const methods = { KO_TKO: 0, SUBMISSION: 0, DECISION: 0, DQ: 0, OTHER: 0 };
  own.forEach((fight) => {
    if (fight.result === "WIN") {
      record.wins += 1;
      methods[fight.method] = (methods[fight.method] || 0) + 1;
    } else if (fight.result === "LOSS") record.losses += 1;
    else if (fight.result === "DRAW") record.draws += 1;
  });
  return { record, methods, totalFights: own.length };
}

// A fighter as returned by GET /fighters/:id — includes history and stats.
function fullFighter(fighter) {
  return {
    ...fighter,
    stats: statsFor(fighter.id),
    fights: fights
      .filter((fight) => fight.fighterId === fighter.id)
      .sort((a, b) => new Date(b.fightDate) - new Date(a.fightDate)),
  };
}

const fightersWithStats = fighters.map(fullFighter);

const tournament = {
  id: "demo-tournament-1",
  name: "Bakı Yüngül Çəki Qran Prisi",
  weightClass: "LIGHTWEIGHT",
  ruleSet: "MMA",
  status: "ACTIVE",
  size: 4,
  matches: [
    { id: "demo-match-1", round: 1, matchNumber: 1, fighter1Id: fighters[0].id, fighter2Id: fighters[3].id, winnerId: fighters[0].id, fighter1: fighters[0], fighter2: fighters[3], winner: fighters[0] },
    { id: "demo-match-2", round: 1, matchNumber: 2, fighter1Id: fighters[9].id, fighter2Id: fighters[6].id, winnerId: fighters[9].id, fighter1: fighters[9], fighter2: fighters[6], winner: fighters[9] },
    { id: "demo-match-3", round: 2, matchNumber: 1, fighter1Id: fighters[0].id, fighter2Id: fighters[9].id, winnerId: null, fighter1: fighters[0], fighter2: fighters[9], winner: null },
  ],
};

const fightSeeks = [
  { id: "demo-seek-1", fighter: fighters[0], fighterId: fighters[0].id, weightClass: "LIGHTWEIGHT", ruleSet: "MMA", location: "Bakı", dateFrom: "2026-06-01T00:00:00.000Z", dateTo: "2026-06-30T00:00:00.000Z", message: "Reytinqli yüngül çəki rəqibi axtarıram. Üç raund, pro qaydalar.", isActive: true },
  { id: "demo-seek-2", fighter: fighters[5], fighterId: fighters[5].id, weightClass: "MIDDLEWEIGHT", ruleSet: "GRAPPLING", location: "Bakı", dateFrom: "2026-07-01T00:00:00.000Z", dateTo: "2026-07-15T00:00:00.000Z", message: "Yalnız sabmişn qaydaları ilə super döyüş təklif edirəm.", isActive: true },
];

function gymWithTotals(gym) {
  const roster = fightersWithStats.filter((fighter) => fighter.gymId === gym.id);
  const totalPoints = roster.reduce((sum, fighter) => sum + fighter.points, 0);
  return {
    ...gym,
    fighters: roster,
    fighterCount: roster.length,
    proFighters: roster.filter((fighter) => fighter.isVerifiedPro).length,
    totalPoints,
    averagePoints: roster.length ? Math.round(totalPoints / roster.length) : 0,
  };
}

function rank(list) {
  return [...list]
    .sort((a, b) => b.points - a.points)
    .map((fighter, index) => ({ ...fighter, rank: index + 1 }));
}

function statusOf(fighter) {
  return fighter.isVerifiedPro ? "PRO" : "AMATEUR";
}

function filterFighters(params) {
  const search = (params.get("search") || "").trim().toLowerCase();
  const weightClass = params.get("weightClass");
  const country = params.get("country");
  const role = params.get("role");

  return fightersWithStats.filter((fighter) => {
    if (weightClass && fighter.weightClass !== weightClass) return false;
    if (country && fighter.country !== country.toUpperCase()) return false;
    if (role && statusOf(fighter) !== role) return false;
    if (search) {
      const haystack = `${fighter.fullName} ${fighter.nickname || ""} ${fighter.gym || ""}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

const nationalBoard = () => {
  const board = {};
  [...new Set(fighters.map((fighter) => fighter.weightClass))].forEach((weightClass) => {
    const byCountry = new Map();
    rank(fightersWithStats.filter((fighter) => fighter.weightClass === weightClass)).forEach((fighter) => {
      if (!byCountry.has(fighter.country)) byCountry.set(fighter.country, fighter);
    });
    board[weightClass] = [...byCountry.entries()].map(([country, fighter]) => ({ country, fighter }));
  });
  return board;
};

const championIds = new Set(
  Object.values(nationalBoard())
    .flat()
    .map((entry) => entry.fighter.id),
);

/**
 * Maps an API path to demo data. Returns undefined when the path has no demo
 * equivalent, so the caller can surface the real backend failure instead.
 */
export function resolveDemoResponse(path, method = "GET") {
  if (method.toUpperCase() !== "GET") return undefined;

  const [rawPath, rawQuery = ""] = path.split("?");
  const segments = rawPath.split("/").filter(Boolean);
  const params = new URLSearchParams(rawQuery);
  const limit = Number(params.get("limit")) || 50;

  if (segments[0] === "fighters") {
    if (segments.length === 1) {
      const matches = rank(filterFighters(params));
      return { data: matches.slice(0, limit), pagination: { page: 1, limit, total: matches.length } };
    }
    if (segments[1] === "leaderboard") {
      const matches = rank(filterFighters(params));
      return { data: matches.slice(0, limit), pagination: { page: 1, limit, total: matches.length } };
    }
    const fighter = fightersWithStats.find((item) => item.id === segments[1]);
    if (!fighter) return undefined;
    if (segments[2] === "isNationalChampion") return { isChampion: championIds.has(fighter.id) };
    if (segments[2] === "rivals") {
      return rank(fightersWithStats.filter((item) => item.weightClass === fighter.weightClass && item.id !== fighter.id)).slice(0, 5);
    }
    if (segments.length === 2) {
      const weightBoard = rank(fightersWithStats.filter((item) => item.weightClass === fighter.weightClass));
      return { ...fighter, rank: weightBoard.find((item) => item.id === fighter.id)?.rank };
    }
    return undefined;
  }

  if (segments[0] === "gyms") {
    if (segments.length === 1) {
      const data = gyms.map(gymWithTotals);
      return { data, pagination: { page: 1, limit, total: data.length } };
    }
    if (segments[1] === "leaderboard") {
      return gyms.map(gymWithTotals).sort((a, b) => b.totalPoints - a.totalPoints);
    }
    const gym = gyms.find((item) => item.id === segments[1]);
    return gym ? gymWithTotals(gym) : undefined;
  }

  if (segments[0] === "tournaments") {
    if (segments.length === 1) return { data: [tournament], pagination: { page: 1, limit, total: 1 } };
    return segments[1] === tournament.id ? tournament : undefined;
  }

  if (segments[0] === "leaderboard" && segments[1] === "national") {
    if (segments[2]) {
      const country = segments[2].toUpperCase();
      const board = nationalBoard();
      return Object.entries(board).flatMap(([weightClass, rows]) =>
        rows.filter((row) => row.country === country).map((row) => ({ weightClass, ...row })),
      );
    }
    return nationalBoard();
  }

  if (segments[0] === "badges" && segments[1] === "fighter") {
    const index = fighters.findIndex((item) => item.id === segments[2]);
    if (index === -1) return undefined;
    return (BADGE_SEEDS[index] || []).map((type, order) => ({
      id: `demo-badge-${index}-${order}`,
      type,
      earnedAt: `2025-0${(order % 8) + 1}-12T00:00:00.000Z`,
    }));
  }

  if (segments[0] === "fightseek") {
    return { data: fightSeeks, pagination: { page: 1, limit, total: fightSeeks.length } };
  }

  return undefined;
}
