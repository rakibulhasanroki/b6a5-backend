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

router.get(
  "/event/:eventId",
  zodValidator(ReviewValidation.getReviewsQuerySchema, "query"),
  ReviewController.getEventReviews,
);
router.get(
  "/event/:eventId/my",
  authCheck(),
  ReviewController.getMyEventReview,
);

router.get("/my", authCheck(), ReviewController.getMyReviews);

router.patch(
  "/:reviewId",
  authCheck(),
  zodValidator(ReviewValidation.updateReviewSchema),
  ReviewController.updateReview,
);

router.delete("/:reviewId", authCheck(), ReviewController.deleteReview);

export const ReviewRoutes = router;
