import { Router } from "express";
import { applyForPro, approveRequest, pendingRequests, rejectRequest } from "../controllers/verificationController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { verificationApplySchema, verificationRejectSchema } from "../validators/verificationSchemas.js";

const router = Router();

router.post("/apply", authenticateJWT, upload.single("document"), validate(verificationApplySchema), applyForPro);
router.get("/pending", authenticateJWT, authorizeRole("FEDERATION_REP", "ADMIN"), pendingRequests);
router.put("/:id/approve", authenticateJWT, authorizeRole("FEDERATION_REP", "ADMIN"), approveRequest);
router.put("/:id/reject", authenticateJWT, authorizeRole("FEDERATION_REP", "ADMIN"), validate(verificationRejectSchema), rejectRequest);

export default router;
