import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { zodValidator } from "../../middleware/zodValidator";
import { InvitationValidation } from "./invitation.validation";
import { InvitationController } from "./invitation.controller";

const router = Router();

router.post(
  "/",
  authCheck(),
  zodValidator(InvitationValidation.sendInvitationSchema),
  InvitationController.sendInvitation,
);

router.get("/my", authCheck(), InvitationController.getMyInvitations);

router.get(
  "/event/:eventId",
  authCheck(),
  InvitationController.getEventInvitations,
);

router.patch(
  "/:invitationId",
  authCheck(),
  zodValidator(InvitationValidation.updateInvitationStatusSchema),
  InvitationController.updateInvitationStatus,
);

export const InvitationRoutes = router;
