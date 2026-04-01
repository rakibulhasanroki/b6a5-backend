import { Router } from "express";
import { AuthRoute } from "../module/auth/auth.route";
import { UsersRoute } from "../module/users/user.route";
import { EventRoutes } from "../module/events/event.route";

const router: Router = Router();

router.use("/auth", AuthRoute);
router.use("/users", UsersRoute);
router.use("/events", EventRoutes);

export const Routes = router;
