import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { upload } from "../../config/multer.config";
import { updateUserProfileMiddleware } from "./user.middleware";
import { UsersController } from "./users.controller";
import { zodValidator } from "../../middleware/zodValidator";
import { UserValidation } from "./user.validation";

const router = Router();

router.get("/me", authCheck(), UsersController.getMe);

router.patch(
  "/me",
  authCheck(),
  upload.single("profilePhoto"),
  updateUserProfileMiddleware,
  zodValidator(UserValidation.updateUserSchema),
  UsersController.updateMe,
);

export const UsersRoute = router;
