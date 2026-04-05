import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { InvitationService } from "./invitation.service";

const sendInvitation = catchAsync(async (req, res) => {
  const user = req.user!;
  const { eventId, invitedUserId } = req.body;

  const result = await InvitationService.sendInvitation(
    user.id,
    eventId,
    invitedUserId,
  );

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Invitation sent successfully",
    data: result,
  });
});

const getMyInvitations = catchAsync(async (req, res) => {
  const user = req.user!;

  const result = await InvitationService.getMyInvitations(user.id);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Invitations fetched successfully",
    data: result,
  });
});

const getEventInvitations = catchAsync(async (req, res) => {
  const user = req.user!;
  const { eventId } = req.params;

  const result = await InvitationService.getEventInvitations(
    user.id,
    eventId as string,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Event invitations fetched successfully",
    data: result,
  });
});

const updateInvitationStatus = catchAsync(async (req, res) => {
  const user = req.user!;
  const { id } = req.params;

  const result = await InvitationService.updateInvitationStatus(
    user.id,
    id as string,
    req.body.status,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Invitation updated successfully",
    data: result,
  });
});

export const InvitationController = {
  sendInvitation,
  getMyInvitations,
  getEventInvitations,
  updateInvitationStatus,
};
