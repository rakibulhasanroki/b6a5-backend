import { Router } from "express";
import { AuthRoute } from "../module/auth/auth.route";

const router: Router = Router();

router.use("/auth", AuthRoute);

export const Routes = router;
