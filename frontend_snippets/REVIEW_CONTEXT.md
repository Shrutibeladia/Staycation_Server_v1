# Review Feature Integration Context

This file summarizes the backend review/rating feature and provides copy-paste-ready examples for frontend integration.

Base URL
- Default: `http://localhost:8800`
- Use your env var: `REACT_APP_API_URL` or `VITE_API_URL`

Authentication
- Auth is provided via an HttpOnly cookie named `access_token` or `Authorization: Bearer <token>` header.
- For cookie auth use `fetch(..., { credentials: 'include' })` or Axios `withCredentials: true`.

Endpoints
- GET /api/hotels/:id/reviews
  - Purpose: fetch reviews and aggregates for a hotel
  - Auth: none (public)
  - Response (200):
    {
      "success": true,
      "aggregates": {
        "totalReviews": 12,
        "verifiedReviews": 10,
        "averageRating": 4.3,
        "trustScore": 4.4
      },
      "reviews": [
        {
          "_id": "...",
          "userId": { "_id": "...", "username": "alice", "img": "..." },
          "hotelId": "...",
          "bookingId": "...",
          "rating": 5,
          "comment": "Great stay",
          "isVerified": true,
          "abuseFlag": false,
          "createdAt": "..."
        }
      ]
    }

- POST /api/hotels/:id/reviews
  - Purpose: submit a post-stay review
  - Auth: required (cookie or Bearer token)
  - Body JSON: `{ "rating": 1-5, "comment": "string", "bookingId": "string" }`
  - Success (201): `{ success: true, review: { ... } }`
  - Error cases:
    - 400 bad request: missing rating or bookingId
    - 401 unauthorized: not authenticated
    - 403 forbidden: booking not found/verified or checkout not passed
    - 409 conflict: review already exists for booking

Business rules enforced by backend
- Only guests with a confirmed, completed booking (paymentStatus: "completed", status: "confirmed") for the hotel can post reviews.
- Guest can only post after `checkOutDate`.
- Only one review per booking is allowed.
- Simple abuse detection flags reviews by keyword — flagged reviews are excluded from aggregates.

Aggregation and trust score
- Aggregates returned include `averageRating` (unweighted avg of visible reviews) and `trustScore` (weighted average where `isVerified` reviews count ~1.5x).
- `Hotel.rating` is updated when new non-flagged reviews are saved.

Frontend snippets

Fetch reviews (vanilla fetch)
```js
async function loadReviews(hotelId) {
  const res = await fetch(`${API}/api/hotels/${hotelId}/reviews`, { credentials: 'include' });
  return res.json();
}
```

Submit a review (vanilla fetch)
```js
async function submitReview(hotelId, { rating, comment, bookingId }) {
  const res = await fetch(`${API}/api/hotels/${hotelId}/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment, bookingId }),
  });
  return res.json();
}
```

UI recommendations
- Show `aggregates.trustScore` and `averageRating` on hotel listing and detail pages.
- Display verified badge when `isVerified` is true.
- For flagged reviews (`abuseFlag: true`) either hide them or show them as "Under review" with limited visibility.
- Disable review form until the frontend can detect that `checkOutDate` has passed, but always rely on backend validation.

Moderation & admin
- Consider providing admin endpoints to list flagged reviews and to clear or remove `abuseFlag`.
- Replace the simple keyword filter with an external moderation API for production.

Integration tips
- If you need reviews in the hotel listing payload, request that the backend include `aggregates` in `GET /api/hotels` (I can add this server change on request).
- Cache the `aggregates` on listing pages and refresh when a user submits a new review.

Contact
- File: frontend_snippets/REVIEW_CONTEXT.md
