import { Router } from "express";
import { createFight, deleteFight, fightsForFighter, updateFightHighlight, verifyFight } from "../controllers/fightController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { validate } from "../middleware/validate.js";
import { fightCreateSchema, fightHighlightSchema } from "../validators/fightSchemas.js";

const router = Router();

router.post("/", authenticateJWT, validate(fightCreateSchema), createFight);
router.get("/fighter/:fighterId", fightsForFighter);
router.put("/:id/verify", authenticateJWT, authorizeRole("ADMIN", "FEDERATION_REP"), verifyFight);
router.put("/:id/highlight", authenticateJWT, validate(fightHighlightSchema), updateFightHighlight);
router.delete("/:id", authenticateJWT, deleteFight);

export default router;
