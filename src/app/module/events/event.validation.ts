import { z } from "zod";

const dateField = z.string();

const baseEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),

  startDateTime: dateField.optional(),
  endDateTime: dateField.optional(),
  status: z.enum(["UPCOMING", "ONGOING", "ENDED"]).optional(),

  eventType: z.enum(["PHYSICAL", "ONLINE"]),

  location: z.string().min(1, "Location cannot be empty").optional(),
  meetingLink: z.url("Invalid meeting link").optional(),

  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  fee: z.number().min(0, "Fee cannot be negative").optional(),
  maxParticipants: z
    .number()
    .int()
    .min(1, "Max participants must be at least 1")
    .optional(),
});

const createEventSchema = baseEventSchema.superRefine((data, ctx) => {
  if (data.eventType === "PHYSICAL" && !data.location) {
    ctx.addIssue({
      code: "custom",
      message: "Location is required for PHYSICAL events",
      path: ["location"],
    });
  }

  if (data.eventType === "ONLINE" && !data.meetingLink) {
    ctx.addIssue({
      code: "custom",
      message: "Meeting link is required for ONLINE events",
      path: ["meetingLink"],
    });
  }

  if (data.startDateTime && data.endDateTime) {
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid date format",
        path: ["startDateTime"],
      });
      return;
    }

    if (start >= end) {
      ctx.addIssue({
        code: "custom",
        message: "startDateTime must be before endDateTime",
        path: ["startDateTime"],
      });
    }
  }
});

const updateEventSchema = baseEventSchema.partial().superRefine((data, ctx) => {
  if (data.eventType === "PHYSICAL") {
    if ("location" in data && !data.location) {
      ctx.addIssue({
        code: "custom",
        message: "Location cannot be empty for PHYSICAL event",
        path: ["location"],
      });
    }
  }

  if (data.eventType === "ONLINE") {
    if ("meetingLink" in data && !data.meetingLink) {
      ctx.addIssue({
        code: "custom",
        message: "Meeting link cannot be empty for ONLINE event",
        path: ["meetingLink"],
      });
    }
  }

  if (data.startDateTime && data.endDateTime) {
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid date format",
        path: ["startDateTime"],
      });
      return;
    }

    if (start >= end) {
      ctx.addIssue({
        code: "custom",
        message: "startDateTime must be before endDateTime",
        path: ["startDateTime"],
      });
    }
  }
});

const getEventsQuerySchema = z.object({
  search: z.string().trim().min(1, "Search cannot be empty").optional(),

  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  feeType: z.enum(["FREE", "PAID"]).optional(),
  eventType: z.enum(["PHYSICAL", "ONLINE"]).optional(),

  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),

  sortBy: z.enum(["date", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),

  startDate: dateField.optional(),
  endDate: dateField.optional(),
});

export const EventValidation = {
  createEventSchema,
  updateEventSchema,
  getEventsQuerySchema,
};
