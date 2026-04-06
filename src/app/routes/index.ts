import { Router } from "express";
import { AuthRoute } from "../module/auth/auth.route";
import { UsersRoute } from "../module/users/user.route";
import { EventRoutes } from "../module/events/event.route";
import { BookingRoutes } from "../module/booking/booking.route";
import { ReviewRoutes } from "../module/review/review.route";
import { PaymentRoutes } from "../module/payment/payment.route";

const router: Router = Router();

router.use("/auth", AuthRoute);
router.use("/users", UsersRoute);
router.use("/events", EventRoutes);
router.use("/bookings", BookingRoutes);
router.use("payments", PaymentRoutes);
router.use("reviews", ReviewRoutes);

export const Routes = router;
