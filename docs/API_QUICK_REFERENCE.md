# Backend API Quick Reference

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints require authentication via session cookie:
```bash
Cookie: better_auth.session_token=<token>
```

---

## User Addresses API

### Get All Addresses
```bash
GET /users/addresses
```

### Create Address
```bash
POST /users/addresses
Content-Type: application/json

{
  "label": "home",
  "streetAddress": "123 Main St",
  "city": "Paris",
  "state": "Île-de-France",
  "postalCode": "75001",
  "country": "France",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

### Update Address
```bash
PUT /users/addresses/:addressId
Content-Type: application/json

{
  "label": "work",
  "streetAddress": "456 Office Blvd"
}
```

### Delete Address
```bash
DELETE /users/addresses/:addressId
```

### Set Default Address
```bash
PUT /users/addresses/:addressId/default
```

---

## Payment Methods API

### Get All Payment Methods
```bash
GET /users/payment-methods
```

### Add Payment Method
```bash
POST /users/payment-methods
Content-Type: application/json

{
  "type": "card",
  "provider": "stripe",
  "token": "tok_visa",
  "last4": "4242",
  "cardBrand": "visa",
  "expiryMonth": 12,
  "expiryYear": 2025
}
```

### Delete Payment Method
```bash
DELETE /users/payment-methods/:paymentId
```

### Set Default Payment Method
```bash
PUT /users/payment-methods/:paymentId/default
```

---

## Payment Processing API

### Create Payment Intent
```bash
POST /payment/intent
Content-Type: application/json

{
  "amount": 99.99,
  "currency": "EUR",
  "orderId": "order_123"
}
```

Response:
```json
{
  "paymentIntentId": "pi_mock_...",
  "clientSecret": "secret_...",
  "status": "requires_payment_method"
}
```

### Confirm Payment
```bash
POST /payment/confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_mock_...",
  "paymentMethodToken": "tok_visa"
}
```

Response (Success - 90% probability):
```json
{
  "success": true,
  "paymentIntentId": "pi_mock_...",
  "status": "succeeded",
  "message": "Payment successful"
}
```

Response (Failure - 10% probability):
```json
{
  "success": false,
  "paymentIntentId": "pi_mock_...",
  "status": "failed",
  "message": "Payment failed - insufficient funds"
}
```

### Simulate Payment Error
```bash
POST /payment/simulate-error
Content-Type: application/json

{
  "type": "declined"
  // Options: "declined", "insufficient_funds", "network_error", "authentication_required"
}
```

---

## Orders API

### Create Order
```bash
POST /orders
Content-Type: application/json

{
  "addressId": "addr_123",
  "paymentMethodId": "pm_123",
  "notes": "Please ring the doorbell"
}
```

### Get Orders (Paginated)
```bash
GET /orders?page=1&limit=10
```

### Get Order Details
```bash
GET /orders/:orderId
```

### Get Order Statistics
```bash
GET /orders/statistics
```

Response:
```json
{
  "totalOrders": 25,
  "totalSpent": 1250.50,
  "averageOrderValue": 50.02
}
```

### Cancel Order
```bash
PUT /orders/:orderId/cancel
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

### Request Return
```bash
POST /orders/:orderId/return
Content-Type: application/json

{
  "reason": "Item defective",
  "items": ["item_1", "item_2"]
}
```

### Get Return Status
```bash
GET /orders/:orderId/return-status
```

### Rate Order
```bash
POST /orders/:orderId/rating
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent service!"
}
```

### Get Invoice
```bash
GET /orders/:orderId/invoice
```

### Confirm Delivery
```bash
POST /orders/:orderId/confirm-delivery
Content-Type: application/json

{
  "photoUrl": "https://...",
  "signature": "base64...",
  "notes": "Received in good condition"
}
```

---

## Delivery Tracking API ⭐

### Get Full Tracking Info
```bash
GET /delivery/:orderId/tracking
```

Response:
```json
{
  "tracking": {
    "id": "del_123",
    "orderId": "order_123",
    "status": "on_the_way",
    "estimatedTimeMinutes": 15,
    "driver": {
      "id": "driver_1",
      "name": "Jean Dupont",
      "phone": "+33 6 12 34 56 78",
      "photo": "https://i.pravatar.cc/150?u=driver1",
      "vehicleType": "scooter",
      "rating": 4.8
    },
    "currentLocation": {
      "coordinates": {
        "latitude": 48.8566,
        "longitude": 2.3522
      },
      "address": "En route"
    },
    "destination": {
      "coordinates": {
        "latitude": 48.8600,
        "longitude": 2.3500
      },
      "address": "123 Rue de la Paix, 75001 Paris"
    },
    "shopLocation": {
      "coordinates": {
        "latitude": 48.8566,
        "longitude": 2.3522
      },
      "address": "123 Rue de Rivoli, 75001 Paris"
    },
    "timeline": [
      {
        "id": "track_1",
        "status": "confirmed",
        "timestamp": "2024-01-15T10:00:00Z",
        "description": "Order confirmed by merchant"
      }
    ],
    "canCall": true,
    "canMessage": true,
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### Get Lightweight Status Updates
```bash
GET /delivery/:orderId/status-updates
```

Response:
```json
{
  "success": true,
  "data": {
    "orderId": "order_123",
    "status": "on_the_way",
    "estimatedTimeMinutes": 15,
    "currentLocation": {
      "coordinates": {
        "latitude": 48.8566,
        "longitude": 2.3522
      },
      "address": "En route"
    },
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

### Call Driver
```bash
POST /delivery/:orderId/call-driver
```

Response:
```json
{
  "success": true,
  "message": "Call initiated to driver"
}
```

### Send Message to Driver
```bash
POST /delivery/:orderId/message
Content-Type: application/json

{
  "message": "I'll be waiting outside"
}
```

Response:
```json
{
  "success": true,
  "response": "Thank you for your message. I will arrive soon!"
}
```

### Mark Order as Received
```bash
POST /delivery/:orderId/mark-received
```

Response:
```json
{
  "success": true,
  "message": "Order marked as received"
}
```

---

## Delivery Status Flow

```
pending
  ↓
confirmed (payment successful)
  ↓
preparing (shop is preparing the order)
  ↓
ready (order ready for pickup)
  ↓
picked_up (driver picked up the order)
  ↓
on_the_way (driver is en route)
  ↓
nearby (driver is close to destination)
  ↓
delivered (order delivered)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Order not found",
  "error": "Not Found"
}
```

---

## Testing with cURL

### Complete Order Flow Example

```bash
# 1. Create an address
curl -X POST http://localhost:3000/users/addresses \
  -H "Cookie: better_auth.session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "home",
    "streetAddress": "123 Main St",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  }'

# 2. Add payment method
curl -X POST http://localhost:3000/users/payment-methods \
  -H "Cookie: better_auth.session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "card",
    "provider": "stripe",
    "token": "tok_visa",
    "last4": "4242",
    "cardBrand": "visa"
  }'

# 3. Create order (assumes you have items in cart)
curl -X POST http://localhost:3000/orders \
  -H "Cookie: better_auth.session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "addr_123",
    "paymentMethodId": "pm_123",
    "notes": "Please ring the doorbell"
  }'

# 4. Create payment intent
curl -X POST http://localhost:3000/payment/intent \
  -H "Cookie: better_auth.session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99.99,
    "currency": "EUR",
    "orderId": "order_123"
  }'

# 5. Confirm payment
curl -X POST http://localhost:3000/payment/confirm \
  -H "Cookie: better_auth.session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_mock_...",
    "paymentMethodToken": "tok_visa"
  }'

# 6. Track delivery
curl -X GET http://localhost:3000/delivery/order_123/tracking \
  -H "Cookie: better_auth.session_token=<token>"

# 7. Send message to driver
curl -X POST http://localhost:3000/delivery/order_123/message \
  -H "Cookie: better_auth.session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am waiting outside"
  }'

# 8. Mark as received
curl -X POST http://localhost:3000/delivery/order_123/mark-received \
  -H "Cookie: better_auth.session_token=<token>"

# 9. Rate the order
curl -X POST http://localhost:3000/orders/order_123/rating \
  -H "Cookie: better_auth.session_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "comment": "Excellent service!"
  }'
```

---

## Swagger Documentation

Interactive API documentation available at:
```
http://localhost:3000/api
```

Features:
- Try out endpoints directly
- View request/response schemas
- See validation rules
- Copy cURL commands

---

## Notes

1. **Polling Recommendations**:
   - `/delivery/:orderId/status-updates`: Poll every 5 seconds
   - `/delivery/:orderId/tracking`: Poll every 15 seconds
   - For production, consider WebSocket/SSE instead

2. **Mock Behavior**:
   - Payment confirmation has 90% success rate
   - Driver assignment is random from 3 mock drivers
   - Location updates are simulated based on status
   - Driver responses are auto-generated

3. **Security**:
   - All endpoints require authentication
   - Payment tokens are masked in responses
   - User ownership is validated on all operations

4. **Pagination**:
   - Default page: 1
   - Default limit: 10
   - Max limit: 100
