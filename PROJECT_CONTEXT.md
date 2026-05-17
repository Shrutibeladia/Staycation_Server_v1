# StayCation Backend - Complete Project Context Document

## Project Overview

### Purpose
StayCation is a hotel and room booking backend application that enables users to search, filter, and book accommodations across multiple cities. It provides a complete accommodation discovery and reservation system with admin capabilities for property management.

### Main Features
- **User Authentication**: Register and login with JWT-based token authentication
- **Hotel Management**: Create, read, update, delete hotels with filtering by price range, city, and type
- **Room Management**: Manage rooms within hotels, track availability, and update booking dates
- **Search & Filtering**: Filter hotels by price range (min/max), city, type, and other attributes
- **Booking System**: Track room availability with date-based unavailability management
- **Admin Controls**: Admin users can manage hotels, rooms, and view all users
- **User Profiles**: Users can update their profile information and delete accounts

### Current Completion Status
**Status: ~40% Complete (MVP Foundation Only)**
- Core authentication and authorization: ✅ Complete
- Hotel CRUD operations: ✅ Complete
- Room CRUD operations: ✅ Complete
- Basic filtering: ✅ Complete
- User management: ✅ Complete
- Booking/Reservation system: ⚠️ Partial (availability tracking exists but no booking model/payment)
- Role-based Host workflows: ❌ Not implemented
- Reviews/Ratings: ❌ Not implemented
- Payment processing: ❌ Not implemented
- Email/notifications: ❌ Not implemented
- Admin analytics/dashboard: ❌ Not implemented
- Production deployment readiness: ⚠️ Partial

---

## Tech Stack

### Frameworks & Runtime
- **Express.js** (v4.18.2): REST API framework for Node.js
- **Node.js**: JavaScript runtime (ES6 modules enabled via `"type": "module"`)

### Database
- **MongoDB** (via Mongoose v7.1.1): NoSQL database for storing users, hotels, and rooms
- Connection: MongoDB Atlas cluster (cloud-hosted)

### Authentication & Security
- **JWT (jsonwebtoken v9.0.0)**: Token-based authentication
- **bcryptjs** (v2.4.3): Password hashing and comparison
- **Cookie-parser** (v1.4.6): Parse HTTP request cookies for JWT token extraction
- **CORS** (v2.8.5): Cross-Origin Resource Sharing for frontend integration

### Environment & Configuration
- **dotenv** (v16.0.3): Load environment variables from `.env` file
- **nodemon** (v2.0.22): Development tool for auto-reloading on file changes

### Development
- Package manager: npm
- Development mode: `npm start` (runs with nodemon)
- No test framework configured

---

## Folder Structure Explanation

```
Staycation_Server_v1/
├── index.js                 # Server entry point - Express app setup, DB connection
├── package.json             # Project dependencies and scripts
├── .env                     # Environment variables (MongoDB URI, JWT secret)
├── README.md                # Project documentation
│
├── controllers/             # Business logic for each feature
│   ├── auth.js             # Register and login logic
│   ├── user.js             # User profile operations (update, delete, get)
│   ├── hotel.js            # Hotel CRUD, filtering, counting, room retrieval
│   └── room.js             # Room CRUD, availability management
│
├── routes/                  # API route definitions and middleware linking
│   ├── auth.js             # /api/auth routes (register, login)
│   ├── users.js            # /api/users routes (with verification middleware)
│   ├── hotels.js           # /api/hotels routes (public and admin)
│   └── rooms.js            # /api/rooms routes (public and admin)
│
├── models/                  # Mongoose schemas and data validation
│   ├── User.js             # User schema (username, email, password, location, etc.)
│   ├── Hotel.js            # Hotel schema (name, location, photos, rating, etc.)
│   └── Room.js             # Room schema (price, availability, room numbers)
│
└── utils/                   # Utility functions and middleware
    ├── error.js            # Custom error creation helper
    └── verifyToken.js      # JWT verification middleware (verifyToken, verifyUser, verifyAdmin)
```

### Key File Responsibilities

**index.js** - Application Bootstrap
- Loads environment variables
- Connects to MongoDB
- Initializes Express app with middleware (CORS, cookies, JSON parsing)
- Mounts route handlers for auth, users, hotels, rooms
- Implements global error handling middleware
- Starts server on port 8800

**Controllers** - Business Logic Layer
- `auth.js`: Handles user registration (password hashing) and login (token generation)
- `user.js`: Profile updates, deletion, retrieval (single or all users)
- `hotel.js`: Create/update/delete hotels, filter by price/city, count properties by city/type, retrieve associated rooms
- `room.js`: Create/update/delete rooms, manage room availability with dates

**Routes** - Request Mapping
- Maps HTTP methods to controller functions
- Applies authentication/authorization middleware
- Defines URL parameters and query parameters

**Models** - Data Schema
- Defines MongoDB collection structure
- Enforces data types and required fields
- Sets defaults and validations

**Utils** - Cross-cutting Concerns
- `error.js`: Simple error object factory
- `verifyToken.js`: Three middleware functions for authentication and authorization

---

## Server Flow

### Server Startup Flow

```
1. Node process starts → index.js executes
2. dotenv.config() → Load MONGO and JWT from .env file
3. mongoose.connect(process.env.MONGO) → Attempt MongoDB connection
   ├─ Success → console.log("MongoDB connected")
   └─ Error → console.log(error)
4. Set up mongoose disconnection listener
5. Initialize Express app with middleware:
   ├─ cors() → Enable cross-origin requests
   ├─ cookieParser() → Parse cookies for JWT extraction
   └─ express.json() → Parse JSON request bodies
6. Mount routes:
   ├─ GET / → Test route returning "hello first"
   ├─ /api/auth → Authentication routes
   ├─ /api/users → User management routes
   ├─ /api/hotels → Hotel management routes
   └─ /api/rooms → Room management routes
7. Global error middleware → Catch and format all errors
8. app.listen(8800) → Server ready to accept requests
```

### Request Lifecycle

```
HTTP Request
    ↓
Express Receives Request (port 8800)
    ↓
CORS Middleware → Check origin
    ↓
Cookie Parser → Extract token from cookies
    ↓
JSON Parser → Parse request body
    ↓
Route Match → Find matching route and controller
    ↓
Middleware Chain Execution:
    ├─ verifyToken (if route is protected)
    │   ├─ Read token from req.cookies.access_token
    │   ├─ JWT verify against process.env.JWT
    │   ├─ Attach user data to req.user
    │   └─ Call next()
    ├─ verifyUser/verifyAdmin (if authorization needed)
    │   ├─ Check if req.user.id matches param or isAdmin
    │   └─ Allow or reject
    └─ Continue to next middleware
    ↓
Controller Function Executes:
    ├─ Parse request data
    ├─ Perform database operations
    ├─ Execute business logic
    └─ Send response
    ↓
Response Sent to Client
    ├─ Status code (200, 201, 400, 401, 403, 404, 500)
    ├─ Response body (JSON data or error message)
    └─ HTTP headers (cookies if needed)
    ↓
Error Handling (if error occurs):
    ├─ Error caught by try/catch
    ├─ next(error) called
    ├─ Global error middleware catches it
    ├─ Return error response with status and message
    └─ Stack trace included (exposed - SECURITY CONCERN)
```

---

## Database Analysis

### Database Type
**MongoDB** (NoSQL, document-based)
- Hosted on MongoDB Atlas (Cloud service)
- Uses Mongoose as ODM (Object Document Mapper)

### Collections & Schemas

#### 1. **User Collection**

```javascript
{
  _id: ObjectId,
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, bcrypt hashed),
  country: String (required),
  city: String (required),
  phone: String (required),
  img: String (optional, profile image URL),
  isAdmin: Boolean (default: false),
  createdAt: DateTime (auto-generated),
  updatedAt: DateTime (auto-generated)
}
```

**Purpose**: Store user account information and authentication credentials
**Important Notes**:
- Password is hashed with bcrypt (salt rounds: 10) before storage
- `isAdmin` flag controls access to protected routes
- Timestamps track when user was created/modified

#### 2. **Hotel Collection**

```javascript
{
  _id: ObjectId,
  name: String (required),
  type: String (required, e.g., "hotel", "apartment", "resort", "villa", "cabin"),
  city: String (required),
  address: String (required),
  distance: String (required, distance from city center),
  title: String (required, short description),
  desc: String (required, detailed description),
  photos: [String] (array of image URLs),
  rating: Number (0-5, optional),
  cheapestPrice: Number (required, lowest price room in hotel),
  rooms: [ObjectId] (array of room IDs - references),
  featured: Boolean (default: false, for homepage spotlight),
  createdAt: DateTime (auto-generated),
  updatedAt: DateTime (auto-generated)
}
```

**Purpose**: Store hotel/accommodation property information
**Important Notes**:
- `rooms` is an array of Room ObjectIds (one-to-many relationship)
- `type` field supports filtering
- `cheapestPrice` is used for range queries
- No built-in timestamp fields (manual timestamps not used here)

#### 3. **Room Collection**

```javascript
{
  _id: ObjectId,
  title: String (required),
  price: Number (required, per night),
  maxPeople: Number (required, occupancy limit),
  desc: String (required, room description),
  roomNumbers: [
    {
      number: Number,
      unavailableDates: [Date]
    }
  ],
  createdAt: DateTime (auto-generated),
  updatedAt: DateTime (auto-generated)
}
```

**Purpose**: Store room details and availability information
**Important Notes**:
- `roomNumbers` is a complex nested array storing individual room numbers and their unavailable dates
- Multiple room instances can exist within a hotel (e.g., Room 101, 102, 103)
- Availability is tracked by storing dates when rooms are NOT available (booked)
- No direct reference back to hotel (many-to-one stored in hotel.rooms)

### Database Relationships

```
Hotel (1) ─── Many ─── Room
├─ One hotel contains multiple rooms
├─ Hotel.rooms stores Room._id references
└─ No direct reference from Room back to Hotel

User (1) ─── Many ─── Bookings
├─ No explicit Booking model exists yet
├─ User would need to store booking history
└─ MISSING: No user-booking relationship implemented
```

### Data Flow

1. **User Registration**
   - Client sends username, email, password, location
   - Password hashed with bcrypt
   - New document created in User collection
   - Timestamps auto-generated

2. **Hotel Creation (Admin Only)**
   - Admin sends hotel details (name, city, type, etc.)
   - Document created in Hotel collection
   - `rooms` array initialized as empty

3. **Room Creation**
   - Admin sends room details and hotel ID
   - New Room document created
   - Room._id automatically pushed into Hotel.rooms array
   - Bidirectional reference established

4. **Room Availability Update**
   - Booking system sends dates
   - Room document updated
   - Dates pushed into `roomNumbers.$.unavailableDates`
   - $ operator matches the specific room number

### Validation Logic

**In Models**:
- Required fields enforced at schema level (Mongoose validates)
- Unique constraints on username and email
- Min/Max constraints on rating (0-5)
- Type constraints on all fields

**In Controllers**:
- Minimal validation (mostly relies on MongoDB)
- No request body schema validation (SECURITY CONCERN)
- No input sanitization (SECURITY CONCERN)

**In Middleware**:
- JWT verification checks token validity
- User authorization checks ID match or admin status

---

## Authentication & Authorization

### JWT Flow

#### Registration Process
```
1. Frontend sends POST /api/auth/register
   {
     username: "john_doe",
     email: "john@example.com",
     password: "plaintext_password",
     country: "USA",
     city: "New York",
     phone: "1234567890",
     img: "photo_url" (optional)
   }

2. Backend receives request → auth.register() controller
   
3. Business Logic:
   - bcrypt.genSaltSync(10) → Create salt
   - bcrypt.hashSync(password, salt) → Hash password
   - new User({ ...body, password: hashed_password })
   - user.save() → Store in MongoDB

4. Response:
   HTTP 200
   {
     "message": "User has been created."
   }
   
5. Frontend should redirect to login
```

#### Login Process
```
1. Frontend sends POST /api/auth/login
   {
     username: "john_doe",
     password: "plaintext_password"
   }

2. Backend receives request → auth.login() controller

3. Business Logic:
   - User.findOne({ username: req.body.username })
   - If user not found → return 404 error
   - bcrypt.compare(plaintext_password, stored_hash)
   - If password incorrect → return 400 error
   - jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT)
     → Create JWT token valid for entire session (no expiration set - SECURITY CONCERN)
   - res.cookie("access_token", token, { httpOnly: true })
     → Set secure HTTP-only cookie
   - Remove password from response object
   - Return user details (without password) + isAdmin flag

4. Response:
   HTTP 200
   Set-Cookie: access_token=<JWT_TOKEN>; HttpOnly
   {
     "details": {
       _id: "...",
       username: "john_doe",
       email: "john@example.com",
       country: "USA",
       city: "New York",
       phone: "1234567890",
       img: "..."
     },
     "isAdmin": false
   }

5. Frontend stores JWT in cookies (automatic via HttpOnly)
```

### Token Structure

**JWT Payload**:
```javascript
{
  id: "user_mongodb_id",
  isAdmin: true/false
}
```

**JWT Signing**:
- Secret: `process.env.JWT` (from .env file)
- No expiration time set (tokens valid forever - SECURITY CONCERN)
- Algorithm: HS256 (default)

### Middleware Execution Order

#### 1. **verifyToken Middleware**
```javascript
export const verifyToken = (req, res, next) => {
  // 1. Extract token from HTTP cookies
  const token = req.cookies.access_token
  
  // 2. If no token → send 401 Unauthorized
  if (!token) return next(createError(401, "You are not authenticated!"))
  
  // 3. Verify token signature
  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) return next(createError(403, "Token is not valid!"))
    
    // 4. Attach decoded user to req.user
    req.user = user
    
    // 5. Continue to next middleware/controller
    next()
  })
}
```

**Returns**:
- 401: No token found
- 403: Token invalid/expired
- Success: req.user = { id, isAdmin }

#### 2. **verifyUser Middleware**
```javascript
export const verifyUser = (req, res, next) => {
  // Calls verifyToken first
  // Then checks if:
  //   - req.user.id === req.params.id (user is themselves)
  //   - OR req.user.isAdmin === true
  // Returns 403 if neither condition met
}
```

**Purpose**: Allow users to modify only their own data, admins can modify anyone

#### 3. **verifyAdmin Middleware**
```javascript
export const verifyAdmin = (req, res, next) => {
  // Calls verifyToken first
  // Then checks if:
  //   - req.user.isAdmin === true
  // Returns 403 if false
}
```

**Purpose**: Restrict operations to admins only

### Protected Routes

**Public Routes** (No middleware):
- GET `/api/auth/login` - Register user
- POST `/api/auth/login` - User login
- GET `/api/hotels` - List all hotels
- GET `/api/hotels/find/:id` - Get single hotel
- GET `/api/hotels/countByCity` - Count hotels by city
- GET `/api/hotels/countByType` - Count hotels by type
- GET `/api/rooms/:id` - Get single room
- GET `/api/rooms` - List all rooms

**User-Protected Routes** (verifyUser middleware):
- PUT `/api/users/:id` - Update own profile
- DELETE `/api/users/:id` - Delete own account
- GET `/api/users/:id` - View own profile
- GET `/api/users/checkauthentication` - Test authentication

**Admin-Protected Routes** (verifyAdmin middleware):
- GET `/api/users` - View all users
- POST `/api/hotels` - Create hotel
- PUT `/api/hotels/:id` - Update hotel
- DELETE `/api/hotels/:id` - Delete hotel
- POST `/api/rooms/:hotelid` - Create room in hotel
- PUT `/api/rooms/:id` - Update room
- DELETE `/api/rooms/:id/:hotelid` - Delete room

---

## API Documentation

### Authentication APIs

#### **1. Register User**
```
POST /api/auth/register
```

**Purpose**: Create new user account

**Middleware**: None (public)

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "mypassword123",
  "country": "USA",
  "city": "New York",
  "phone": "+1-234-567-8900",
  "img": "https://example.com/photo.jpg" // optional
}
```

**Response** (HTTP 200):
```json
{
  "message": "User has been created."
}
```

**Database Operations**:
- Hash password with bcrypt
- Create new User document
- Insert into MongoDB

**Error Handling**:
- Duplicate username/email → MongoDB error (not caught gracefully - ISSUE)
- Missing required fields → MongoDB validation error
- Database connection error → 500 error

**Status**: ✅ Working (but needs better error handling)

---

#### **2. Login User**
```
POST /api/auth/login
```

**Purpose**: Authenticate user and return JWT token

**Middleware**: None (public)

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "mypassword123"
}
```

**Response** (HTTP 200):
```json
{
  "details": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "country": "USA",
    "city": "New York",
    "phone": "+1-234-567-8900",
    "img": "https://example.com/photo.jpg",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "isAdmin": false
}
```

**Cookies Set**:
- `access_token`: JWT token (HttpOnly, Secure flag)

**Database Operations**:
- Query User by username
- Compare password with stored hash
- Generate JWT token
- No database write

**Validation**:
- Username not found → 404 error
- Password incorrect → 400 error

**Status**: ✅ Working (but token has no expiration)

---

### User Management APIs

#### **3. Update User Profile**
```
PUT /api/users/:id
```

**Purpose**: Update user information

**Middleware**: verifyUser (user can only update own profile, or admin can update anyone)

**Request Body** (any fields to update):
```json
{
  "username": "new_username",
  "email": "newemail@example.com",
  "city": "Los Angeles",
  "phone": "+1-555-123-4567",
  "img": "new_photo_url"
}
```

**Response** (HTTP 200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "new_username",
  "email": "newemail@example.com",
  "country": "USA",
  "city": "Los Angeles",
  "phone": "+1-555-123-4567",
  "img": "new_photo_url",
  "password": "hashed_password",
  "isAdmin": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T14:20:00.000Z"
}
```

**Database Operations**:
- User.findByIdAndUpdate() with $set operator
- Returns updated document

**Validation**:
- ID doesn't exist → User not found (returns null, then error)
- Authorization check → 403 if not self and not admin

**Security Concerns**: 
- No input validation/sanitization
- Cannot prevent admin flag manipulation by admin
- No password change validation

**Status**: ⚠️ Partial (works but missing validations)

---

#### **4. Delete User Account**
```
DELETE /api/users/:id
```

**Purpose**: Permanently delete user and all associated data

**Middleware**: verifyUser (can only delete own account, or admin)

**Request Body**: None

**Response** (HTTP 200):
```json
"User has been deleted."
```

**Database Operations**:
- User.findByIdAndDelete()
- Cascading delete NOT implemented (user's bookings/reviews remain if they existed)

**Validation**:
- Authorization check → 403 if not self and not admin
- ID must exist

**Status**: ✅ Working (but no cascade cleanup)

---

#### **5. Get Single User**
```
GET /api/users/:id
```

**Purpose**: Retrieve user profile information

**Middleware**: verifyUser (can view own profile, or admin)

**Request Body**: None

**Response** (HTTP 200):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "country": "USA",
  "city": "New York",
  "phone": "+1-234-567-8900",
  "img": "profile_photo_url",
  "isAdmin": false,
  "password": "bcrypt_hash",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Database Operations**:
- User.findById()
- Single query, no filtering

**Security Concern**: Password hash is returned (should be excluded)

**Status**: ⚠️ Partial (works but exposes password hash)

---

#### **6. Get All Users**
```
GET /api/users
```

**Purpose**: List all users in system

**Middleware**: verifyAdmin (admin only)

**Request Body**: None

**Response** (HTTP 200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    ...
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "username": "jane_doe",
    "email": "jane@example.com",
    ...
  }
]
```

**Database Operations**:
- User.find() with no filter
- Returns ALL users (no pagination - PERFORMANCE CONCERN)

**Status**: ⚠️ Partial (works but no pagination)

---

### Hotel Management APIs

#### **7. Create Hotel**
```
POST /api/hotels
```

**Purpose**: Create new hotel property listing

**Middleware**: verifyAdmin (admin only)

**Request Body**:
```json
{
  "name": "Grand Plaza Hotel",
  "type": "hotel",
  "city": "New York",
  "address": "123 Main Street, New York, NY 10001",
  "distance": "2km from city center",
  "title": "Luxury 5-star hotel in Manhattan",
  "desc": "Modern luxury hotel with world-class amenities...",
  "photos": [
    "https://example.com/hotel1.jpg",
    "https://example.com/hotel2.jpg"
  ],
  "rating": 4.8,
  "cheapestPrice": 150
}
```

**Response** (HTTP 200):
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Grand Plaza Hotel",
  "type": "hotel",
  "city": "New York",
  "address": "123 Main Street, New York, NY 10001",
  "distance": "2km from city center",
  "title": "Luxury 5-star hotel in Manhattan",
  "desc": "Modern luxury hotel with world-class amenities...",
  "photos": ["url1", "url2"],
  "rating": 4.8,
  "cheapestPrice": 150,
  "rooms": [],
  "featured": false
}
```

**Database Operations**:
- new Hotel(req.body)
- hotel.save()

**Validation**:
- Required fields enforced by Mongoose schema

**Status**: ✅ Working

---

#### **8. Update Hotel**
```
PUT /api/hotels/:id
```

**Purpose**: Modify hotel information

**Middleware**: verifyAdmin (admin only)

**Request Body**: Any fields to update

**Response**: Updated hotel document

**Database Operations**:
- Hotel.findByIdAndUpdate() with $set operator

**Status**: ✅ Working

---

#### **9. Delete Hotel**
```
DELETE /api/hotels/:id
```

**Purpose**: Remove hotel from system

**Middleware**: verifyAdmin (admin only)

**Response** (HTTP 200):
```json
"Hotel has been deleted."
```

**Database Operations**:
- Hotel.findByIdAndDelete()

**Cascade Issue**: Associated rooms are NOT deleted, only removed from hotel.rooms array

**Status**: ⚠️ Partial (orphaned rooms remain)

---

#### **10. Get Single Hotel**
```
GET /api/hotels/find/:id
```

**Purpose**: Retrieve detailed hotel information

**Middleware**: None (public)

**Response** (HTTP 200):
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Grand Plaza Hotel",
  "type": "hotel",
  "city": "New York",
  ...
  "rooms": ["room_id_1", "room_id_2"],
  ...
}
```

**Database Operations**:
- Hotel.findById()

**Status**: ✅ Working

---

#### **11. Get All Hotels**
```
GET /api/hotels
```

**Purpose**: Search and filter hotels

**Middleware**: None (public)

**Query Parameters**:
```
GET /api/hotels?city=New%20York&min=100&max=300&limit=10&type=hotel
```

- `city`: Filter by city name
- `min`: Minimum price filter
- `max`: Maximum price filter
- `limit`: Max results to return
- `type`: Filter by property type
- Other fields: Can filter by any hotel field

**Response** (HTTP 200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "name": "Grand Plaza Hotel",
    "cheapestPrice": 150,
    "city": "New York",
    ...
  }
]
```

**Database Operations**:
```javascript
Hotel.find({
  ...others,           // All query params except min/max/limit
  cheapestPrice: { 
    $gt: min || 1,    // Greater than (min defaults to 1)
    $lt: max || 99999 // Less than (max defaults to 99999)
  }
}).limit(limit)
```

**Issues**:
- Logic bug: `min | 1` should be `min || 1` (bitwise OR vs logical OR)
- Allows filtering by any field (could expose internal fields)
- No pagination support (only limit)

**Status**: ⚠️ Partial (works but has bug)

---

#### **12. Count Hotels by City**
```
GET /api/hotels/countByCity?cities=New%20York,Los%20Angeles,Chicago
```

**Purpose**: Get number of hotels in specified cities (for homepage stats)

**Middleware**: None (public)

**Query Parameters**:
- `cities`: Comma-separated list of city names

**Response** (HTTP 200):
```json
[5, 3, 2]  // Array of counts matching cities order
```

**Database Operations**:
```javascript
cities.map(city => Hotel.countDocuments({ city: city }))
Promise.all(...)
```

**Status**: ✅ Working

---

#### **13. Count Hotels by Type**
```
GET /api/hotels/countByType
```

**Purpose**: Get distribution of property types (for homepage stats)

**Middleware**: None (public)

**Request**: No parameters

**Response** (HTTP 200):
```json
[
  { "type": "hotel", "count": 45 },
  { "type": "apartments", "count": 32 },
  { "type": "resorts", "count": 18 },
  { "type": "villas", "count": 12 },
  { "type": "cabins", "count": 8 }
]
```

**Database Operations**: Separate countDocuments() for each type

**Status**: ✅ Working

---

#### **14. Get Hotel Rooms**
```
GET /api/hotels/room/:id
```

**Purpose**: Retrieve all rooms belonging to a hotel

**Middleware**: None (public)

**Response** (HTTP 200):
```json
[
  {
    "_id": "room_id_1",
    "title": "Deluxe Double Room",
    "price": 150,
    "maxPeople": 2,
    "desc": "Spacious room with king bed...",
    "roomNumbers": [
      { "number": 101, "unavailableDates": [] },
      { "number": 102, "unavailableDates": ["2024-01-20", "2024-01-21"] }
    ]
  },
  ...
]
```

**Database Operations**:
```javascript
hotel = Hotel.findById(id)
hotel.rooms.map(roomId => Room.findById(roomId))
Promise.all(...)
```

**Status**: ✅ Working

---

### Room Management APIs

#### **15. Create Room**
```
POST /api/rooms/:hotelid
```

**Purpose**: Create new room and add to hotel

**Middleware**: verifyAdmin (admin only)

**URL Parameters**:
- `hotelid`: Hotel ID to add room to

**Request Body**:
```json
{
  "title": "Deluxe Double Room",
  "price": 150,
  "maxPeople": 2,
  "desc": "Spacious room with king bed and modern amenities",
  "roomNumbers": [
    { "number": 101, "unavailableDates": [] },
    { "number": 102, "unavailableDates": [] },
    { "number": 103, "unavailableDates": [] }
  ]
}
```

**Response** (HTTP 200):
```json
{
  "_id": "room_id_1",
  "title": "Deluxe Double Room",
  "price": 150,
  "maxPeople": 2,
  "desc": "Spacious room with king bed...",
  "roomNumbers": [
    { "_id": "...", "number": 101, "unavailableDates": [] },
    ...
  ],
  "createdAt": "2024-01-16T12:00:00.000Z",
  "updatedAt": "2024-01-16T12:00:00.000Z"
}
```

**Database Operations**:
1. new Room(req.body)
2. room.save()
3. Hotel.findByIdAndUpdate() → $push saved room ID to rooms array

**Error Handling**: If hotel update fails, room is already created (orphaned)

**Status**: ⚠️ Partial (works but no transaction rollback)

---

#### **16. Update Room**
```
PUT /api/rooms/:id
```

**Purpose**: Modify room details (price, description, etc.)

**Middleware**: verifyAdmin (admin only)

**Response**: Updated room document

**Database Operations**:
- Room.findByIdAndUpdate()

**Status**: ✅ Working

---

#### **17. Update Room Availability**
```
PUT /api/rooms/availability/:id
```

**Purpose**: Mark room as unavailable for specific dates (booking)

**Middleware**: None (SECURITY ISSUE - should be protected)

**Request Body**:
```json
{
  "dates": ["2024-01-20", "2024-01-21", "2024-01-22"]
}
```

**Response** (HTTP 200):
```json
"Room status has been updated."
```

**Database Operations**:
```javascript
Room.updateOne(
  { "roomNumbers._id": req.params.id },
  {
    $push: {
      "roomNumbers.$.unavailableDates": req.body.dates
    }
  }
)
```

**Security Concerns**:
- No authentication middleware (public route)
- Anyone can mark any room as unavailable
- No validation of dates format

**Status**: ⚠️ Buggy (missing authorization, no validation)

---

#### **18. Delete Room**
```
DELETE /api/rooms/:id/:hotelid
```

**Purpose**: Remove room from hotel

**Middleware**: verifyAdmin (admin only)

**URL Parameters**:
- `id`: Room ID
- `hotelid`: Hotel ID

**Response** (HTTP 200):
```json
"Room has been deleted."
```

**Database Operations**:
1. Room.findByIdAndDelete()
2. Hotel.findByIdAndUpdate() → $pull room ID from rooms array

**Status**: ✅ Working

---

#### **19. Get Single Room**
```
GET /api/rooms/:id
```

**Purpose**: Retrieve room details

**Middleware**: None (public)

**Response**: Room document with availability info

**Status**: ✅ Working

---

#### **20. Get All Rooms**
```
GET /api/rooms
```

**Purpose**: List all rooms in system

**Middleware**: None (public)

**Response**: Array of all room documents

**Issues**:
- No pagination (returns all rooms)
- No filtering

**Status**: ⚠️ Partial

---

## Middleware Analysis

### Middleware Execution Order

```
Request Arrives
    ↓
1. cors() 
   - Checks if request origin is allowed
   - Sets CORS headers
   ↓
2. cookieParser()
   - Parses cookies from request headers
   - Makes cookies available in req.cookies
   ↓
3. express.json()
   - Parses JSON body
   - Makes body available in req.body
   ↓
4. Route Matching
   - Finds appropriate route handler
   ↓
5. Route-Specific Middleware (if any)
   ├─ verifyToken → Extracts and validates JWT
   ├─ verifyUser → Checks user authorization
   └─ verifyAdmin → Checks admin authorization
   ↓
6. Controller Function
   - Business logic execution
   ↓
7. Global Error Middleware (if error thrown)
   - Formats error response
   - Sends error to client
```

### Middleware Details

#### **CORS Middleware** (cors)
- **Package**: `cors@2.8.5`
- **Configuration**: Default (allows all origins)
- **Function**: Enables frontend to call backend from different domain

#### **Cookie Parser Middleware** (cookieParser)
- **Package**: `cookie-parser@1.4.6`
- **Configuration**: Default
- **Function**: Parses HTTP cookies into `req.cookies` object
- **Used For**: Extracting JWT token from cookies

#### **JSON Parser Middleware** (express.json)
- **Package**: Express built-in
- **Configuration**: Default
- **Function**: Parses JSON request body into `req.body`

#### **Token Verification Middleware** (verifyToken)
- **File**: `utils/verifyToken.js`
- **When Used**: Protected routes
- **Flow**:
  1. Read `req.cookies.access_token`
  2. Verify JWT signature using `process.env.JWT`
  3. If valid → attach decoded payload to `req.user`
  4. If invalid → throw 403 error

#### **User Verification Middleware** (verifyUser)
- **File**: `utils/verifyToken.js`
- **When Used**: User profile routes (update, delete, get single)
- **Flow**:
  1. Call verifyToken
  2. Check if `req.user.id === req.params.id` OR `req.user.isAdmin`
  3. If authorized → proceed
  4. If not → throw 403 error

#### **Admin Verification Middleware** (verifyAdmin)
- **File**: `utils/verifyToken.js`
- **When Used**: Admin-only routes (hotel CRUD, room CRUD, get all users)
- **Flow**:
  1. Call verifyToken
  2. Check if `req.user.isAdmin === true`
  3. If authorized → proceed
  4. If not → throw 403 error

#### **Global Error Middleware**
- **Location**: `index.js`, registered last
- **Function**: Catches all errors and formats response
- **Response Format**:
  ```json
  {
    "success": false,
    "status": 500,
    "message": "Something went wrong!",
    "stack": "Error stack trace..."
  }
  ```
- **Security Issue**: Exposes full stack trace to client (should only in development)

---

## Business Logic

### Core Business Operations

#### **User Authentication Flow**
1. New user provides registration details
2. Password is hashed with bcryptjs (10 salt rounds)
3. User document created and persisted
4. User can then login with username + password
5. On successful login, JWT token issued
6. Token stored in HTTP-only cookie
7. Subsequent requests include token for authorization

#### **Hotel Management Flow**
1. Admin creates hotel property with details
2. Hotel gets unique MongoDB ID
3. Hotel rooms array initialized empty
4. Admin creates room(s) associated with hotel
5. Room ID automatically added to hotel.rooms
6. Users can search/filter hotels by city, price, type
7. Users can view detailed hotel info including all rooms

#### **Room & Availability Management Flow**
1. Admin creates room with price, capacity, description
2. Room can have multiple physical room numbers (e.g., 101, 102, 103)
3. Each room number tracks dates when it's unavailable
4. When user books, unavailable dates are added to room
5. Frontend can check availability before showing booking option
6. Multiple bookings for same room on different dates allowed

#### **Search & Filter Logic**
```javascript
// Example search request
GET /api/hotels?city=New%20York&min=100&max=300&type=hotel&limit=10

// Database query built:
Hotel.find({
  city: "New York",
  type: "hotel",
  cheapestPrice: {
    $gt: 100,
    $lt: 300
  }
}).limit(10)
```

This allows users to:
- Find hotels in specific city
- Filter by price range
- Filter by property type
- Limit results for pagination

#### **Role-Based Access Control**
```
Regular User:
├─ Can register/login
├─ Can view public hotels and rooms
├─ Can update own profile
├─ Can delete own account
└─ Can check own authentication

Admin User:
├─ Can do everything a regular user can
├─ Can create hotels
├─ Can update/delete hotels
├─ Can create rooms
├─ Can update/delete rooms
├─ Can update room availability
└─ Can view all users
```

---

## Error Handling System

### Error Creation
```javascript
// utils/error.js - Utility function
export const createError = (status, message) => {
  const err = new Error();
  err.status = status;
  err.message = message;
  return err;
};

// Usage
return next(createError(404, "User not found!"))
```

### Try/Catch Implementation

**Pattern Used Throughout**:
```javascript
export const someController = async (req, res, next) => {
  try {
    // Database operation
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    // Pass to global error middleware
    next(err);
  }
};
```

**Issues**:
- Minimal error handling
- All errors passed to global middleware
- No specific error messages for different scenarios
- No input validation errors

### Global Error Middleware

```javascript
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,  // SECURITY ISSUE: Exposes implementation details
  });
});
```

**Issues**:
1. **Stack Trace Exposure**: `err.stack` sent to client (security risk)
2. **No Error Logging**: Errors not logged to file/service
3. **No Error Tracking**: Can't monitor system issues
4. **Generic Messages**: Users see technical details

### Validation Flow

**Current Approach**: Minimal validation
- Mongoose schema enforces required fields
- Type casting happens automatically
- No input sanitization
- No format validation (email, phone, dates)

**Missing Validations**:
- Email format validation
- Phone number format
- Date format validation (for availability)
- String length limits
- Password strength requirements
- Request body schema validation

### Error Scenarios

| Scenario | Current Handling | Status |
|----------|------------------|--------|
| User not found | MongoDB returns null, not caught | ❌ Issue |
| Duplicate email | MongoDB duplicate key error | ❌ Not handled |
| Invalid JWT | 403 error | ✅ Working |
| Missing auth token | 401 error | ✅ Working |
| Unauthorized access | 403 error | ✅ Working |
| Invalid ObjectId format | MongoDB error | ❌ Not caught |
| Database connection error | Unhandled | ❌ Critical |
| Invalid JSON body | Express error | ⚠️ Generic |

---

## Environment Variables

### Current Environment Variables

File: `.env`

```
MONGO = mongodb+srv://shruti:shruti123@cluster0.trldb9b.mongodb.net/
JWT = 8hEnPGeoBqGUT6zksxt4G95gW+uMdzwe7EVaRnp0xRI=
```

### Environment Variable Analysis

#### **MONGO**
- **Purpose**: MongoDB connection string
- **Type**: Database URI
- **Value**: MongoDB Atlas cloud connection
- **Format**: `mongodb+srv://username:password@cluster.mongodb.net/`
- **Security Concern**: Credentials hardcoded in .env (should use environment)
- **Used In**: `index.js` - mongoose.connect()

#### **JWT**
- **Purpose**: Secret key for JWT signing/verification
- **Type**: String (base64 encoded)
- **Value**: Long random string
- **Security Concern**: 
  - Secret exposed in version control if .env committed
  - Should be longer/stronger
  - Same secret used for all operations (should rotate)
- **Used In**: `verifyToken.js`, `auth.js` - jwt.sign(), jwt.verify()

### Missing Environment Variables

Should be added:
- `NODE_ENV`: development/production/testing
- `PORT`: Server port (hardcoded to 8800)
- `DB_NAME`: MongoDB database name
- `JWT_EXPIRE`: Token expiration time
- `CORS_ORIGIN`: Allowed frontend domain
- `LOG_LEVEL`: Error logging level

---

## Dependency Analysis

### Production Dependencies

#### **express** (v4.18.2)
- **Purpose**: Web framework for building REST API
- **Why Used**: Industry standard, lightweight, flexible
- **Key Features**: Routing, middleware, request/response handling
- **Alternative**: Fastify, Koa
- **Used For**: API server, route management, middleware

#### **mongoose** (v7.1.1)
- **Purpose**: MongoDB object modeling (ODM)
- **Why Used**: Schema validation, type safety, query building
- **Key Features**: Schema definitions, validation, middleware hooks
- **Alternative**: Native MongoDB driver, TypeORM
- **Used For**: User, Hotel, Room models; database queries

#### **jsonwebtoken** (v9.0.0)
- **Purpose**: JWT token creation and verification
- **Why Used**: Standard authentication method for APIs
- **Key Features**: Sign, verify, decode tokens
- **Used For**: User authentication in login, token verification middleware

#### **bcryptjs** (v2.4.3)
- **Purpose**: Password hashing and comparison
- **Why Used**: Industry standard for secure password storage
- **Key Features**: Salt-based hashing, async/sync methods
- **Security**: Uses salt rounds of 10 for good security
- **Used For**: Hashing passwords on registration, comparing on login

#### **cookie-parser** (v1.4.6)
- **Purpose**: Parse HTTP request cookies
- **Why Used**: Needed to extract JWT from cookies
- **Used For**: Reading access_token from cookie headers

#### **cors** (v2.8.5)
- **Purpose**: Cross-Origin Resource Sharing middleware
- **Why Used**: Allow frontend to call backend from different domain
- **Current Config**: Allows all origins (should be restricted)
- **Used For**: Middleware to set CORS headers

#### **dotenv** (v16.0.3)
- **Purpose**: Load environment variables from .env file
- **Why Used**: Configuration management, secrets handling
- **Used For**: Loading MONGO and JWT from .env in index.js

### Development Dependencies

#### **nodemon** (v2.0.22)
- **Purpose**: Auto-reload server on file changes
- **Why Used**: Improves development experience
- **Configuration**: Runs with npm start
- **Used For**: Development only (npm start)

### Missing But Recommended Dependencies

- **joi / yup**: Request body validation
- **winston / pino**: Structured logging
- **helmet**: Security headers
- **rate-limit**: Rate limiting
- **compression**: Response compression
- **swagger**: API documentation
- **jest / mocha**: Testing framework
- **eslint**: Code linting
- **prettier**: Code formatting

---

## Incomplete Features

### 1. **Booking/Reservation System** (⚠️ Partially Incomplete)
**Status**: Room availability tracking exists, but no booking model
- ✅ Room availability tracking with unavailable dates
- ✅ API endpoint to update room availability
- ❌ No Booking/Reservation model
- ❌ No booking history tracking
- ❌ No payment integration
- ❌ No confirmation emails
- ❌ No booking cancellation logic

**Required Implementation**:
```javascript
// Missing model
const BookingSchema = {
  userId: ObjectId,
  hotelId: ObjectId,
  roomId: ObjectId,
  checkInDate: Date,
  checkOutDate: Date,
  numberOfGuests: Number,
  totalPrice: Number,
  status: enum(pending, confirmed, cancelled),
  paymentStatus: enum(pending, completed, refunded),
  createdAt: DateTime
}
```

### 2. **Reviews & Ratings** (❌ Not Implemented)
- No Review model
- No route for submitting reviews
- No route for fetching reviews
- Hotel ratings are stored but hardcoded/unrelated to actual reviews

**Missing Functionality**:
- User review submission
- Star rating system
- Review moderation
- Review editing/deletion

### 3. **Search Recommendations** (❌ Not Implemented)
- No recommendation engine
- No search history tracking
- No personalized suggestions
- No trending hotels

### 4. **Advanced Filtering** (⚠️ Incomplete)
- Only basic filters exist (city, price, type)
- Missing: amenities filter, rating filter, distance filter
- Missing: advanced search (date range validation)
- Missing: multi-city search

### 5. **Payment Integration** (❌ Not Implemented)
- No Stripe/PayPal integration
- No payment processing
- No invoice generation
- No refund handling

**Required**:
- Payment gateway integration
- Order/Payment models
- Payment confirmation API
- Refund logic

### 6. **Email Notifications** (❌ Not Implemented)
- No email sending functionality
- No confirmation emails
- No password reset emails
- No booking reminders

**Required**:
- Email service (nodemailer, SendGrid, etc.)
- Email templates
- Background job queue

### 7. **Password Reset** (❌ Not Implemented)
- No forgot password endpoint
- No password reset token
- No email verification

### 8. **User Verification** (❌ Not Implemented)
- No email verification on registration
- No phone verification
- No ID verification for hosts

### 9. **Admin Features** (⚠️ Incomplete)
- No admin dashboard
- No analytics/reports
- No user management UI endpoint
- No moderation tools
- Commented out: `/api/users/checkadmin/:id` endpoint

### 10. **Images/File Uploads** (❌ Not Implemented)
- Only URLs stored, no actual upload handling
- No image validation
- No CDN integration
- No compression/optimization

### 11. **Search History** (❌ Not Implemented)
- No tracking of user searches
- No popular searches
- No recent searches

### 12. **Wishlist/Favorites** (❌ Not Implemented)
- No user favorites system
- No wishlist model
- No wishlist API

### 13. **Multi-language Support** (❌ Not Implemented)
- All strings hardcoded in English
- No i18n library

### 14. **Pagination** (⚠️ Incomplete)
- `/api/users` has no pagination
- `/api/rooms` has no pagination
- Only limit parameter available, no offset/page

**Bug** in getHotels:
```javascript
cheapestPrice: { $gt: min | 1, $lt: max || 99999 }
// Should be: $gt: min || 1  (bitwise OR should be logical OR)
```

### 15. **Commented Code**
In routes/users.js:
```javascript
// router.get("/checkadmin/:id", verifyAdmin, (req,res,next)=>{
//   res.send("hello admin, you are logged in and you can delete all accounts")
// })
```

This suggests admin check endpoint was planned but disabled.

---

## Pending Work

This section lists the remaining tasks needed to meet the synopsis and complete the backend product.

### Critical Pending Tasks
- Implement a full `Booking` model and booking API endpoints
- Add secure payment integration (Stripe/PayPal) and payment confirmation flows
- Protect booking/availability endpoints with authentication and authorization
- Add JWT expiration and secure cookie flags
- Prevent admin privilege escalation during user update
- Remove stack trace output from production error responses

### Required Feature Work
- Build Host role workflows and separate Host/Guest/Admin RBAC
- Add review and rating models, endpoints, and moderation controls
- Implement property listing enhancements: amenities, pricing calendars, verified hosts
- Add file/image upload support for hotels and rooms
- Implement email verification, forgotten password flow, and notification emails
- Add pagination and filtering for user/room listing endpoints

### Quality and Security Work
- Add input validation with Joi/Yup or express-validator
- Restrict CORS origins instead of allowing all
- Add rate limiting for login and sensitive APIs
- Implement request size limits and basic security headers (helmet)
- Add structured logging and error monitoring
- Handle MongoDB connection and invalid ObjectId errors gracefully

### Deployment and Maintenance Work
- Externalize port and runtime configuration using `PORT` and `NODE_ENV`
- Add production deployment configuration or Docker support
- Add API documentation (Swagger/OpenAPI)
- Add tests: unit, integration, and API-level regression tests
- Add backup/monitoring readiness and production readiness checklist

---

## Implementation Roadmap

This roadmap is organized into prioritized code tasks.

### Phase 1 — Critical Hardening (Week 1)
1. Update `index.js` and `.env` usage:
   - Add `PORT`, `NODE_ENV`, `JWT_EXPIRE`, `CORS_ORIGIN`.
   - Use `app.listen(process.env.PORT || 8800)`.
   - Use `app.use(cors({ origin: process.env.CORS_ORIGIN }))`.
   - Use `express.json({ limit: '10kb' })`.
   - Add `helmet` and `cookie-parser` secure options if installed.
2. Fix authentication and response security:
   - Update `auth.js` to sign JWT with `{ expiresIn: process.env.JWT_EXPIRE || '24h' }`.
   - Mark cookie with `secure: true`, `sameSite: 'strict'`, and `httpOnly: true` in login response.
   - Update `verifyToken.js` to handle invalid token errors consistently.
3. Harden user routes and model updates:
   - In `controllers/user.js`, filter `req.body` to exclude `isAdmin` and `password` fields on update.
   - Exclude password from all user responses using `.select('-password')` or manual removal.
   - Fix the `getHotels` query bug to use `min || 1`.
4. Improve global error handling:
   - Modify `index.js` error middleware to hide `err.stack` in production and return generic messages.
   - Add logging for errors to console or file.
5. Protect booking-related endpoints:
   - Add `verifyToken` or `verifyUser` middleware to `router.put('/availability/:id', ...)` in `routes/rooms.js`.
   - Ensure only authenticated users can update availability.

### Phase 2 — Request Validation and API Stability (Week 1-2)
1. Add validation middleware:
   - Install and use `express-validator` or `joi`.
   - Validate request bodies for `register`, `login`, `createHotel`, `createRoom`, `updateUser`, `updateRoomAvailability`.
   - Enforce email format, password length, required fields, and date array validation.
2. Improve route responses and error handling:
   - Return consistent JSON error structure for validation failures.
   - Catch and handle invalid MongoDB ObjectId errors in controllers.
   - Return 404 when requested resources do not exist.
3. Add pagination support:
   - Add `limit` and `page` query handling to `GET /api/users`, `GET /api/rooms`, and `GET /api/hotels`.
   - Return metadata: `total`, `page`, `limit`.
4. Add rate limiting:
   - Install `express-rate-limit`.
   - Apply to login and auth endpoints.
   - Apply a general rate limiter for all API routes.

### Phase 3 — Booking Core and Data Models (Week 2-3)
1. Create `models/Booking.js`:
   - Fields: `userId`, `hotelId`, `roomId`, `roomNumberId`, `checkInDate`, `checkOutDate`, `totalPrice`, `guests`, `status`, `paymentStatus`, `createdAt`.
   - Include references to `User`, `Hotel`, and `Room`.
2. Create booking controllers:
   - `createBooking(req, res, next)` to reserve room dates and persist booking.
   - `getBooking(req, res, next)` to retrieve a single booking.
   - `getUserBookings(req, res, next)` for logged-in users.
   - `cancelBooking(req, res, next)` with date rollback if needed.
3. Update room availability flow:
   - Use booking creation to write unavailable dates to `Room.roomNumbers` instead of direct availability endpoint.
   - Verify date conflicts before saving.
   - Use atomic update or transaction logic to avoid race conditions.
4. Add booking routes in `routes/rooms.js` or a new `routes/bookings.js`:
   - `POST /api/bookings` for new booking
   - `GET /api/bookings/user/:id` for user bookings
   - `PUT /api/bookings/:id/cancel` for cancellation

### Phase 4 — Role-Based Access Control and Ownership (Week 3)
1. Update `models/User.js`:
   - Add `role: { type: String, enum: ['guest', 'host', 'admin'], default: 'guest' }`.
2. Update middleware in `utils/verifyToken.js`:
   - Add `verifyHost` and `verifyRole(role)` helpers.
   - Support `req.user.role` authorization checks.
3. Add host ownership to property models:
   - Add `owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }` to `Hotel`.
   - Optionally add `hotelId` to `Room` for easier reverse lookup.
4. Update hotel/room creation flows:
   - Allow hosts to create hotels/rooms they own.
   - Allow admins to manage all content.
   - Restrict update/delete to owners or admins.
5. Add host-specific API capabilities:
   - `GET /api/hotels/owner/:ownerId`
   - `GET /api/rooms/hotel/:hotelId`

### Phase 5 — Reviews, Ratings, and Listing Enhancements (Week 4)
1. Create `models/Review.js`:
   - Fields: `userId`, `hotelId`, `rating`, `comment`, `verifiedStay`, `reported`, `createdAt`.
2. Create review routes and controllers:
   - `POST /api/reviews` to submit review
   - `GET /api/hotels/:id/reviews` to list reviews
   - `PUT /api/reviews/:id/report` to flag abuse
3. Update hotel rating aggregation:
   - Calculate average rating from reviews.
   - Store or compute rating when fetching hotel details.
4. Add listing fields:
   - Extend `Hotel` schema with `amenities`, `rules`, `availabilityCalendar`, `verified`.
   - Add `Room` fields for `bedType`, `size`, and `images` if needed.

### Phase 6 — Payments, Notifications, and Production Readiness (Week 5-6)
1. Add payment integration:
   - Add `models/Payment.js` or extend `Booking` with `paymentDetails`.
   - Integrate Stripe test mode or a payment placeholder.
   - Create `POST /api/payments` and `POST /api/bookings/confirm`.
2. Add email and notification support:
   - Install `nodemailer` or use SendGrid.
   - Add email templates for registration, booking confirmation, cancellation.
   - Add `utils/email.js` to send emails asynchronously.
3. Add uploads support:
   - Add image upload logic using Cloudinary or local storage.
   - Accept image data in hotel/room creation endpoints.
4. Production deployment and documentation:
   - Add `Dockerfile` and optional `docker-compose.yml`.
   - Add Swagger or OpenAPI docs.
   - Add `README` deployment section.
   - Add CI/CD pipeline notes or GitHub Actions config.

### Phase 7 — Testing and Quality Assurance (Week 6+)
1. Add automated tests:
   - Install `jest` and `supertest`.
   - Write tests for auth, hotel, room, booking, and review endpoints.
   - Add integration tests for protected routes and error cases.
2. Add linting and formatting:
   - Install `eslint` and `prettier`.
   - Create rules for consistent code style.
3. Add monitoring and backup readiness:
   - Add health-check route.
   - Add instructions for MongoDB backups.
   - Add logging and alert guidance.

---

## Security Analysis

### Critical Issues

#### **1. Token Expiration Not Set** 🔴 CRITICAL
```javascript
// In controllers/auth.js
const token = jwt.sign(
  { id: user._id, isAdmin: user.isAdmin },
  process.env.JWT
  // Missing: expiresIn: "24h"
);
```

**Issue**: Tokens are valid forever
**Impact**: Compromised token remains valid indefinitely
**Fix**: Add `{ expiresIn: "24h" }` as third parameter

#### **2. Stack Trace Exposed to Client** 🔴 CRITICAL
```javascript
// In index.js global error middleware
return res.status(errorStatus).json({
  success: false,
  status: errorStatus,
  message: errorMessage,
  stack: err.stack,  // ⚠️ EXPOSES IMPLEMENTATION DETAILS
});
```

**Issue**: Error stack traces sent in responses
**Impact**: Attacker learns about code structure and dependencies
**Fix**: Only show stack in development, generic message in production

#### **3. Room Availability Not Protected** 🔴 HIGH
```javascript
// In routes/rooms.js
router.put("/availability/:id", updateRoomAvailability);
// NO verifyAdmin or verifyToken middleware
```

**Issue**: Anyone can mark any room as unavailable without authentication
**Impact**: Users can block rooms without booking, DOS attack possible
**Fix**: Add `verifyAdmin` or `verifyToken` middleware

#### **4. Database Credentials in .env** 🔴 HIGH
```
MONGO = mongodb+srv://shruti:shruti123@cluster0.trldb9b.mongodb.net/
```

**Issue**: Real credentials visible in .env
**Impact**: If .env committed to repo, anyone can access database
**Fix**: Use environment-specific secrets manager, never commit .env

#### **5. CORS Allows All Origins** 🟡 MEDIUM
```javascript
// In index.js
app.use(cors())  // Default: allows all origins
```

**Issue**: Any domain can call this API
**Impact**: CSRF attacks possible, API open to abuse
**Fix**: Specify allowed origins: `cors({ origin: process.env.FRONTEND_URL })`

#### **6. No Input Validation** 🟡 MEDIUM
**Issue**: No request body schema validation
**Example**:
```javascript
// User can send anything
POST /api/auth/register
{
  username: 123,  // Should be string
  email: "not-an-email",
  password: "",
  country: "",
  city: "",
  phone: "",
  img: "malicious-script-url",
  isAdmin: true  // User can set themselves as admin!
}
```

**Impact**: Data corruption, privilege escalation possible
**Fix**: Use joi/yup for schema validation

#### **7. Password Returned in Update Response** 🟡 MEDIUM
```javascript
// In controllers/user.js - getUser
const user = await User.findById(req.params.id);
res.status(200).json(user);  // Returns hashed password
```

**Issue**: Password hash exposed in API responses
**Impact**: Even hashed password shouldn't be sent
**Fix**: Exclude password field before sending: `user.select('-password')`

#### **8. No Rate Limiting** 🟡 MEDIUM
**Issue**: No protection against brute force attacks
**Example**: Attacker can try unlimited login attempts
**Fix**: Implement rate limiting middleware

#### **9. No SQL Injection Protection** 🟢 LOW
- Using Mongoose (safe from SQL injection)
- But NoSQL injection possible if not careful
- Currently not vulnerable but could be with unsanitized query params

#### **10. User Can Modify Own isAdmin Flag** 🟡 MEDIUM
```javascript
// In controllers/user.js
const updatedUser = await User.findByIdAndUpdate(
  req.params.id,
  { $set: req.body },  // User can include isAdmin: true
  { new: true }
);
```

**Issue**: User can set `{ isAdmin: true }` in update request
**Impact**: User can escalate to admin
**Fix**: Explicitly exclude admin fields from update: 
```javascript
const { isAdmin, ...safeBody } = req.body;
```

#### **11. No HTTPS Enforced** 🟡 MEDIUM
**Issue**: Cookie not marked as Secure flag
```javascript
res.cookie("access_token", token, {
  httpOnly: true
  // Missing: secure: true (for HTTPS only)
});
```

**Impact**: Cookie sent over HTTP (can be intercepted)
**Fix**: Add `secure: true` and enforce HTTPS in production

#### **12. No CSRF Protection** 🟡 MEDIUM
**Issue**: No CSRF tokens or SameSite cookie attribute
**Fix**: Add SameSite: Strict to cookies

#### **13. Error Messages Leak Information** 🟡 MEDIUM
```javascript
// In auth.js
if (!user) return next(createError(404, "User not found!"));
```

**Issue**: Message reveals whether username exists
**Impact**: Attacker can enumerate valid usernames
**Fix**: Use generic message: "Invalid credentials"

#### **14. No Request Size Limits** 🟡 MEDIUM
**Issue**: No limit on JSON body size
**Impact**: Large payloads could cause DOS
**Fix**: Use `express.json({ limit: '10kb' })`

#### **15. Sensitive Data in Logs** 🟡 MEDIUM
**Issue**: No structured logging, stack traces everywhere
**Fix**: Use winston/pino for secure logging

### Vulnerability Checklist

| Vulnerability | Severity | Status |
|---------------|----------|--------|
| No token expiration | Critical | ❌ Unfixed |
| Stack traces exposed | Critical | ❌ Unfixed |
| Unprotected availability endpoint | High | ❌ Unfixed |
| DB credentials visible | High | ❌ Unfixed |
| CORS too permissive | Medium | ❌ Unfixed |
| No input validation | Medium | ❌ Unfixed |
| Password in response | Medium | ❌ Unfixed |
| No rate limiting | Medium | ❌ Unfixed |
| No secure cookie flags | Medium | ❌ Unfixed |
| User can set isAdmin | Medium | ❌ Unfixed |
| Information leak in errors | Medium | ❌ Unfixed |
| No request size limits | Medium | ❌ Unfixed |

### Recommended Security Fixes (Priority Order)

1. **Immediate**:
   - Add token expiration (24h)
   - Fix stack trace exposure
   - Protect availability endpoint
   - Secure .env handling

2. **High Priority**:
   - Add input validation (joi/yup)
   - Restrict CORS origin
   - Add rate limiting
   - Exclude password from responses
   - Prevent isAdmin escalation

3. **Medium Priority**:
   - Add HTTPS/secure cookies
   - Add CSRF protection
   - Implement structured logging
   - Add request size limits
   - Generic error messages

---

## Frontend Integration

### Expected Frontend Architecture

```
Frontend Application
├── Authentication Pages
│   ├── Register Page
│   │   └── POST /api/auth/register
│   └── Login Page
│       └── POST /api/auth/login
│
├── Hotel Search/Browse
│   ├── Search Form
│   │   └── GET /api/hotels?city=...&min=...&max=...
│   ├── Hotel Details
│   │   ├── GET /api/hotels/find/:id
│   │   └── GET /api/hotels/room/:id
│   └── Statistics
│       ├── GET /api/hotels/countByCity
│       └── GET /api/hotels/countByType
│
├── Booking Flow
│   ├── Check Availability
│   │   └── GET /api/rooms/:id
│   ├── Select Dates
│   │   └── Verify against roomNumbers.unavailableDates
│   ├── Book Room
│   │   └── PUT /api/rooms/availability/:id
│   └── Booking Confirmation
│       └── (Currently no booking confirmation model)
│
├── User Profile
│   ├── View Profile
│   │   └── GET /api/users/:id
│   ├── Edit Profile
│   │   └── PUT /api/users/:id
│   └── Delete Account
│       └── DELETE /api/users/:id
│
└── Admin Dashboard
    ├── Hotel Management
    │   ├── Create → POST /api/hotels
    │   ├── Edit → PUT /api/hotels/:id
    │   ├── Delete → DELETE /api/hotels/:id
    │   └── View → GET /api/hotels/find/:id
    │
    ├── Room Management
    │   ├── Create → POST /api/rooms/:hotelid
    │   ├── Edit → PUT /api/rooms/:id
    │   ├── Delete → DELETE /api/rooms/:id/:hotelid
    │   └── View → GET /api/rooms/:id
    │
    └── User Management
        └── View All Users → GET /api/users
```

### API Integration Patterns

#### **Authentication Flow in Frontend**

```javascript
// 1. Register
const register = async (formData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
    credentials: 'include'  // Include cookies
  });
  // Redirect to login
};

// 2. Login
const login = async (username, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include'  // Store JWT in cookies
  });
  const data = await response.json();
  // Frontend receives user details and isAdmin flag
  // JWT automatically stored in cookies by server
};

// 3. Authenticated Request
const getProfile = async (userId) => {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'GET',
    credentials: 'include'  // Send JWT cookie automatically
  });
  // Backend verifies token from cookie
};
```

#### **Hotel Search Flow**

```javascript
const searchHotels = async (city, minPrice, maxPrice, type) => {
  const params = new URLSearchParams({
    city,
    min: minPrice,
    max: maxPrice,
    type,
    limit: 20
  });
  
  const response = await fetch(`/api/hotels?${params}`, {
    method: 'GET'
  });
  // No authentication needed
  
  return response.json();  // Array of hotels
};
```

#### **Booking Flow**

```javascript
// 1. Check room availability
const getRoom = async (roomId) => {
  const response = await fetch(`/api/rooms/${roomId}`);
  const room = await response.json();
  
  // Frontend checks: 
  // room.roomNumbers.forEach(rn => {
  //   if (rn.unavailableDates.includes(selectedDate)) {
  //     markAsUnavailable(rn.number);
  //   }
  // });
};

// 2. Book room (currently unprotected!)
const bookRoom = async (roomNumberId, dates) => {
  const response = await fetch(`/api/rooms/availability/${roomNumberId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dates }),
    credentials: 'include'
  });
  // Room marked as unavailable for those dates
};
```

### Frontend Data Structure Examples

```javascript
// Hotel Search Result
{
  _id: "507f1f77bcf86cd799439015",
  name: "Grand Plaza Hotel",
  type: "hotel",
  city: "New York",
  cheapestPrice: 150,
  rating: 4.8,
  featured: true,
  photos: ["url1", "url2", "url3"],
  distance: "2km from city center"
}

// Hotel Details with Rooms
{
  _id: "507f1f77bcf86cd799439015",
  name: "Grand Plaza Hotel",
  address: "123 Main Street, New York, NY 10001",
  title: "Luxury 5-star hotel in Manhattan",
  desc: "Modern luxury hotel with world-class amenities...",
  photos: ["url1", "url2"],
  rating: 4.8,
  rooms: [
    {
      _id: "room_id_1",
      title: "Deluxe Double Room",
      price: 150,
      maxPeople: 2,
      roomNumbers: [
        { _id: "...", number: 101, unavailableDates: ["2024-01-20", "2024-01-21"] },
        { _id: "...", number: 102, unavailableDates: [] }
      ]
    }
  ]
}

// User Profile
{
  _id: "user_id",
  username: "john_doe",
  email: "john@example.com",
  country: "USA",
  city: "New York",
  phone: "+1-234-567-8900",
  img: "profile_photo_url",
  isAdmin: false
}
```

### Frontend API Headers & Credentials

```javascript
// All requests should include:
{
  'Content-Type': 'application/json',
  credentials: 'include'  // Send cookies with request
}

// CORS will be handled by server
// Frontend should be served from same domain or configured CORS origin
```

---

## Deployment

### Current Deployment Configuration

**Server Port**: 8800 (hardcoded in index.js)

**Database**: MongoDB Atlas (cloud-hosted)
- Connection string from .env
- Live MongoDB instance

**Node.js Version**: Not specified (should be in package.json or .nvmrc)

### Environment-Based Deployment

**Development**:
```bash
npm start  # Runs with nodemon (auto-reload)
```

**Production** (Currently Not Configured):
```bash
# Should run:
NODE_ENV=production node index.js
```

### Deployment Platforms (Recommended)

#### **Option 1: Heroku**
```bash
# Procfile needed
web: node index.js

# Deploy
git push heroku main
```

#### **Option 2: AWS EC2**
```bash
# SSH into instance
npm install
npm start
# Or use PM2 for process management
```

#### **Option 3: Docker**
```dockerfile
# Dockerfile needed
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8800
CMD ["node", "index.js"]
```

#### **Option 4: Railway/Render**
- Connect GitHub repo
- Auto-deploy on push
- Environment variables through dashboard

### Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Add token expiration to JWT
- [ ] Remove stack traces from error responses
- [ ] Configure CORS with specific origin
- [ ] Add rate limiting
- [ ] Set up HTTPS/SSL
- [ ] Add input validation
- [ ] Set up error logging service
- [ ] Configure MongoDB backups
- [ ] Set up monitoring/alerts
- [ ] Add process manager (PM2, Supervisor)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (Swagger)
- [ ] Configure Redis for caching (optional)

### Environment Variables for Deployment

**Required in production**:
```
NODE_ENV = production
MONGO = <mongodb_atlas_uri>
JWT = <strong_secret_key>
FRONTEND_URL = https://yourdomain.com
PORT = 8800
```

**Optional but recommended**:
```
LOG_LEVEL = error
DB_NAME = staycation
JWT_EXPIRE = 24h
CORS_ORIGIN = https://yourdomain.com
```

---

## Final Summary

### What is Completed ✅

1. **Core Authentication System**
   - User registration with password hashing
   - JWT-based login
   - Token verification middleware
   - Authorization checks (user/admin)

2. **Hotel Management**
   - Create, read, update, delete hotels
   - Filter by price, city, type
   - Count properties by city and type
   - Basic search functionality

3. **Room Management**
   - Create, read, update, delete rooms
   - Track room availability with dates
   - Associate rooms with hotels
   - Basic availability API

4. **User Management**
   - User profile updates
   - User profile retrieval
   - Account deletion
   - Admin user listing

5. **Database Schema**
   - User model with authentication fields
   - Hotel model with property details
   - Room model with availability tracking
   - Proper Mongoose validation

6. **Middleware & Error Handling**
   - CORS setup
   - Cookie parsing
   - JSON parsing
   - Global error middleware
   - Basic authentication/authorization

### What Still Needs to Be Built ❌

1. **Booking System** (Critical)
   - Booking model and routes
   - Payment integration
   - Booking confirmation
   - Booking history

2. **Reviews & Ratings**
   - Review submission API
   - Review retrieval
   - Review moderation
   - Rating calculation

3. **Security Hardening** (Critical)
   - Token expiration
   - Input validation
   - CORS origin restriction
   - Rate limiting
   - Secure cookie flags
   - Error message sanitization

4. **User Features**
   - Email verification
   - Password reset
   - User profile picture upload
   - Wishlist/favorites

5. **Admin Features**
   - Admin dashboard structure
   - Analytics endpoints
   - Moderation tools
   - User management endpoints

6. **Notifications**
   - Email notifications
   - SMS notifications (optional)
   - Booking reminders

7. **Testing**
   - Unit tests
   - Integration tests
   - API tests

8. **Documentation**
   - Swagger/OpenAPI docs
   - API usage examples
   - Deployment guide

### Estimated Completion Breakdown

| Component | Status | Estimated Effort |
|-----------|--------|------------------|
| Authentication | 100% | Done |
| Hotel Management | 100% | Done |
| Room Management | 70% | 1-2 weeks |
| Booking System | 0% | 2-3 weeks |
| Payments | 0% | 2-3 weeks |
| Reviews | 0% | 1 week |
| Admin Dashboard | 20% | 2 weeks |
| Security | 30% | 1-2 weeks |
| Testing | 0% | 2-3 weeks |
| Deployment | 10% | 1 week |
| **Total** | **~40%** | **~14-19 weeks** |

### Recommended Next Steps

**Immediate Priority (Week 1-2)**:
1. Fix critical security issues (token expiration, stack traces, rate limiting)
2. Add input validation (joi/yup)
3. Implement proper error handling
4. Add password reset functionality

**Phase 2 (Week 3-4)**:
1. Build Booking model and routes
2. Implement availability checking
3. Add booking cancellation

**Phase 3 (Week 5-6)**:
1. Integrate payment gateway (Stripe)
2. Add payment confirmation
3. Generate invoices

**Phase 4 (Week 7-8)**:
1. Build admin dashboard APIs
2. Add analytics endpoints
3. User management improvements

**Phase 5 (Week 9-10)**:
1. Implement reviews system
2. Add ratings calculation
3. Email notifications

**Phase 6 (Week 11+)**:
1. Add comprehensive testing
2. Performance optimization
3. Add caching (Redis)
4. Production deployment

### Project Health Assessment

**Code Quality**: ⚠️ 6/10
- Inconsistent error handling
- No validation layer
- Minimal logging
- No tests

**Security**: ❌ 3/10
- Multiple critical vulnerabilities
- No protection on booking API
- Credentials exposed
- Stack traces visible

**Architecture**: ✅ 7/10
- Clean separation of concerns
- Good folder structure
- Proper use of middleware
- Scalable design

**Documentation**: ⚠️ 4/10
- Minimal README
- No API documentation
- No inline comments
- No deployment guide

**Completeness**: ⚠️ 4/10
- Core features only
- Many planned features missing
- No booking system
- No payment integration

### Success Metrics

Before Production Launch, Ensure:
- ✅ All authentication/authorization tests pass
- ✅ 100% critical security fixes applied
- ✅ Booking system fully implemented
- ✅ Payment processing working
- ✅ Error handling comprehensive
- ✅ API documentation complete
- ✅ Load testing completed
- ✅ Monitoring/alerting setup
- ✅ Backup strategy tested
- ✅ Incident response plan ready

### Key Insights for Next Developer

1. **The booking system is stubbed but incomplete** - You need to create a Booking model and implement full booking flow including payment and cancellation

2. **Security is a major gap** - This is pre-production code with several security issues that MUST be fixed before any real user data

3. **Room availability is complex** - The nested roomNumbers array with unavailableDates needs careful handling during bookings and needs validation

4. **Admin/User roles are basic** - The authorization is simple (just isAdmin flag), may need roles (owner, property manager, customer service) for scaling

5. **No file upload handling** - Photos are just URLs, you'll need to implement actual file uploads (S3, Cloudinary, etc.)

6. **Database relationships are one-way** - Hotels reference rooms but rooms don't reference hotels, this can cause orphaned documents

7. **Error messages leak information** - The errors like "User not found" help attackers enumerate data, use generic messages

8. **No production configs** - No PM2, no nginx, no https setup - you need this before launching

9. **Testing is completely missing** - No test suite exists, this is critical for maintaining stability

10. **Scaling considerations needed** - Currently loads entire user list, fetches all rooms, no caching - will be slow with scale

---

## Appendix: Code Quality Issues Found

### Code Issues Summary

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Bitwise OR in query | controllers/hotel.js line 32 | High | Use `\|\|` not `\|` |
| Stack trace exposed | index.js line 51 | Critical | Remove in production |
| No token expiration | controllers/auth.js line 29 | Critical | Add expiresIn |
| Unprotected availability | routes/rooms.js line 14 | High | Add verifyToken |
| Password in response | controllers/user.js line 26 | Medium | Exclude field |
| CORS too open | index.js line 28 | Medium | Specify origin |
| Commented code | routes/users.js line 15-17 | Low | Remove or implement |
| No pagination | controllers/user.js line 38 | Medium | Add offset/limit |
| No validation | All controllers | High | Add joi/yup |

---

**Document Generated**: May 18, 2026  
**Backend Version**: 1.0.0  
**Status**: Ready for security hardening and feature completion
