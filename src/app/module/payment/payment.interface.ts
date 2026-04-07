import { Visibility } from "../../../generated/prisma/enums";

export type PaginationOptions = {
  page?: number;
  limit?: number;
};

export interface PaymentEventPayload {
  id: string;
  title: string;
  fee: number;
  visibility: Visibility;
  maxParticipants?: number | null;
}

export type OrganizerPaymentGroup = {
  eventId: string;
  eventTitle: string | null;
  totalRevenue: number;
  totalPayments: number;
  payments: {
    paymentId: string;
    amount: number;
    transactionId: string;
    invoiceUrl: string | null;
    paidAt: Date;
    participant: {
      id: string | null;
      name: string;
      email: string;
    };
  }[];
};
