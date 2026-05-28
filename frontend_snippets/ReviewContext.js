import React, { createContext, useCallback, useState } from "react";
import * as ReviewService from "./ReviewService";

export const ReviewContext = createContext(null);

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [aggregates, setAggregates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReviews = useCallback(async (hotelId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReviewService.fetchReviews(hotelId);
      if (data?.success) {
        setReviews(data.reviews || []);
        setAggregates(data.aggregates || null);
      } else {
        setError(data?.message || "Failed to load reviews");
        setReviews([]);
        setAggregates(null);
      }
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReview = useCallback(async (hotelId, payload, token) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ReviewService.postReview(hotelId, payload, token);
      if (data?.success) {
        await loadReviews(hotelId);
        return { success: true };
      }
      return { success: false, error: data?.message || "Failed to submit" };
    } catch (e) {
      return { success: false, error: e.message || String(e) };
    } finally {
      setLoading(false);
    }
  }, [loadReviews]);

  return (
    <ReviewContext.Provider value={{ reviews, aggregates, loading, error, loadReviews, submitReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export default ReviewProvider;
