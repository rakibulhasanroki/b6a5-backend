import { Router } from "express";
import { BookingController } from "./booking.controller";
import authCheck from "../../middleware/authCheck";
import { zodValidator } from "../../middleware/zodValidator";
import { BookingValidation } from "./booking.validation";

const router = Router();

router.post(
  "/",
  authCheck(),
  zodValidator(BookingValidation.createBookingSchema),
  BookingController.createBooking,
);

router.get("/my", authCheck(), BookingController.getMyBookings);
router.get("/event/:eventId", authCheck(), BookingController.getEventBookings);
router.patch(
  "/:bookingId/status",
  authCheck(),
  zodValidator(BookingValidation.updateBookingStatusSchema),
  BookingController.updateBookingStatus,
);

router.get("/:bookingId", authCheck(), BookingController.getBookingById);

export const BookingRoutes = router;
