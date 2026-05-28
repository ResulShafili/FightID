import { Router } from "express";
import {
  addCornerMan,
  collectCard,
  cornerCount,
  createFightSeek,
  createGym,
  createTournament,
  deleteTraining,
  getCardForFighter,
  getGym,
  getTournament,
  gymLeaderboard,
  joinGym,
  leaveGym,
  listBadges,
  listFightSeeks,
  listGyms,
  listTournaments,
  logTraining,
  micCheckFeed,
  micChecksForChallenge,
  myCardCollection,
  myCornerFighters,
  nationalByCountry,
  nationalLeaderboard,
  postMicCheck,
  reactToMicCheck,
  removeCornerMan,
  removeFightSeek,
  setTournamentWinner,
  trainingForFighter,
  uncollectCard,
  unreactToMicCheck,
  updateGym,
  uploadGymLogo,
  isNationalChampion,
} from "../controllers/featureController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import {
  fightSeekCreateSchema,
  fightSeekQuerySchema,
  gymCreateSchema,
  gymListQuerySchema,
  gymUpdateSchema,
  micCheckPostSchema,
  micCheckReactionSchema,
  tournamentCreateSchema,
  tournamentListQuerySchema,
  tournamentWinnerSchema,
  trainingLogSchema,
} from "../validators/featureSchemas.js";

export const cardRoutes = Router();
cardRoutes.get("/fighter/:fighterId", getCardForFighter);
cardRoutes.post("/:cardId/collect", authenticateJWT, collectCard);
cardRoutes.delete("/:cardId/collect", authenticateJWT, uncollectCard);
cardRoutes.get("/my-collection", authenticateJWT, myCardCollection);

export const cornerManRoutes = Router();
cornerManRoutes.post("/:fighterId", authenticateJWT, addCornerMan);
cornerManRoutes.delete("/:fighterId", authenticateJWT, removeCornerMan);
cornerManRoutes.get("/:fighterId/count", cornerCount);
cornerManRoutes.get("/my-fighters", authenticateJWT, myCornerFighters);

export const fightSeekRoutes = Router();
fightSeekRoutes.post("/", authenticateJWT, validate(fightSeekCreateSchema), createFightSeek);
fightSeekRoutes.get("/", validate(fightSeekQuerySchema, "query"), listFightSeeks);
fightSeekRoutes.delete("/:id", authenticateJWT, removeFightSeek);

export const trainingRoutes = Router();
trainingRoutes.post("/", authenticateJWT, validate(trainingLogSchema), logTraining);
trainingRoutes.get("/fighter/:fighterId", trainingForFighter);
trainingRoutes.delete("/:id", authenticateJWT, deleteTraining);

export const badgeRoutes = Router();
badgeRoutes.get("/fighter/:fighterId", listBadges);

export const leaderboardRoutes = Router();
leaderboardRoutes.get("/national", nationalLeaderboard);
leaderboardRoutes.get("/national/:country", nationalByCountry);

export const gymRoutes = Router();
gymRoutes.get("/leaderboard", gymLeaderboard);
gymRoutes.post("/", authenticateJWT, validate(gymCreateSchema), createGym);
gymRoutes.get("/", validate(gymListQuerySchema, "query"), listGyms);
gymRoutes.get("/:id", getGym);
gymRoutes.put("/:id", authenticateJWT, validate(gymUpdateSchema), updateGym);
gymRoutes.post("/:id/logo", authenticateJWT, upload.single("logo"), uploadGymLogo);
gymRoutes.post("/:id/join", authenticateJWT, joinGym);
gymRoutes.delete("/:id/join", authenticateJWT, leaveGym);

export const micCheckRoutes = Router();
micCheckRoutes.post("/", authenticateJWT, validate(micCheckPostSchema), postMicCheck);
micCheckRoutes.get("/feed", micCheckFeed);
micCheckRoutes.get("/challenge/:challengeId", micChecksForChallenge);
micCheckRoutes.post("/:id/react", authenticateJWT, validate(micCheckReactionSchema), reactToMicCheck);
micCheckRoutes.delete("/:id/react", authenticateJWT, unreactToMicCheck);

export const tournamentRoutes = Router();
tournamentRoutes.post("/", authenticateJWT, authorizeRole("ADMIN", "FEDERATION_REP"), validate(tournamentCreateSchema), createTournament);
tournamentRoutes.get("/", validate(tournamentListQuerySchema, "query"), listTournaments);
tournamentRoutes.get("/:id", getTournament);
tournamentRoutes.put("/:id/matches/:matchId/winner", authenticateJWT, authorizeRole("ADMIN", "FEDERATION_REP"), validate(tournamentWinnerSchema), setTournamentWinner);

export { isNationalChampion };
