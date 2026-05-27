import { Router } from "express";
import { createFight, deleteFight, fightsForFighter, verifyFight } from "../controllers/fightController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { validate } from "../middleware/validate.js";
import { fightCreateSchema } from "../validators/fightSchemas.js";

const router = Router();

router.post("/", authenticateJWT, validate(fightCreateSchema), createFight);
router.get("/fighter/:fighterId", fightsForFighter);
router.put("/:id/verify", authenticateJWT, authorizeRole("ADMIN", "FEDERATION_REP"), verifyFight);
router.delete("/:id", authenticateJWT, deleteFight);

export default router;
