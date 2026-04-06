/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { envVars } from "../../config/env";
import { stripe } from "../../config/stripe.config";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { PaymentService } from "./payment.service";

const handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = envVars.STRIPE.WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err: any) {
    throw new AppError(status.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  await PaymentService.handleWebhook(event);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Webhook received successfully",
    data: null,
  });
});

const getMyPayments = catchAsync(async (req, res) => {
  const userId = req.user!.id;

  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const result = await PaymentService.getParticipantPayments(userId as string, {
    page,
    limit,
  });

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Participant payments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getOrganizerPayments = catchAsync(async (req, res) => {
  const userId = req.user!.id;

  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const result = await PaymentService.getOrganizerPayments(userId, {
    page,
    limit,
  });

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Organizer payments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const PaymentController = {
  handleStripeWebhookEvent,
  getMyPayments,
  getOrganizerPayments,
};
