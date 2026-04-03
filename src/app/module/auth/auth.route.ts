import { Router } from "express";
import { AuthController } from "./auth.controller";
import { zodValidator } from "../../middleware/zodValidator";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  zodValidator(AuthValidation.registerSchema),
  AuthController.register,
);
router.post(
  "/login",
  zodValidator(AuthValidation.loginSchema),
  AuthController.login,
);

// later:
// router.post("/verify-email", AuthController.verifyEmail)
// router.post("/forgot-password", AuthController.forgotPassword)
// router.post("/reset-password", AuthController.resetPassword)
// router.post("change-password", AuthController.changePassword)
// router.post("/logout", AuthController.logout)
export const AuthRoute = router;
