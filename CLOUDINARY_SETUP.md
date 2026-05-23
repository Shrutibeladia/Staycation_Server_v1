# Cloudinary Integration Setup Guide

## Environment Variables

Add the following environment variables to your `.env` file:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Getting Cloudinary Credentials

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account (if you don't have one)
3. Go to your Dashboard
4. You'll find your Cloud Name, API Key, and API Secret in the Account section
5. Copy these values to your `.env` file

## API Usage

### Upload Hotel with Images

**Endpoint:** `POST /api/hotels`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
```
name: "Hotel Name"
type: "hotel"
city: "New York"
address: "123 Main St"
distance: "5 km"
title: "Hotel Title"
desc: "Hotel Description"
cheapestPrice: 100
rating: 4.5
featured: false
photos: <file1> <file2> <file3> ... (up to 10 images)
```

**Response:**
```json
{
  "_id": "hotel_id",
  "name": "Hotel Name",
  "type": "hotel",
  "city": "New York",
  "address": "123 Main St",
  "distance": "5 km",
  "photos": [
    "https://res.cloudinary.com/...",
    "https://res.cloudinary.com/..."
  ],
  "title": "Hotel Title",
  "desc": "Hotel Description",
  "rating": 4.5,
  "cheapestPrice": 100,
  "featured": false
}
```

## Features

- ✅ Supports up to 10 images per hotel
- ✅ Automatic image upload to Cloudinary
- ✅ Temporary file cleanup
- ✅ Image format validation (jpeg, png, jpg, gif, webp)
- ✅ File size limit: 5MB per image
- ✅ Secure URL storage in MongoDB

## Testing with Postman

1. Create a new POST request to `http://localhost:8800/api/hotels`
2. Go to Headers and add: `Authorization: Bearer <your_admin_token>`
3. Go to Body > form-data
4. Add fields as shown in the API Usage section above
5. For the `photos` field, change type to "File" and select your images
6. Send the request

## Notes

- The `photos` field is now managed by Cloudinary uploads
- Temporary files are automatically deleted after upload
- Images are stored in the `staycation/hotels` folder in your Cloudinary account
- Failed uploads will not block hotel creation if at least the basic data is valid
