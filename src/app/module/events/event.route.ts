import { Router } from "express";
import { EventController } from "./event.controller";
import authCheck from "../../middleware/authCheck";
import { zodValidator } from "../../middleware/zodValidator";
import { EventValidation } from "./event.validation";

const router = Router();

router.post(
  "/",
  authCheck(),
  zodValidator(EventValidation.createEventSchema),
  EventController.createEvent,
);

router.get(
  "/",
  zodValidator(EventValidation.getEventsQuerySchema, "query"),
  EventController.getEvents,
);

router.get("/my", authCheck(), EventController.getMyEvents);
router.get(
  "/participants/all",
  authCheck(),
  EventController.getAllParticipants,
);

router.get("/:id", EventController.getSingleEvent);

router.get(
  "/:id/participants",
  authCheck(),
  EventController.getEventParticipants,
);

router.patch(
  "/:id",
  authCheck(),
  zodValidator(EventValidation.updateEventSchema),
  EventController.updateEvent,
);

router.delete("/:id", authCheck(), EventController.deleteEvent);

export const EventRoutes = router;
