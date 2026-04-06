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
import { PaginationOptions } from "./payment.interface";

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

const getParticipantPayments = async (
  userId: string,
  options: PaginationOptions,
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const payments = await prisma.payment.findMany({
    where: {
      userId,
      status: "SUCCESS",
    },
    select: {
      id: true,
      amount: true,
      transactionId: true,
      invoiceUrl: true,
      createdAt: true,
      eventId: true,
      booking: {
        select: {
          event: {
            select: {
              title: true,
              startDateTime: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  const total = await prisma.payment.count({
    where: {
      userId,
      status: "SUCCESS",
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: payments.map((p) => ({
      paymentId: p.id,
      amount: p.amount,
      transactionId: p.transactionId,
      invoiceUrl: p.invoiceUrl,
      paidAt: p.createdAt,
      eventId: p.eventId,
      eventTitle: p.booking?.event?.title || null,
      eventDate: p.booking?.event?.startDateTime || null,
    })),
  };
};

const getOrganizerPayments = async (
  userId: string,
  options: PaginationOptions,
) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;
  const events = await prisma.event.findMany({
    where: {
      organizerId: userId,
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!events.length) {
    return {
      meta: { page, limit, total: 0, totalPages: 0 },
      data: [],
    };
  }

  const eventMap = new Map(events.map((e) => [e.id, e.title]));
  const eventIds = events.map((e) => e.id);

  const payments = await prisma.payment.findMany({
    where: {
      eventId: { in: eventIds },
      status: "SUCCESS",
    },
    select: {
      id: true,
      amount: true,
      transactionId: true,
      invoiceUrl: true,
      createdAt: true,
      eventId: true,
      booking: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  const total = await prisma.payment.count({
    where: {
      eventId: { in: eventIds },
      status: "SUCCESS",
    },
  });

  const grouped: Record<string, any> = {};

  for (const p of payments) {
    if (!grouped[p.eventId]) {
      grouped[p.eventId] = {
        eventId: p.eventId,
        eventTitle: eventMap.get(p.eventId) || null,
        totalRevenue: 0,
        totalPayments: 0,
        payments: [],
      };
    }

    grouped[p.eventId].totalRevenue += p.amount;
    grouped[p.eventId].totalPayments += 1;

    grouped[p.eventId].payments.push({
      paymentId: p.id,
      amount: p.amount,
      transactionId: p.transactionId,
      invoiceUrl: p.invoiceUrl,
      paidAt: p.createdAt,
      participant: {
        id: p.booking?.user?.id || null,
        name: p.booking?.user?.name || "N/A",
        email: p.booking?.user?.email || "N/A",
      },
    });
  }

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: Object.values(grouped),
  };
};

export const PaymentService = {
  createCheckoutSession,
  handleWebhook,
  getParticipantPayments,
  getOrganizerPayments,
};
