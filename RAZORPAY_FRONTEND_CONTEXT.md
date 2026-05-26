# Razorpay Frontend Integration Context

This file explains how the frontend should integrate with the backend Razorpay payment flow for hotel bookings.

## Overview

The backend now supports a Razorpay test-mode payment flow using:
- `POST /api/payments` to create a Razorpay order
- `POST /api/payments/confirm` to verify the payment and confirm the booking

The frontend must:
1. Create a booking first and get its `bookingId`
2. Call `/api/payments` with `amount`, `currency`, and `bookingId`
3. Use the returned `keyId` and `orderId` to open Razorpay Checkout
4. Send Razorpay payment result back to `/api/payments/confirm`

## Environment Variables (Backend)

The backend requires test-mode Razorpay keys in `.env`:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

> Only the backend should store `RAZORPAY_KEY_SECRET`. The frontend only receives `keyId`.

## Endpoint: Create Razorpay Order

### Route
`POST /api/payments`

### Headers
- `Authorization: Bearer <token>`

### Request Body
```json
{
  "amount": 360,
  "currency": "INR",
  "bookingId": "<BOOKING_ID>"
}
```

### Success Response
```json
{
  "success": true,
  "orderId": "order_XXXXXXXXXXXX",
  "amount": 36000,
  "currency": "INR",
  "keyId": "rzp_test_XXXXXXXXXXXX",
  "bookingId": "<BOOKING_ID>"
}
```

### Notes
- `amount` must be the total price in rupees.
- Backend converts `amount` to paise (multiply by 100).
- Returned `amount` is in paise.

## Endpoint: Confirm Razorpay Payment

### Route
`POST /api/payments/confirm`

### Headers
- `Authorization: Bearer <token>`

### Request Body
```json
{
  "bookingId": "<BOOKING_ID>",
  "razorpayPaymentId": "<PAYMENT_ID_FROM_CHECKOUT>",
  "razorpayOrderId": "<ORDER_ID_FROM_CHECKOUT>",
  "razorpaySignature": "<SIGNATURE_FROM_CHECKOUT>"
}
```

### Success Response
```json
{
  "success": true,
  "booking": {
    "_id": "<BOOKING_ID>",
    "status": "confirmed",
    "paymentStatus": "completed",
    "paymentDetails": {
      "razorpayOrderId": "<ORDER_ID>",
      "razorpayPaymentId": "<PAYMENT_ID>",
      "razorpaySignature": "<SIGNATURE>"
    }
    // ... rest of booking object
  }
}
```

### Notes
- The backend verifies the signature using `RAZORPAY_KEY_SECRET`.
- If verification fails, the booking is not confirmed.

## Razorpay Checkout Example (Plain JavaScript)

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
async function payBooking(bookingId, amount, user) {
  const paymentResponse = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
    body: JSON.stringify({
      bookingId,
      amount,
      currency: 'INR',
    }),
  });

  const orderData = await paymentResponse.json();
  if (!orderData.success) {
    throw new Error('Failed to create Razorpay order');
  }

  const options = {
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    order_id: orderData.orderId,
    name: 'StayCation',
    description: 'Hotel booking payment',
    prefill: {
      name: user.name,
      email: user.email,
      contact: user.phone,
    },
    handler: async function (response) {
      await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({
          bookingId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        }),
      });

      // Show success to the user or navigate to booking confirmation
    },
    modal: {
      ondismiss: function () {
        console.log('User closed Razorpay checkout.');
      }
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
</script>
```

## Frontend responsibility

- create the booking first
- send `bookingId` to `/api/payments`
- use returned `keyId` and `orderId` in Razorpay checkout
- send checkout success data to `/api/payments/confirm`
- display booking confirmation after `/confirm` succeeds

## Important Test Mode Notes

- Use the Razorpay test keys from `.env`
- Do not expose `RAZORPAY_KEY_SECRET` in frontend code
- The frontend only receives `keyId` and checkout success data
