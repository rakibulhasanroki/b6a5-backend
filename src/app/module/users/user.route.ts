import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { UsersController } from "./users.controller";

const router = Router();

router.get("/me", authCheck(), UsersController.getMe);

// TODO: update me
// router.patch("/me", authCheck(), UsersController.updateMe);

export const UsersRoute = router;
