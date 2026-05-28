import { Router } from "express";
import { adminDeleteFight, adminFighters, platformStats, updateFighterRole } from "../controllers/adminController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { validate } from "../middleware/validate.js";
import { adminFightersQuerySchema, adminRoleUpdateSchema } from "../validators/adminSchemas.js";

const router = Router();

router.use(authenticateJWT);
router.get("/stats", authorizeRole("ADMIN", "FEDERATION_REP"), platformStats);
router.get("/fighters", authorizeRole("ADMIN", "FEDERATION_REP"), validate(adminFightersQuerySchema, "query"), adminFighters);
router.put("/fighters/:id/role", authorizeRole("ADMIN"), validate(adminRoleUpdateSchema), updateFighterRole);
router.delete("/fights/:id", authorizeRole("ADMIN"), adminDeleteFight);

export default router;
