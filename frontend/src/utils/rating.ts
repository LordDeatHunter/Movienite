const STAR_ICON_PATH = "/public";
const STAR_ICON_EXTENSION = "svg";

const RATING_THRESHOLDS = [
  { min: 9, icon: "platinum_star" },
  { min: 7, icon: "gold_star" },
  { min: 4, icon: "silver_star" },
  { min: 0, icon: "bronze_star" },
] as const;

export const getStarIconPathBasedOnRating = (rating: number): string => {
  if (!rating) {
    return `${STAR_ICON_PATH}/bronze_star.${STAR_ICON_EXTENSION}`;
  }
  const matchedThreshold =
    RATING_THRESHOLDS.find(({ min }) => rating >= min) ??
    RATING_THRESHOLDS[RATING_THRESHOLDS.length - 1];
  return `${STAR_ICON_PATH}/${matchedThreshold.icon}.${STAR_ICON_EXTENSION}`;
};
