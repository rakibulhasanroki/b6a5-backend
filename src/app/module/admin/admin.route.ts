import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { zodValidator } from "../../middleware/zodValidator";
import { AdminController } from "./admin.controller";
import { AdminValidation } from "./admin.validation";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-admin",
  authCheck(Role.ADMIN),
  zodValidator(AdminValidation.createAdminSchema),
  AdminController.createAdmin,
);

router.delete(
  "/users/:userId",
  authCheck(Role.ADMIN),
  AdminController.deleteUser,
);

router.delete(
  "/events/:eventId",
  authCheck(Role.ADMIN),
  AdminController.deleteEvent,
);

export const AdminRoutes = router;
