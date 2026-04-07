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
router.get("/joined", authCheck(), EventController.getJoinedEvents);
router.get(
  "/participants/all",
  authCheck(),
  EventController.getAllParticipants,
);

router.get(
  "/:eventId/participants",
  authCheck(),
  EventController.getEventParticipants,
);

router.get("/:eventId/requests", authCheck(), EventController.getEventRequests);

router.get("/:eventId", EventController.getSingleEvent);

router.patch(
  "/:eventId",
  authCheck(),
  zodValidator(EventValidation.updateEventSchema),
  EventController.updateEvent,
);

router.delete("/:eventId", authCheck(), EventController.deleteEvent);

export const EventRoutes = router;
