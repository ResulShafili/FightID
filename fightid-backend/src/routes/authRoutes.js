import { Router } from "express";
import { login, logout, me, refresh, register, verifyEmailCode } from "../controllers/authController.js";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema, verifyEmailCodeSchema } from "../validators/authSchemas.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/verify-email-code", validate(verifyEmailCodeSchema), verifyEmailCode);
router.get("/me", authenticateJWT, me);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
