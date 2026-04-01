import { Router } from "express";
import { EventController } from "./event.controller";
import authCheck from "../../middleware/authCheck";
import {
  createEventSchema,
  updateEventSchema,
  getEventsQuerySchema,
} from "./event.validation";
import { zodValidator } from "../../middleware/zodValidator";

const router = Router();

router.post(
  "/",
  authCheck(),
  zodValidator(createEventSchema),
  EventController.createEvent,
);

router.get(
  "/",
  zodValidator(getEventsQuerySchema, "query"),
  EventController.getEvents,
);

router.get("/my", authCheck(), EventController.getMyEvents);

router.get("/:id", EventController.getSingleEvent);

router.patch(
  "/:id",
  authCheck(),
  zodValidator(updateEventSchema),
  EventController.updateEvent,
);

router.delete("/:id", authCheck(), EventController.deleteEvent);

export const EventRoutes = router;
