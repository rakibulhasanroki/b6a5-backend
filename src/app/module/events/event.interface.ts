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

export type UpdateEventPayload = Partial<CreateEventPayload>;
