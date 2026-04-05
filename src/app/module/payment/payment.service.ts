/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../lib/prisma";
import { v7 as uuidv7 } from "uuid";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import Stripe from "stripe";
import { generateInvoicePdf } from "../../utils/generateInvoicePdf";
import { uploadBufferToCloudinary } from "../../utils/uploadToCloudinary";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { InvitationStatus } from "../../../generated/prisma/enums";

const createCheckoutSession = async ({
  userId,
  event,
  invitationId,
}: {
  userId: string;
  event: any;
  invitationId?: string;
}) => {
  const transactionId = String(uuidv7());

  const payment = await prisma.payment.create({
    data: {
      amount: event.fee,
      gateway: "STRIPE",
      transactionId,
      status: "FAILED",
      eventId: event.id,
      userId,
    },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: event.title,
          },
          unit_amount: Math.round(event.fee * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      paymentId: payment.id,
      eventId: event.id,
      userId,
      invitationId: invitationId || "",
    },
    success_url: `${envVars.FRONTEND_URL}/payment-success`,
    cancel_url: `${envVars.FRONTEND_URL}/payment-failed`,
  });

  return {
    paymentUrl: session.url,
  };
};

const handleWebhook = async (event: Stripe.Event) => {
  const existing = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existing) return;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = session.metadata?.paymentId;
      const eventId = session.metadata?.eventId;
      const userId = session.metadata?.userId;
      const invitationId = session.metadata?.invitationId || null;

      if (!paymentId || !eventId || !userId) return;

      const eventData = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!eventData) return;
      let uploadedPublicId: string | null = null;

      try {
        await prisma.$transaction(async (tx) => {
          let invitation = null;

          if (invitationId) {
            invitation = await tx.invitation.findUnique({
              where: { id: invitationId },
            });

            if (
              !invitation ||
              invitation.invitedUserId !== userId ||
              invitation.eventId !== eventId ||
              invitation.status !== "PENDING"
            ) {
              throw new Error("Invalid invitation during payment");
            }
          }

          const existingBooking = await tx.booking.findUnique({
            where: {
              userId_eventId: {
                userId,
                eventId,
              },
            },
          });

          if (existingBooking) {
            await tx.payment.update({
              where: { id: paymentId },
              data: {
                status: "SUCCESS",
                stripeEventId: event.id,
              },
            });
            return;
          }

          const bookingStatus =
            eventData.visibility === "PUBLIC" ? "CONFIRMED" : "PENDING";

          const booking = await tx.booking.create({
            data: {
              userId,
              eventId,
              status: bookingStatus,
            },
          });

          if (invitation && invitation.status === "PENDING") {
            await tx.invitation.update({
              where: { id: invitation.id },
              data: { status: InvitationStatus.ACCEPTED },
            });
          }

          let invoiceUrl = null;

          try {
            const paymentData = await tx.payment.findUnique({
              where: { id: paymentId },
            });

            const userData = await tx.user.findUnique({
              where: { id: userId },
              select: { name: true },
            });

            const pdfBuffer = await generateInvoicePdf({
              invoiceId: paymentId,
              userName: userData?.name || "N/A",
              eventTitle: eventData.title,
              amount: eventData.fee,
              transactionId: paymentData?.transactionId || "N/A",
              paymentDate: new Date().toISOString(),
            });

            const publicId = `planora/invoices/invoice-${paymentId}.pdf`;
            uploadedPublicId = publicId;

            const upload = await uploadBufferToCloudinary(pdfBuffer, publicId);

            invoiceUrl = upload?.secure_url;
          } catch (err) {
            console.error("Invoice error", err);
          }

          await tx.payment.update({
            where: { id: paymentId },
            data: {
              status: "SUCCESS",
              stripeEventId: event.id,
              bookingId: booking.id,
              invoiceUrl,
            },
          });
        });
      } catch (error) {
        if (uploadedPublicId) {
          try {
            await deleteFileFromCloudinary(uploadedPublicId);
          } catch (err) {
            console.error("Cloudinary cleanup failed:", err);
          }
        }

        throw error;
      }

      break;
    }
  }
};

export const PaymentService = {
  createCheckoutSession,
  handleWebhook,
};
