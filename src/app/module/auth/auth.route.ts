import { Router } from "express";
import { AuthController } from "./auth.controller";
import { zodValidator } from "../../middleware/zodValidator";
import { AuthValidation } from "./auth.validation";
import authCheck from "../../middleware/authCheck";

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

router.post(
  "/change-password",
  authCheck(),
  zodValidator(AuthValidation.changePasswordSchema),
  AuthController.changePassword,
);

router.get("/google/callback", AuthController.googleCallback);

export const AuthRoutes = router;
