import { z } from "zod";
import { InvitationStatus } from "../../../generated/prisma/enums";

const sendInvitationSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  invitedUserId: z.string().min(1, "User ID is required"),
});

const updateInvitationStatusSchema = z.object({
  status: z.literal(InvitationStatus.DECLINED),
});

export const InvitationValidation = {
  sendInvitationSchema,
  updateInvitationStatusSchema,
};
