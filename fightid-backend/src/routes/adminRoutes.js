import { Router } from "express";
import { adminDeleteFight, adminFighters, platformStats, updateFighterRole } from "../controllers/adminController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { validate } from "../middleware/validate.js";
import { adminFightersQuerySchema, adminRoleUpdateSchema } from "../validators/adminSchemas.js";

const router = Router();

router.use(authenticateJWT, authorizeRole("ADMIN"));
router.get("/stats", platformStats);
router.get("/fighters", validate(adminFightersQuerySchema, "query"), adminFighters);
router.put("/fighters/:id/role", validate(adminRoleUpdateSchema), updateFighterRole);
router.delete("/fights/:id", adminDeleteFight);

export default router;
