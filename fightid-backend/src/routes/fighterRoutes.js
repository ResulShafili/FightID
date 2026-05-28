import { Router } from "express";
import { getFighter, leaderboard, listFighters, rivals, updateMe, uploadProfilePhoto } from "../controllers/fighterController.js";
import { isNationalChampion } from "../controllers/featureController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { fighterListQuerySchema, leaderboardQuerySchema, updateProfileSchema } from "../validators/fighterSchemas.js";

const router = Router();

router.get("/", validate(fighterListQuerySchema, "query"), listFighters);
router.get("/leaderboard", validate(leaderboardQuerySchema, "query"), leaderboard);
router.get("/:id/isNationalChampion", isNationalChampion);
router.get("/:id/rivals", rivals);
router.get("/:id", getFighter);
router.put("/me", authenticateJWT, validate(updateProfileSchema), updateMe);
router.post("/me/photo", authenticateJWT, upload.single("photo"), uploadProfilePhoto);

export default router;
