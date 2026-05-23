# Thunder Client Testing Guide - Hotel Creation with Cloudinary

## Prerequisites
1. Ensure your server is running: `npm start`
2. Have test image files ready (download sample images from [unsplash.com](https://unsplash.com) or use any local images)
3. You need a valid admin token from the authentication system

## Step-by-Step Thunder Client Setup

### Step 1: Get Admin Token
First, you need to authenticate as an admin:

**Request Type:** POST
**URL:** `http://localhost:8800/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "admin",
  "password": "your_admin_password"
}
```

Copy the token from the response.

---

### Step 2: Create Hotel with Images

**Request Type:** POST
**URL:** `http://localhost:8800/api/hotels`

**Headers:**
```
Authorization: Bearer <paste_your_admin_token_here>
Content-Type: multipart/form-data
```

**Form Data (Body tab > select "multipart/form-data"):**

| Field Name | Type | Value |
|-----------|------|-------|
| name | text | The Grand Plaza Hotel |
| type | text | hotel |
| city | text | New York |
| address | text | 123 Fifth Avenue, New York, NY 10001 |
| distance | text | 2 km from Manhattan Center |
| title | text | Luxury 5-Star Hotel in Heart of NYC |
| desc | text | Experience ultimate luxury at The Grand Plaza Hotel. Located in the heart of Manhattan, our hotel features world-class amenities, premium rooms, and exceptional service. Perfect for business travelers and vacationers alike. |
| cheapestPrice | text | 250 |
| rating | text | 4.8 |
| featured | text | true |
| photos | file | (select 1-10 image files) |

---

## Sample Test Data Sets

### Hotel 1: Budget Hotel
```
name: Budget Stay Inn
type: hotel
city: Los Angeles
address: 456 Hollywood Boulevard, Los Angeles, CA 90028
distance: 5 km from Hollywood Sign
title: Affordable Comfort Hotel in Hollywood
desc: Perfect budget-friendly accommodation for travelers. Clean rooms, friendly staff, and convenient location near major attractions.
cheapestPrice: 80
rating: 4.2
featured: false
photos: (your test images)
```

### Hotel 2: Resort
```
name: Tropical Paradise Resort
type: resort
city: Miami
address: 789 Beach Road, Miami, FL 33139
distance: 0.5 km from Private Beach
title: All-Inclusive Beach Resort Paradise
desc: Escape to our all-inclusive tropical paradise. Enjoy pristine beaches, world-class dining, water sports, and spa facilities. Your perfect getaway awaits!
cheapestPrice: 350
rating: 4.9
featured: true
photos: (your test images)
```

### Hotel 3: Villa
```
name: Mountain View Villa
type: villa
city: Aspen
address: 321 Summit Lane, Aspen, CO 81611
distance: 8 km from Aspen Village
title: Luxury Mountain Villa with Scenic Views
desc: Private luxury villa with breathtaking mountain views. Features modern architecture, infinity pool, hot tub, and direct access to hiking trails.
cheapestPrice: 500
rating: 5.0
featured: true
photos: (your test images)
```

---

## How to Add Images in Thunder Client

1. In the **Body** tab, select **multipart/form-data**
2. Add all text fields (name, type, city, etc.)
3. For the **photos** field:
   - Set the type to **file** (dropdown)
   - Click the file icon to browse and select image files
   - You can add multiple photo entries by clicking the + button

---

## Expected Success Response

```json
{
  "_id": "65123abc4567890def123456",
  "name": "The Grand Plaza Hotel",
  "type": "hotel",
  "city": "New York",
  "address": "123 Fifth Avenue, New York, NY 10001",
  "distance": "2 km from Manhattan Center",
  "photos": [
    "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/staycation/hotels/photos-1234567890.jpg",
    "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/staycation/hotels/photos-0987654321.jpg"
  ],
  "title": "Luxury 5-Star Hotel in Heart of NYC",
  "desc": "Experience ultimate luxury at The Grand Plaza Hotel...",
  "rating": 4.8,
  "cheapestPrice": 250,
  "featured": true,
  "__v": 0
}
```

---

## Troubleshooting

### Issue: 401 Unauthorized
- **Solution:** Make sure your Bearer token is valid and hasn't expired. Get a fresh token from the login endpoint.

### Issue: 400 Bad Request - "Hotel name is required"
- **Solution:** Ensure all required fields are filled in the form data (name, type, city, address, distance, title, desc, cheapestPrice).

### Issue: 500 Image upload failed
- **Solution:** 
  - Verify Cloudinary credentials are in your `.env` file
  - Check that image files are valid formats (jpeg, png, jpg, gif, webp)
  - Ensure images are under 5MB each

### Issue: No photos in response
- **Solution:** If photos field is empty, it means no files were attached. Make sure you added them to the "photos" field in form data.

---

## Quick cURL Test (if you have curl installed)

```bash
curl -X POST http://localhost:8800/api/hotels \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=The Grand Plaza Hotel" \
  -F "type=hotel" \
  -F "city=New York" \
  -F "address=123 Fifth Avenue, New York, NY 10001" \
  -F "distance=2 km from Manhattan Center" \
  -F "title=Luxury 5-Star Hotel in Heart of NYC" \
  -F "desc=Experience ultimate luxury at The Grand Plaza Hotel" \
  -F "cheapestPrice=250" \
  -F "rating=4.8" \
  -F "featured=true" \
  -F "photos=@/path/to/image1.jpg" \
  -F "photos=@/path/to/image2.jpg"
```

Replace:
- `YOUR_ADMIN_TOKEN` with your actual token
- `/path/to/image1.jpg` with actual file paths

---

## Collection Save Tip

In Thunder Client, you can save this as a collection:
1. Click **Collections** 
2. Click **New Collection** → name it "Staycation Hotels"
3. Right-click → **New Request** → name it "Create Hotel with Images"
4. Save all the settings
5. This way you can reuse it for multiple tests!
