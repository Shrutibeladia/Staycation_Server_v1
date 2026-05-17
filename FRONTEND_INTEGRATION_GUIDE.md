# FRONTEND_INTEGRATION_GUIDE

## PROJECT OVERVIEW

### What this backend does
This backend serves as the API layer for the Staycation application. It supports:
- User authentication and registration
- User profile management
- Hotel creation, listing, searching, and filtering
- Room creation, listing, details, and availability blocking
- Booking creation, retrieval, and cancellation
- Partial payment support via Stripe endpoints (not production-ready)

### Main modules
- `auth`: registration and login
- `users`: profile operations and user listing
- `hotels`: hotel CRUD and hotel search/listing
- `rooms`: room CRUD, room details, room availability control
- `bookings`: booking creation and retrieval
- `payments`: Stripe payment intent creation and payment confirmation
- `utils`: auth middleware, request validation, error helper

### Current backend completion status
- Fully implemented: authentication, hotel/room CRUD, booking flow, basic pagination, validation, protected routes
- Partially implemented: booking model and booking flow
- Incomplete / unsafe: payment flow, role-based host workflows, logout endpoint, admin-safe registration

## BASE CONFIGURATION

### Base API URL
- Default backend base URL: `http://localhost:8800`
- Frontend should use environment-based API URL such as `REACT_APP_API_URL` or `VITE_API_URL`

### Port
- Backend listens on `process.env.PORT || 8800`
- In local development, use `http://localhost:8800`

### Content-Type
- All JSON request bodies must use header `Content-Type: application/json`
- Responses are JSON except registration returns plain text in some cases

### Credentials/cookies requirements
- The backend uses an `HttpOnly` cookie named `access_token`
- Frontend must send cookies on requests to protected routes
- Requests should use:
  - `fetch(..., { credentials: 'include' })`
  - or Axios: `axios.defaults.withCredentials = true`

### Environment variables frontend may need
- `API_URL` or equivalent set to `http://localhost:8800`
- `AUTH_URL` is optional; use the same as `API_URL`
- The backend uses `CORS_ORIGIN` to allow frontend origin. If the server is configured with `CORS_ORIGIN=http://localhost:3000`, the front-end must run from that origin.

## AUTHENTICATION FLOW

### Registration flow
- Endpoint: `POST /api/auth/register`
- Request body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "country": "string",
  "city": "string",
  "phone": "string"
}
```
- Validation:
  - `username` required
  - `email` must be valid
  - `password` must be at least 8 characters
- Response:
  - `200 OK` with plain text: `"User has been created."`
- Notes:
  - This endpoint currently accepts any fields on the user model, including `role`. That is unsafe for a public registration flow.
  - There is no logout endpoint in the backend.

### Login flow
- Endpoint: `POST /api/auth/login`
- Request body:
```json
{
  "username": "string",
  "password": "string"
}
```
- Validation:
  - `username` required
  - `password` required
- Response success body:
```json
{
  "details": {
    "_id": "...",
    "username": "...",
    "email": "...",
    "country": "...",
    "city": "...",
    "phone": "...",
    "role": "guest|host|admin",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "isAdmin": null
}
```
- Notes:
  - The backend sets the auth cookie in response headers, not in the JSON.
  - Use `details.role` to determine role. The `isAdmin` field is unreliable in current backend code.
  - The login response includes the user object without `password`.

### Logout flow
- The backend currently does not provide a logout route.
- Frontend must clear local auth state client-side and may optionally request a server-side cookie clear endpoint once implemented.

### JWT cookie flow
- The backend issues a JWT inside an `HttpOnly` cookie named `access_token`.
- Cookie configuration:
  - `httpOnly: true`
  - `sameSite: "lax"`
  - `secure: true` in production and `false` in development
  - `maxAge` 7 days
- Frontend cannot read this cookie directly.
- Every authenticated request must include cookies.

### Protected route handling
- Use `credentials: 'include'` or equivalent for all protected routes.
- For 401 / 403 responses, clear frontend auth state and redirect to login.
- Protected routes include:
  - `PUT /api/users/:id`
  - `DELETE /api/users/:id`
  - `GET /api/users/:id`
  - `GET /api/users/` (admin only)
  - `POST /api/hotels` (admin only)
  - `PUT /api/hotels/:id` (admin only)
  - `DELETE /api/hotels/:id` (admin only)
  - `POST /api/rooms/:hotelid` (admin only)
  - `PUT /api/rooms/:id` (admin only)
  - `DELETE /api/rooms/:id/:hotelid` (admin only)
  - `PUT /api/rooms/availability/:id` (any logged-in user)
  - `POST /api/bookings` (any logged-in user)
  - `GET /api/bookings/:id` (user or admin)
  - `GET /api/bookings/user/:id` (user or admin)
  - `PUT /api/bookings/:id/cancel` (user or admin)
  - `POST /api/payments` (any logged-in user)
  - `POST /api/payments/confirm` (any logged-in user)

### Session persistence
- Authentication is maintained by the `access_token` cookie.
- The frontend should persist user details in state only as a client-side cache.
- On refresh, the frontend should revalidate by calling a protected endpoint or by relying on server response from a login request.

### Role-based access
- The backend stores `role` in the user model: `guest`, `host`, `admin`.
- The login response includes `details.role`.
- The current backend does not implement explicit host ownership logic.
- Use `role` from the login response to gate UI elements.

## USER ROLES

### guest permissions
- Create a user account
- Login
- View hotels
- View rooms
- Book rooms
- View own bookings
- Cancel own bookings
- Update own profile

### host permissions
- Host role exists in schema, but backend does not currently expose host-specific creation or ownership APIs.
- Do not rely on host-specific flow until backend is expanded.

### admin permissions
- Full hotel CRUD
- Full room CRUD
- Can fetch all users
- Can access any booking by id
- Can cancel any booking
- Can create admin users via registration if role is submitted in request body (unsafe)

## COMPLETE API DOCUMENTATION

### Auth - Register
#### Route
`POST /api/auth/register`

#### Purpose
Create a new user account.

#### Authentication Required?
No

#### Allowed Roles
public

#### Request Body
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "country": "string",
  "city": "string",
  "phone": "string"
}
```

#### Query Params
None

#### Success Response
- Status: `200`
- Body: plain text string
```json
"User has been created."
```

#### Error Responses
- `422` validation errors
  - Response body:
  ```json
  {
    "success": false,
    "errors": [
      { "msg": "message", "param": "field", "location": "body" }
    ]
  }
  ```
- `500` server errors
- Note: There is no JSON success body currently

#### Frontend Notes
- Show form validation errors for username, email, and password length.
- After success, redirect user to login.
- Do not store password in frontend state.
- This endpoint currently allows `role` in the payload, so do not rely on it to create admin accounts from the public UI.

### Auth - Login
#### Route
`POST /api/auth/login`

#### Purpose
Authenticate existing user and set auth cookie.

#### Authentication Required?
No

#### Allowed Roles
public

#### Request Body
```json
{
  "username": "string",
  "password": "string"
}
```

#### Query Params
None

#### Success Response
- Status: `200`
- Body:
```json
{
  "details": {
    "_id": "...",
    "username": "...",
    "email": "...",
    "country": "...",
    "city": "...",
    "phone": "...",
    "role": "guest|host|admin",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "isAdmin": null
}
```

#### Error Responses
- `400` invalid credentials
  ```json
  {
    "success": false,
    "status": 400,
    "message": "Wrong username or password!"
  }
  ```
- `422` validation errors
- `429` auth rate limiter reached
- `500` server errors

#### Frontend Notes
- Use `credentials: 'include'` or Axios `withCredentials: true`.
- Do not expect the JWT token in body; it is stored in cookie.
- Determine role from `details.role`.
- If login fails, show a generic auth error.
- After login, persist `details` in auth state and use `role` to route the user.

### Users - Check Authentication
#### Route
`GET /api/users/checkauthentication`

#### Purpose
Simple authenticated health check.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin

#### Request Body
None

#### Success Response
- Status: `200`
- Body: plain text: `"hello user, you are logged in"`

#### Frontend Notes
- This is a debug endpoint that can be used to verify cookie auth.
- Don’t rely on it for production flow.

### Users - Check User Authorization
#### Route
`GET /api/users/checkuser/:id`

#### Purpose
Verify that the current token belongs to the requested user or admin.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin

#### Request Body
None

#### Success Response
- Status: `200`
- Body: plain text: `"hello user, you are logged in and you can delete your account"`

#### Frontend Notes
- Also a debug endpoint.
- Useful for verifying verifyUser middleware.

### Users - Update Profile
#### Route
`PUT /api/users/:id`

#### Purpose
Update the user profile.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin (only if `req.user.id === :id` or `admin`)

#### Request Body
```json
{
  "email": "string",
  "password": "string",
  "country": "string",
  "city": "string",
  "phone": "string"
}
```
- `isAdmin` and `password` are stripped from updates by backend logic.

#### Validation
- `email` optional but if present must be valid
- `password` optional but if present must be minimum 8 characters

#### Success Response
- Status: `200`
- Body:
```json
{
  "_id": "...",
  "username": "...",
  "email": "...",
  "country": "...",
  "city": "...",
  "phone": "...",
  "role": "..."
}
```

#### Error Responses
- `403` unauthorized
- `404` user not found
- `422` validation errors

#### Frontend Notes
- Frontend should allow user profile edits only for current authenticated user.
- Show field-level validation errors.
- Refresh local auth state after success.

### Users - Delete Profile
#### Route
`DELETE /api/users/:id`

#### Purpose
Delete a user account.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin (only if user owns account or admin)

#### Success Response
- Status: `200`
- Body: `"User has been deleted."`

#### Frontend Notes
- Confirm deletion in UI.
- After deletion, clear auth state.

### Users - Get Profile
#### Route
`GET /api/users/:id`

#### Purpose
Fetch a single user's profile.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin (only if user owns account or admin)

#### Success Response
- Status: `200`
- Body:
```json
{
  "_id": "...",
  "username": "...",
  "email": "...",
  "country": "...",
  "city": "...",
  "phone": "...",
  "role": "..."
}
```

#### Frontend Notes
- Use this to populate profile pages.
- Do not expect `password` in response.

### Users - List All Users
#### Route
`GET /api/users`

#### Purpose
Fetch paginated list of all users.

#### Authentication Required?
Yes

#### Allowed Roles
admin only

#### Query Params
- `page` (default `1`)
- `limit` (default `10`)

#### Success Response
```json
{
  "success": true,
  "total": 100,
  "page": 1,
  "limit": 10,
  "users": [ ... ]
}
```

#### Frontend Notes
- Admin dashboards can use this endpoint.
- Add pagination UI.

### Hotels - Create Hotel
#### Route
`POST /api/hotels`

#### Purpose
Create a hotel listing.

#### Authentication Required?
Yes

#### Allowed Roles
admin only

#### Request Body
```json
{
  "name": "string",
  "type": "string",
  "city": "string",
  "address": "string",
  "distance": "string",
  "photos": ["string"],
  "title": "string",
  "desc": "string",
  "rating": 4.5,
  "cheapestPrice": 100,
  "featured": true
}
```

#### Validation
- All string fields required except `photos` and `rating`
- `cheapestPrice` required numeric
- `rating` optional between 0 and 5

#### Success Response
- Status: `200`
- Body: newly created hotel object

#### Frontend Notes
- Admin pages should show validation errors and required fields.
- After success, redirect to hotel detail or listing.

### Hotels - Update Hotel
#### Route
`PUT /api/hotels/:id`

#### Purpose
Update a hotel listing.

#### Authentication Required?
Yes

#### Allowed Roles
admin only

#### Request Body
Same as hotel creation body

#### Success Response
- Status: `200`
- Body: updated hotel object

#### Frontend Notes
- Use this in hotel edit forms.
- Handle `404` if hotel ID is invalid or missing.

### Hotels - Delete Hotel
#### Route
`DELETE /api/hotels/:id`

#### Purpose
Delete a hotel.

#### Authentication Required?
Yes

#### Allowed Roles
admin only

#### Success Response
- Status: `200`
- Body: `"Hotel has been deleted."`

#### Frontend Notes
- Confirm before deletion.
- Refresh hotel list after success.

### Hotels - Get Hotel Details
#### Route
`GET /api/hotels/find/:id`

#### Purpose
Fetch a single hotel by ID.

#### Authentication Required?
No

#### Allowed Roles
public

#### Success Response
- Status: `200`
- Body: hotel object

#### Frontend Notes
- Use this for hotel detail pages.
- Show loading while fetching.
- Handle `404` if hotel not found.

### Hotels - Search/List Hotels
#### Route
`GET /api/hotels`

#### Purpose
Fetch hotel listings with filter and pagination.

#### Authentication Required?
No

#### Allowed Roles
public

#### Query Params
- `page` default `1`
- `limit` default `10`
- `min` optional minimum `cheapestPrice`
- `max` optional maximum `cheapestPrice`
- `city`, `type`, `featured`, or any hotel field for exact filtering

#### Success Response
```json
{
  "success": true,
  "total": 100,
  "page": 1,
  "limit": 10,
  "hotels": [ ... ]
}
```

#### Frontend Notes
- Search uses exact match filtering for query params.
- `city` and `type` are exact string matches, not partial search.
- Use `page` and `limit` for pagination UI.
- `min` and `max` filter by `cheapestPrice`.
- If `page` or `limit` are not numbers, backend defaults apply.

### Hotels - Count by City
#### Route
`GET /api/hotels/countByCity?cities=City1,City2`

#### Purpose
Return hotel counts for each requested city.

#### Authentication Required?
No

#### Allowed Roles
public

#### Success Response
- Status: `200`
- Body: `[number, number, ...]`

#### Frontend Notes
- Good for city summary stats.
- Provide `cities` as a comma-separated list.

### Hotels - Count by Type
#### Route
`GET /api/hotels/countByType`

#### Purpose
Return counts for mapped hotel types.

#### Authentication Required?
No

#### Allowed Roles
public

#### Success Response
```json
[
  { "type": "hotel", "count": 10 },
  { "type": "apartments", "count": 5 },
  { "type": "resorts", "count": 2 },
  { "type": "villas", "count": 7 },
  { "type": "cabins", "count": 1 }
]
```

#### Frontend Notes
- Use for category dashboards or filters.

### Hotels - Get Hotel Rooms
#### Route
`GET /api/hotels/room/:id`

#### Purpose
Fetch all room documents associated with a hotel.

#### Authentication Required?
No

#### Allowed Roles
public

#### Success Response
- Status: `200`
- Body: array of room objects

#### Frontend Notes
- Use this on hotel detail pages to list room options.
- `roomNumbers` nested data will include `number` and `unavailableDates`.

### Rooms - Create Room
#### Route
`POST /api/rooms/:hotelid`

#### Purpose
Create a room and attach it to a hotel.

#### Authentication Required?
Yes

#### Allowed Roles
admin only

#### Request Body
```json
{
  "title": "string",
  "price": 100,
  "maxPeople": 2,
  "desc": "string",
  "roomNumbers": [
    {
      "number": 101,
      "unavailableDates": []
    }
  ]
}
```

#### Validation
- `title` required
- `price` numeric required
- `maxPeople` integer >= 1 required
- `desc` required

#### Success Response
- Status: `200`
- Body: created room object

#### Frontend Notes
- Admin room creation UI should include nested room numbers.
- If hotel id is invalid, backend returns `404`.

### Rooms - Get Room Details
#### Route
`GET /api/rooms/:id`

#### Purpose
Fetch a single room by its ID.

#### Authentication Required?
No

#### Allowed Roles
public

#### Success Response
- Status: `200`
- Body: room object

#### Frontend Notes
- Use this in room detail pages.
- `roomNumbers` includes `unavailableDates` arrays.

### Rooms - List Rooms
#### Route
`GET /api/rooms`

#### Purpose
List rooms with pagination.

#### Authentication Required?
No

#### Allowed Roles
public

#### Query Params
- `page` default `1`
- `limit` default `10`

#### Success Response
```json
{
  "success": true,
  "total": 100,
  "page": 1,
  "limit": 10,
  "rooms": [ ... ]
}
```

#### Frontend Notes
- Useful for admin or global room list pages.
- Not typically needed for guest booking flows.

### Rooms - Update Room
#### Route
`PUT /api/rooms/:id`

#### Purpose
Update room metadata.

#### Authentication Required?
Yes

#### Allowed Roles
admin only

#### Request Body
Same as room creation body

#### Success Response
- Status: `200`
- Body: updated room object

#### Frontend Notes
- Use admin room edit UI.

### Rooms - Delete Room
#### Route
`DELETE /api/rooms/:id/:hotelid`

#### Purpose
Delete a room and remove its reference from the hotel.

#### Authentication Required?
Yes

#### Allowed Roles
admin only

#### Success Response
- Status: `200`
- Body: `"Room has been deleted."`

#### Frontend Notes
- Confirm deletion.
- Use both room id and hotel id.

### Rooms - Update Room Availability
#### Route
`PUT /api/rooms/availability/:id`

#### Purpose
Mark a nested room number as unavailable for selected dates.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin

#### Request Body
```json
{
  "dates": ["2026-06-01", "2026-06-02"]
}
```

#### Validation
- `id` path param must be a MongoDB object id (roomNumber nested ID)
- `dates` must be a non-empty array

#### Success Response
- Status: `200`
- Body: `"Room status has been updated."`

#### Frontend Notes
- This endpoint is used by frontend booking/availability blocking.
- The `:id` in the path is not the room document id, but the nested `roomNumbers._id` value.
- Confirm exact ID handling when wiring booking UI.
- Handle `404` if the room number is invalid.

### Bookings - Create Booking
#### Route
`POST /api/bookings`

#### Purpose
Reserve room dates and create a booking record.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin

#### Request Body
```json
{
  "hotelId": "string",
  "roomId": "string",
  "roomNumberId": "string",
  "checkInDate": "2026-06-01",
  "checkOutDate": "2026-06-03",
  "totalPrice": 360,
  "guests": 2
}
```

#### Validation
- `hotelId`, `roomId`, `roomNumberId`, `checkInDate`, `checkOutDate`, `totalPrice` required
- `checkInDate` and `checkOutDate` must be valid ISO dates
- `totalPrice` must be a positive number
- `guests` optional but if present must be integer > 0

#### Success Response
- Status: `201`
- Body:
```json
{
  "success": true,
  "booking": { ...booking object... }
}
```

#### Error Responses
- `400` invalid dates or missing fields
- `404` room/hotel not found
- `409` selected dates unavailable
- `422` validation errors

#### Frontend Notes
- This is the core booking endpoint.
- Use room details to populate `hotelId`, `roomId`, and `roomNumberId`.
- Only send valid date ranges; `checkOutDate` must be after `checkInDate`.
- Show a booking conflict error when response status is `409`.

### Bookings - Get Booking
#### Route
`GET /api/bookings/:id`

#### Purpose
Fetch a single booking record.

#### Authentication Required?
Yes

#### Allowed Roles
Booking owner or admin

#### Success Response
```json
{
  "success": true,
  "booking": { ... }
}
```

#### Frontend Notes
- Use this for booking detail pages.
- Show `403` or `404` errors if unauthorized or missing.

### Bookings - Get User Bookings
#### Route
`GET /api/bookings/user/:id`

#### Purpose
Fetch bookings for a given user.

#### Authentication Required?
Yes

#### Allowed Roles
Booking owner or admin

#### Success Response
```json
{
  "success": true,
  "bookings": [ ... ]
}
```

#### Frontend Notes
- Use this for booking history pages.
- Validate that `guest_id` matches the authenticated user.

### Bookings - Cancel Booking
#### Route
`PUT /api/bookings/:id/cancel`

#### Purpose
Cancel a booking and release its unavailable dates.

#### Authentication Required?
Yes

#### Allowed Roles
Booking owner or admin

#### Success Response
```json
{
  "success": true,
  "booking": { ...updated booking... }
}
```

#### Frontend Notes
- Confirm cancellation before calling.
- After cancellation, refresh booking history.
- Backend removes booked dates from nested room availability.

### Payments - Create Payment Intent
#### Route
`POST /api/payments`

#### Purpose
Create a Stripe PaymentIntent for a booking.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin

#### Request Body
```json
{
  "amount": 360,
  "currency": "usd",
  "bookingId": "..."
}
```

#### Validation
- `amount` positive number
- `bookingId` required

#### Success Response
```json
{
  "success": true,
  "clientSecret": "...",
  "paymentIntentId": "..."
}
```

#### Edge Cases
- Returns `500` if `STRIPE_KEY` is not configured.
- Payment flow is not fully production-ready.

#### Frontend Notes
- Do not use this endpoint in production until Stripe is configured.
- Use Stripe client SDK only after verifying `clientSecret` is returned.

### Payments - Confirm Payment
#### Route
`POST /api/payments/confirm`

#### Purpose
Mark a booking as paid and confirmed.

#### Authentication Required?
Yes

#### Allowed Roles
guest/host/admin

#### Request Body
```json
{
  "bookingId": "...",
  "paymentIntentId": "..."
}
```

#### Success Response
```json
{
  "success": true,
  "booking": { ... }
}
```

#### Frontend Notes
- This endpoint only updates booking status locally.
- It does not verify Stripe webhook events.

## HOTEL FLOW

### Search
- Call `GET /api/hotels` with query params.
- Example:
  - `GET /api/hotels?city=Ahmedabad&min=100&max=500&page=1&limit=12`
- The backend performs exact city/type filtering.
- The response includes `total`, `page`, and `limit`.

### Filter
- Use query params for hotel fields:
  - `city`
  - `type`
  - `featured`
  - `min` / `max` for `cheapestPrice`
- Search is not fuzzy. Use exact strings.
- For featured hotels, use `featured=true`.

### Details page
- Fetch hotel info by `GET /api/hotels/find/:id`
- Fetch associated rooms by `GET /api/hotels/room/:id`
- Show room cards with `title`, `price`, `desc`, and `roomNumbers`.

### Room listing
- Use hotel rooms endpoint to show availability and room options.
- Use `roomNumbers` nested ids when booking.
- For global room list, use `GET /api/rooms`.

### Featured hotels
- Query `GET /api/hotels?featured=true&page=1&limit=10`
- The backend supports featured filtering via exact field matching.

### City-based listing
- Use `GET /api/hotels?city=CityName&page=1&limit=10`
- Optionally call `GET /api/hotels/countByCity?cities=City1,City2` for summary stats.

## BOOKING FLOW

### Current booking logic
1. User selects hotel and room.
2. Frontend obtains `hotelId`, `roomId`, and nested `roomNumberId`.
3. Frontend sends `POST /api/bookings` with dates and `totalPrice`.
4. Backend checks room availability and saves booking.
5. Backend marks `roomNumbers.$.unavailableDates` for the chosen room number.

### Availability checking
- The backend checks for overlapping unavailable dates inside the selected nested room number.
- It returns `409` on date conflicts.
- The booking flow relies on `roomNumberId` inside `room.roomNumbers`.
- `PUT /api/rooms/availability/:id` exists to block dates, but use `POST /api/bookings` instead for actual booking logic.

### Missing booking features
- No dedicated frontend-friendly availability search endpoint.
- No host-owned booking approval workflow.
- No booking cancellation conditions beyond status update.
- No email confirmation or booking notifications.
- No `logout` route.

### Future expected flow
- Add a real booking availability search endpoint.
- Add host/owner-specific hotel and room endpoints.
- Add webhook-backed payment confirmation.
- Add logout and session refresh endpoints.

## PAYMENT FLOW

### Current status
- Backend exposes Stripe payment endpoints.
- `POST /api/payments` requires `STRIPE_KEY` configured on backend.
- `POST /api/payments/confirm` simply sets booking status.

### What frontend can use now
- None in production until Stripe key and server-side webhook verification are implemented.

### Expected future integration
- Create a Stripe PaymentIntent on the backend.
- Use Stripe Elements or PaymentElement on the frontend.
- Confirm payment on success and then call `POST /api/payments/confirm`.
- Implement server webhook verification to avoid trust issues.

## STATE MANAGEMENT GUIDE

### Auth user
- Store `user` object from login response.
- Store `role` from `details.role`.
- Do not store JWT token — cookie is `HttpOnly`.
- Keep `isAuthenticated` based on successful login and protected route checks.

### Search state
- Store active search query params: `city`, `min`, `max`, `type`, `page`, `limit`.
- Store `hotels` results, `total`, and current pagination.

### Hotel state
- Store current hotel details.
- Store hotel room list and selected room.
- Store `roomNumberId` for booking.

### Booking state
- Store selected dates, `totalPrice`, and guest count.
- Store booking result after `POST /api/bookings`.
- Store booking history for `GET /api/bookings/user/:id`.

### Wishlist
- Wishlist is not currently supported by the backend.
- Implement client-only wishlist local storage until backend is added.

### Admin dashboard state
- Store user list pagination results.
- Store hotel and room CRUD state.
- Store counts from `countByCity` and `countByType`.

## ERROR HANDLING GUIDE

### Auth errors
- `400` on invalid login credentials.
- `422` on validation failures.
- `429` on auth rate limit.
- Frontend should show generic credential error and not leak details.

### Token expiry
- Protected endpoints return `401` / `403` if cookie is missing or invalid.
- On such responses, clear auth state and redirect to login.

### Validation errors
- `422` returns `errors` array.
- Display validation message from `errors[0].msg` or map by field.
- Example response:
```json
{
  "success": false,
  "errors": [
    { "msg": "Password must be at least 8 characters long.", "param": "password" }
  ]
}
```

### Server errors
- `500` returns `success: false`, `status: 500`, `message`.
- In development, backend returns `stack` as well.
- For production, do not expose stack.

### Frontend retry logic
- Retry idempotent GET requests once on network failure.
- Do not retry `POST /api/auth/login` or `POST /api/bookings` automatically.
- If a request fails with 401/403, perform auth recovery rather than retry.

## SECURITY NOTES FOR FRONTEND

### Cookies usage
- Always send `credentials: 'include'`.
- The authentication cookie is `HttpOnly`; frontend cannot read it.
- The backend uses `sameSite: lax`, so cross-origin requests should still work with credentials.

### Protected pages
- Protect profile, booking history, booking details, and admin pages in the frontend.
- Use server responses to verify access before rendering.

### Role protection
- Use `details.role` from login to hide or show admin UI.
- Do not trust client role alone; backend enforces admin-only routes.

### Unsafe APIs
- `POST /api/auth/register` currently allows `role` in request body, which is unsafe.
- `POST /api/payments` and `POST /api/payments/confirm` are not production-ready.
- Use caution with `rooms/availability/:id` since its path param is nested room number id.

## FRONTEND PAGE SUGGESTIONS

### Home
- Search input
- Featured hotels
- City counts from `GET /api/hotels/countByCity`
- Type cards from `GET /api/hotels/countByType`

### Hotel details
- Hotel info from `GET /api/hotels/find/:id`
- Room list from `GET /api/hotels/room/:id`
- Booking widget with date range, guests, and room selection

### Search results
- Hotel filtering by city, type, price range
- Pagination controls
- Hotel cards with summary and book button

### Login/Register
- Authentication forms with validation hints
- Login should capture auth state and role

### Profile
- User info from `GET /api/users/:id`
- Update profile via `PUT /api/users/:id`
- Booking history via `GET /api/bookings/user/:id`

### Booking
- Booking summary and confirmation
- Use `POST /api/bookings`
- Show conflict message on `409`
- Allow cancellation via `PUT /api/bookings/:id/cancel`

### Admin dashboard
- Hotel and room creation forms
- User list pagination
- Hotel list management
- Room list within selected hotel

### Host dashboard
- Host role is not fully supported by backend yet.
- Build this later after backend expansion.

## FRONTEND COMPONENT SUGGESTIONS

- `AuthForm`
- `ProtectedRoute`
- `HotelCard`
- `RoomCard`
- `SearchFilters`
- `DateRangePicker`
- `BookingSummary`
- `ProfileForm`
- `PaginationControls`
- `AdminHotelForm`
- `AdminRoomForm`
- `ErrorBanner`
- `LoadingSpinner`

## MISSING BACKEND FEATURES

- Logout endpoint
- Host-specific ownership and host workflows
- Secure registration role control
- Dedicated availability search endpoint
- Full Stripe payment verification / webhook flow
- Wishlist or favorites API
- Email confirmation/notifications
- Host or admin booking approval workflow

## FINAL FRONTEND IMPLEMENTATION SUMMARY

### What frontend can fully build now
- Public hotel search and detail pages
- Guest registration and login
- User profile and profile update
- Room browsing and booking creation
- Booking history and cancellation
- Admin hotel and room creation if admin credentials are available

### What needs backend completion
- A safe logout flow
- Host dashboard / host ownership APIs
- Full payment integration and webhook-backed confirmation
- Safe registration without user-controlled roles
- Dedicated availability search APIs
- Better booking conflict and payment state tracking

### Recommended implementation order
1. Implement auth UI and store `details.role`.
2. Build hotel search and hotel detail pages.
3. Build room selection and booking form.
4. Implement booking history and cancellation.
5. Add admin hotel/room CRUD behind admin role.
6. Add payment flow after backend Stripe readiness.

---

#### Assumptions
- `API_URL` points to `http://localhost:8800` in development.
- The backend uses cookie-based auth and does not expose a JWT in response.
- `details.role` is the reliable role value.
- The frontend must use `roomNumberId` nested ids for booking.
