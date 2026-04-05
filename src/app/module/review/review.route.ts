import { Router } from "express";
import authCheck from "../../middleware/authCheck";
import { zodValidator } from "../../middleware/zodValidator";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.post(
  "/",
  authCheck(),
  zodValidator(ReviewValidation.createReviewSchema),
  ReviewController.createReview,
);

router.patch(
  "/:id",
  authCheck(),
  zodValidator(ReviewValidation.updateReviewSchema),
  ReviewController.updateReview,
);

router.delete("/:id", authCheck(), ReviewController.deleteReview);

router.get(
  "/:eventId",
  zodValidator(ReviewValidation.getReviewsQuerySchema, "query"),
  ReviewController.getEventReviews,
);

router.get("/my", authCheck(), ReviewController.getMyReviews);

export const ReviewRoutes = router;
