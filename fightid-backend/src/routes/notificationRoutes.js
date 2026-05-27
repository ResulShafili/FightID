import { Router } from "express";
import { listNotifications, markAllRead, markRead } from "../controllers/notificationController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";

const router = Router();

router.use(authenticateJWT);
router.get("/", listNotifications);
router.put("/read-all", markAllRead);
router.put("/:id/read", markRead);

export default router;
