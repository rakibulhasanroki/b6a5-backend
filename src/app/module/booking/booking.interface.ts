import { BookingStatus } from "../../../generated/prisma/enums";

export interface CreateBookingPayload {
  eventId: string;
  invitationId?: string;
}

export interface UpdateBookingStatusPayload {
  status: BookingStatus;
}
