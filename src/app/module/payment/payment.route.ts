import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { PaymentController } from "./payment.controller";
import { zodValidator } from "../../middleware/zodValidator";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router.get(
  "/my",
  authCheck(),
  zodValidator(PaymentValidation.getPaymentsQuerySchema, "query"),
  PaymentController.getMyPayments,
);

router.get(
  "/organizer",
  authCheck(),
  zodValidator(PaymentValidation.getPaymentsQuerySchema, "query"),
  PaymentController.getOrganizerPayments,
);

export const PaymentRoutes = router;
