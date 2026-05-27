import { Router } from "express";
import {
  acceptChallenge,
  cancelChallenge,
  confirmChallengeResult,
  counterChallenge,
  declineChallenge,
  myChallenges,
  sendChallenge,
  submitChallengeResult,
} from "../controllers/challengeController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { validate } from "../middleware/validate.js";
import { challengeCounterSchema, challengeCreateSchema, challengeResultSchema } from "../validators/challengeSchemas.js";

const router = Router();

router.use(authenticateJWT);
router.post("/", validate(challengeCreateSchema), sendChallenge);
router.get("/mine", myChallenges);
router.put("/:id/accept", acceptChallenge);
router.put("/:id/decline", declineChallenge);
router.put("/:id/counter", validate(challengeCounterSchema), counterChallenge);
router.put("/:id/cancel", cancelChallenge);
router.post("/:id/result", validate(challengeResultSchema), submitChallengeResult);
router.put("/:id/confirm-result", confirmChallengeResult);

export default router;
