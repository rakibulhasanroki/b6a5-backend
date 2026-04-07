export type CreateEventPayload = {
  title: string;
  description: string;

  startDateTime?: string;
  endDateTime?: string;

  status?: "UPCOMING" | "ONGOING" | "ENDED";

  eventType: "PHYSICAL" | "ONLINE";

  location?: string;
  meetingLink?: string;

  visibility: "PUBLIC" | "PRIVATE";
  fee?: number;

  maxParticipants?: number;
};

export interface IGetEventsQuery {
  search?: string;

  visibility?: "PUBLIC" | "PRIVATE";
  feeType?: "FREE" | "PAID";
  eventType?: "PHYSICAL" | "ONLINE";

  status?: "UPCOMING" | "ONGOING" | "ENDED";

  page: number;
  limit: number;

  sortBy: "startDateTime" | "createdAt";
  sortOrder: "asc" | "desc";

  startDate?: string;
  endDate?: string;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;
