import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "../validators/authSchemas.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(logoutSchema), logout);

export default router;
