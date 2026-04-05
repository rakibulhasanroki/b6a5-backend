export type CreateReviewPayload = {
  eventId: string;
  rating: number;
  comment: string;
};

export type UpdateReviewPayload = Partial<{
  rating: number;
  comment: string;
}>;
