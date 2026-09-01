/**
 * Demo dataset used as a read-only fallback when the backend is unreachable.
 *
 * It mirrors the shapes produced by fightid-backend (see prisma/seed.js and the
 * controllers) so every public page renders exactly as it would against a live
 * API. Only public GET endpoints are covered: auth and any mutation still hit
 * the real backend and fail honestly when it is down.
 *
 * Every name here is deliberately generic ("Test Döyüşçü 1") so sample records
 * can never be mistaken for a real person, gym or event.
 */

const FEDERATION = { id: "demo-fed-1", name: "Test Federasiya", country: "AZ" };

const GYM_SEEDS = [
  { id: "demo-gym-1", name: "Test Zal 1", city: "Test Şəhər", country: "AZ", description: "Nümunə məlumat: pro və həvəskar döyüşçülər üçün tam hazırlıq bazası." },
  { id: "demo-gym-2", name: "Test Zal 2", city: "Test Şəhər", country: "AZ", description: "Nümunə məlumat: qreplinq və zərbə texnikası üzrə ixtisaslaşmış komanda." },
  { id: "demo-gym-3", name: "Test Zal 3", city: "Test Şəhər", country: "AZ", description: "Nümunə məlumat: gənc döyüşçü yetişdirən döyüş düşərgəsi." },
];

// [weightClass, gymIndex, isVerifiedPro, points, startedTrainingYear, hasNickname]
const FIGHTER_SEEDS = [
  ["LIGHTWEIGHT", 0, true, 1420, 2012, true],
  ["WELTERWEIGHT", 1, true, 1360, 2013, true],
  ["MIDDLEWEIGHT", 2, false, 980, 2018, false],
  ["LIGHTWEIGHT", 0, true, 1285, 2014, true],
  ["WELTERWEIGHT", 1, false, 910, 2019, false],
  ["MIDDLEWEIGHT", 2, true, 1510, 2010, true],
  ["LIGHTWEIGHT", 0, false, 870, 2020, false],
  ["WELTERWEIGHT", 1, true, 1335, 2011, true],
  ["MIDDLEWEIGHT", 2, false, 760, 2021, false],
  ["LIGHTWEIGHT", 0, true, 1395, 2015, true],
];

// [fighterIndex, opponentIndex, event, date, result, method, round, time, isVerified]
const FIGHT_SEEDS = [
  [0, 3, "Test Tədbir 1", "2024-03-16", "WIN", "DECISION", 3, "5:00", true],
  [0, 6, "Test Tədbir 2", "2024-06-22", "WIN", "KO_TKO", 2, "3:18", true],
  [0, 9, "Test Tədbir 3", "2025-02-08", "LOSS", "SUBMISSION", 2, "4:02", true],
  [1, 4, "Test Tədbir 4", "2024-02-10", "WIN", "KO_TKO", 1, "2:41", true],
  [1, 7, "Test Tədbir 5", "2024-09-14", "DRAW", "DECISION", 3, "5:00", true],
  [1, 4, "Test Tədbir 6", "2025-04-19", "WIN", "DECISION", 3, "5:00", true],
  [2, 5, "Test Tədbir 7", "2024-01-28", "LOSS", "DECISION", 3, "5:00", true],
  [2, 8, "Test Tədbir 8", "2024-05-25", "WIN", "SUBMISSION", 2, "3:55", true],
  [3, 6, "Test Tədbir 9", "2023-11-11", "WIN", "SUBMISSION", 1, "4:44", true],
  [3, 9, "Test Tədbir 10", "2024-10-05", "LOSS", "DECISION", 3, "5:00", true],
  [4, 7, "Test Tədbir 11", "2024-04-13", "LOSS", "KO_TKO", 2, "1:59", true],
  [4, 1, "Test Tədbir 6", "2025-04-19", "LOSS", "DECISION", 3, "5:00", true],
  [5, 8, "Test Tədbir 12", "2024-07-20", "WIN", "KO_TKO", 2, "2:26", true],
  [5, 2, "Test Tədbir 13", "2025-01-18", "WIN", "KO_TKO", 1, "4:12", true],
  [6, 0, "Test Tədbir 2", "2024-06-22", "LOSS", "KO_TKO", 2, "3:18", true],
  [6, 3, "Test Tədbir 9", "2023-11-11", "LOSS", "SUBMISSION", 1, "4:44", true],
  [7, 1, "Test Tədbir 5", "2024-09-14", "DRAW", "DECISION", 3, "5:00", true],
  [8, 2, "Test Tədbir 8", "2024-05-25", "LOSS", "SUBMISSION", 2, "3:55", true],
  [9, 0, "Test Tədbir 3", "2025-02-08", "WIN", "SUBMISSION", 2, "4:02", true],
];

// [fighterIndex, opponentIndex, daysFromNow, event, ruleSet]
const UPCOMING_SEEDS = [
  [0, 9, 34, "Test Tədbir 14", "MMA"],
  [0, 3, 96, "Test Tədbir 15", "MMA"],
  [1, 7, 27, "Test Tədbir 16", "MMA"],
  [5, 2, 48, "Test Tədbir 17", "GRAPPLING"],
  [9, 0, 34, "Test Tədbir 14", "MMA"],
  [3, 0, 96, "Test Tədbir 15", "MMA"],
  [7, 1, 27, "Test Tədbir 16", "MMA"],
  [2, 5, 48, "Test Tədbir 17", "GRAPPLING"],
];

// [fighterIndex, type, durationMins, daysAgo, note]
const TRAINING_SEEDS = [
  [0, "SPARRING", 75, 1, "Beş texniki raund."],
  [0, "STRIKING", 90, 3, "Pad işi və qəfəsdən çıxış."],
  [0, "CONDITIONING", 45, 5, "İnterval qaçış və dairəvi məşq."],
  [0, "GRAPPLING", 80, 8, "Arxa nəzarət raundları."],
  [0, "DRILLING", 60, 12, "Aşağı təkan cəhdləri."],
  [0, "RECOVERY", 30, 15, "Hərəkətlilik və uzanma."],
  [1, "STRIKING", 85, 2, "Klinç zərbələri."],
  [1, "SPARRING", 70, 6, "Üç raund tam temp."],
  [1, "CONDITIONING", 50, 9, "Ağırlıq və partlayıcı güc."],
  [5, "GRAPPLING", 95, 2, "Sabmişn zəncirləri."],
  [5, "STRIKING", 60, 4, "Sayğac zərbələri."],
  [5, "SPARRING", 80, 7, "Ağır çəki partnyoru ilə."],
  [9, "DRILLING", 65, 3, "Ayaq üstə müdafiə."],
  [9, "CONDITIONING", 40, 6, "Sprint seriyaları."],
];

const BADGE_SEEDS = {
  0: ["FIRST_WIN", "FIRST_KO", "POINTS_1000", "PLATFORM_PIONEER"],
  1: ["FIRST_WIN", "FIRST_KO", "POINTS_1000", "PLATFORM_PIONEER"],
  2: ["FIRST_WIN", "FIRST_SUBMISSION", "PLATFORM_PIONEER"],
  3: ["FIRST_WIN", "FIRST_SUBMISSION", "POINTS_1000"],
  5: ["FIRST_WIN", "FIRST_KO", "KO_SPECIALIST", "POINTS_1000", "UNDEFEATED"],
  9: ["FIRST_WIN", "FIRST_SUBMISSION", "POINTS_1000"],
};

const dayMs = 24 * 60 * 60 * 1000;
const shiftDays = (days) => new Date(Date.now() + days * dayMs).toISOString();

const gyms = GYM_SEEDS.map((gym) => ({ ...gym, logoUrl: null, websiteUrl: null, createdAt: "2024-01-05T00:00:00.000Z" }));

const fighters = FIGHTER_SEEDS.map(([weightClass, gymIndex, isVerifiedPro, points, startedTrainingYear, hasNickname], index) => {
  const number = index + 1;
  return {
    id: `demo-fighter-${number}`,
    userId: `demo-user-${number}`,
    fullName: `Test Döyüşçü ${number}`,
    nickname: hasNickname ? `Test Ləqəb ${number}` : null,
    country: "AZ",
    weightClass,
    gym: gyms[gymIndex].name,
    gymId: gyms[gymIndex].id,
    bio: `Nümunə profil: ${gyms[gymIndex].name} komandasının ${isVerifiedPro ? "peşəkar" : "həvəskar"} döyüşçüsü. Bu məlumat yalnız nümayiş üçündür.`,
    profilePhotoUrl: null,
    coverPhotoUrl: null,
    instagramUrl: index % 3 === 0 ? "https://instagram.com/fightbase" : null,
    youtubeUrl: index % 4 === 0 ? "https://youtube.com/@fightbase" : null,
    startedTrainingYear,
    isVerifiedPro,
    verifiedByFederation: isVerifiedPro ? FEDERATION : null,
    points,
    seekingSparring: index === 0 || index === 5,
    user: { role: isVerifiedPro ? "PRO" : "AMATEUR" },
  };
});

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

const upcomingFights = UPCOMING_SEEDS.map(([fighterIndex, opponentIndex, daysFromNow, eventName, ruleSet], index) => ({
  id: `demo-upcoming-${index + 1}`,
  fighterId: fighters[fighterIndex].id,
  opponentId: fighters[opponentIndex].id,
  opponentName: fighters[opponentIndex].fullName,
  opponentPhotoUrl: fighters[opponentIndex].profilePhotoUrl,
  eventName,
  scheduledAt: shiftDays(daysFromNow),
  location: "Test Şəhər",
  weightClass: fighters[fighterIndex].weightClass,
  ruleSet,
}));

const trainingLogs = TRAINING_SEEDS.map(([fighterIndex, type, durationMins, daysAgo, note], index) => ({
  id: `demo-training-${index + 1}`,
  fighterId: fighters[fighterIndex].id,
  type,
  durationMins,
  note,
  date: shiftDays(-daysAgo),
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
    upcomingFights: upcomingFights
      .filter((fight) => fight.fighterId === fighter.id)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)),
  };
}

const fightersWithStats = fighters.map(fullFighter);

const tournament = {
  id: "demo-tournament-1",
  name: "Test Turnir 1",
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
  { id: "demo-seek-1", fighter: fighters[0], fighterId: fighters[0].id, weightClass: "LIGHTWEIGHT", ruleSet: "MMA", location: "Test Şəhər", dateFrom: shiftDays(30), dateTo: shiftDays(60), message: "Nümunə elan: reytinqli yüngül çəki rəqibi axtarıram.", isActive: true },
  { id: "demo-seek-2", fighter: fighters[5], fighterId: fighters[5].id, weightClass: "MIDDLEWEIGHT", ruleSet: "GRAPPLING", location: "Test Şəhər", dateFrom: shiftDays(45), dateTo: shiftDays(75), message: "Nümunə elan: yalnız sabmişn qaydaları ilə super döyüş.", isActive: true },
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

function trainingSummaryFor(fighterId) {
  const logs = trainingLogs
    .filter((log) => log.fighterId === fighterId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const month = logs.filter((log) => new Date(log.date) >= monthStart);
  const counts = month.reduce((acc, log) => ({ ...acc, [log.type]: (acc[log.type] || 0) + 1 }), {});

  return {
    data: logs,
    summary: {
      totalSessionsThisMonth: month.length,
      totalHoursThisMonth: month.reduce((sum, log) => sum + log.durationMins, 0) / 60,
      mostCommonType: Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
      counts,
    },
  };
}

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

  if (segments[0] === "training" && segments[1] === "fighter") {
    return fighters.some((item) => item.id === segments[2]) ? trainingSummaryFor(segments[2]) : undefined;
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
