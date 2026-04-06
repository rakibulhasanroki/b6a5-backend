import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { upload } from "../../config/multer.config";
import { updateUserProfileMiddleware } from "./user.middleware";
import { UsersController } from "./users.controller";
import { zodValidator } from "../../middleware/zodValidator";
import { UserValidation } from "./user.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/me", authCheck(), UsersController.getMe);
router.get(
  "/",
  authCheck(Role.ADMIN),
  zodValidator(UserValidation.getUsersQuerySchema, "query"),
  UsersController.getAllUsers,
);
router.patch(
  "/me",
  authCheck(),
  upload.single("profilePhoto"),
  updateUserProfileMiddleware,
  zodValidator(UserValidation.updateUserSchema),
  UsersController.updateMe,
);

export const UsersRoute = router;
