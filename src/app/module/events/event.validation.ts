import { z } from "zod";

const baseEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),

  startDateTime: z.string().optional(),
  endDateTime: z.string().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "ENDED"]).optional(),

  eventType: z.enum(["PHYSICAL", "ONLINE"]),

  location: z.string().optional(),
  meetingLink: z.string().optional(),

  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  fee: z.number().min(0).optional(),
});

export const createEventSchema = baseEventSchema
  .refine(
    (data) => {
      if (data.eventType === "PHYSICAL") return !!data.location;
      if (data.eventType === "ONLINE") return !!data.meetingLink;
      return true;
    },
    {
      message:
        "Location is required for PHYSICAL and meetingLink is required for ONLINE",
      path: ["eventType"],
    },
  )
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return new Date(data.startDateTime) < new Date(data.endDateTime);
      }
      return true;
    },
    {
      message: "startDateTime must be before endDateTime",
      path: ["startDateTime"],
    },
  );

export const updateEventSchema = baseEventSchema
  .partial()
  .refine(
    (data) => {
      if (data.eventType === "PHYSICAL" && !data.location) return false;
      if (data.eventType === "ONLINE" && !data.meetingLink) return false;
      return true;
    },
    {
      message:
        "Location is required for PHYSICAL and meetingLink is required for ONLINE",
      path: ["eventType"],
    },
  )
  .refine(
    (data) => {
      if (data.startDateTime && data.endDateTime) {
        return new Date(data.startDateTime) < new Date(data.endDateTime);
      }
      return true;
    },
    {
      message: "startDateTime must be before endDateTime",
      path: ["startDateTime"],
    },
  );

export const getEventsQuerySchema = z.object({
  search: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  feeType: z.enum(["FREE", "PAID"]).optional(),
  eventType: z.enum(["PHYSICAL", "ONLINE"]).optional(),

  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),

  sortBy: z.enum(["date", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),

  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
