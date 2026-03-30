import { Router } from "express";
import { AuthController } from "./auth.controller";
import { zodValidator } from "../../errorHelpers/zodValidator";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", zodValidator(registerSchema), AuthController.register);
router.post("/login", zodValidator(loginSchema), AuthController.login);

// later:
// router.post("/verify-email", AuthController.verifyEmail)
// router.post("/forgot-password", AuthController.forgotPassword)
// router.post("/reset-password", AuthController.resetPassword)
// router.post("change-password", AuthController.changePassword)
// router.post("/logout", AuthController.logout)
export const AuthRoute = router;
