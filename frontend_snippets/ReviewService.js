const API = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "http://localhost:8800";

export async function fetchReviews(hotelId) {
  const res = await fetch(`${API}/api/hotels/${hotelId}/reviews`, {
    credentials: "include",
  });
  return res.json();
}

export async function postReview(hotelId, { rating, comment, bookingId }, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}/api/hotels/${hotelId}/reviews`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ rating, comment, bookingId }),
  });
  return res.json();
}

export default { fetchReviews, postReview };
