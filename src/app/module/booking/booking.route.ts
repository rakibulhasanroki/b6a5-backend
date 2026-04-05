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

router.get("/:id", authCheck(), BookingController.getBookingById);

router.patch(
  "/:id/status",
  zodValidator(BookingValidation.updateBookingStatusSchema),
  authCheck(),
  BookingController.updateBookingStatus,
);

export const BookingRoutes = router;
