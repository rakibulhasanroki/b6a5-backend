export const getEventStatus = (
  startDateTime?: Date | null,
  endDateTime?: Date | null,
) => {
  const now = new Date();

  if (!startDateTime) return "UPCOMING";
  if (!endDateTime) return "ONGOING";

  if (now < startDateTime) return "UPCOMING";
  if (now >= startDateTime && now <= endDateTime) return "ONGOING";
  return "ENDED";
};
