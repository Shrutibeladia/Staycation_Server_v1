import { useContext } from "react";
import { ReviewContext } from "./ReviewContext";

export const useReviews = () => {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewProvider");
  return ctx;
};

export default useReviews;
