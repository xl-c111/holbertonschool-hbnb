# API Documentation Guide

## What You'll See in Swagger UI

Visit: **http://localhost:5000/doc**

---

## 1. Overview Page

The landing page shows:
- **API Title**: "HBnB API v1.0"
- **Description**: What your API does
- **Authorize Button**: Click to enter your JWT token
- **All Endpoints**: Organized by category (auth, places, bookings, etc.)

---

## 2. How to Test an Endpoint

### Example: Login to Get Token

**Step 1: Find the endpoint**
```
📁 auth
  ├─ POST /api/v1/auth/login
     └─ "Authenticate user and return JWT token"
```

**Step 2: Click to expand**
- Shows full details
- Request body schema
- Response examples

**Step 3: Click "Try it out"**
- Input fields become editable

**Step 4: Enter data**
```json
{
  "email": "john.doe@example.com",
  "password": "Strongpass123!"
}
```

**Step 5: Click "Execute"**
- Swagger sends real HTTP request to your backend
- Shows actual response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Step 6: Copy the token**
- Use it for protected endpoints!

---

## 3. Testing Protected Endpoints

### Example: Create a Property Listing

**Step 1: Authorize first**
1. Click **"Authorize"** button (green padlock at top)
2. Enter: `Bearer YOUR_TOKEN_HERE`
3. Click "Authorize"
4. Click "Close"

**Step 2: Find protected endpoint**
```
📁 places
  ├─ POST /api/v1/places/  🔒
     └─ "Create a new property listing"
```

Notice the 🔒 lock icon = requires authentication

**Step 3: Try it out**
Click "Try it out" and enter:

```json
{
  "title": "Luxury Beach House",
  "description": "Beautiful 3-bedroom villa",
  "price": 500.00,
  "latitude": 34.0522,
  "longitude": -118.2437
}
```

**Step 4: Execute**
- Swagger automatically includes your JWT token
- Creates real property in database
- Returns:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Luxury Beach House",
  "description": "Beautiful 3-bedroom villa",
  "price": 500.0,
  "latitude": 34.0522,
  "longitude": -118.2437,
  "owner_id": "your-user-id"
}
```

---

## 4. Understanding Response Codes

Each endpoint shows possible responses:

```
Responses:
  ✅ 200 - Success (data returned)
  ✅ 201 - Created (new resource)
  ⚠️  400 - Bad Request (validation error)
  ⚠️  401 - Unauthorized (need to login)
  ⚠️  403 - Forbidden (not allowed)
  ⚠️  404 - Not Found (resource doesn't exist)
  ❌ 500 - Server Error (backend problem)
```

---

## 5. Model Schemas

Swagger shows the exact structure of data:

### Place Model
```json
{
  "id": "string (UUID)",
  "title": "string (required)",
  "description": "string",
  "price": "number (required)",
  "latitude": "number (required, -90 to 90)",
  "longitude": "number (required, -180 to 180)",
  "owner_id": "string (UUID)",
  "amenities": ["array of amenities"],
  "reviews": ["array of reviews"]
}
```

**Examples shown:**
- ✅ Valid data
- ✅ Required fields marked
- ✅ Data types specified
- ✅ Constraints explained

---

## 6. Query Parameters

Some endpoints accept filters:

**GET /api/v1/bookings/**

Query parameters:
- `status` - Filter by booking status (pending, confirmed, etc.)
- `type` - Filter by time (upcoming, past)

**Example:**
```
GET /api/v1/bookings/?status=confirmed&type=upcoming
```

Swagger UI lets you fill these in a form!

---

## Real-World Analogy

Think of API documentation like:

### Without Swagger:
```
You: "How do I book a property?"
Dev: "Read the source code in bookings.py line 67"
You: "What format do dates need?"
Dev: "Check the model validation in booking.py"
You: "What if payment fails?"
Dev: "Look at the error handling..."
```

### With Swagger:
```
You: Opens /doc in browser
You: Sees all endpoints, examples, formats
You: Clicks "Try it out"
You: Tests it immediately
You: ✅ Understands in 30 seconds
```

---

## Why This Matters for Interviews

### Interview Question:
**"How do frontend developers know how to use your API?"**

### Bad Answer:
"They can read my Python code"

### Good Answer (You):
"I implemented comprehensive API documentation with Swagger/OpenAPI. Developers can visit /doc to see:
- All available endpoints with descriptions
- Request/response schemas with examples
- Interactive testing with 'Try it out' buttons
- Authentication flows
- All response codes and error messages

The documentation is auto-generated from Flask-RESTX decorators, so it's always in sync with the code. Frontend developers can start integrating immediately without reading backend source code."

---

## Technical Terms to Know

| Term | What It Means |
|------|---------------|
| **Swagger UI** | Interactive web interface for API docs |
| **OpenAPI** | Standard format for describing REST APIs |
| **Flask-RESTX** | Flask extension that generates OpenAPI docs |
| **Endpoint** | A specific URL path (e.g., `/api/v1/places`) |
| **Schema** | Structure/format of request/response data |
| **Bearer Token** | Authentication method (JWT in header) |
| **Namespace** | Group of related endpoints (auth, places, etc.) |

---

## Quick Test Workflow

**Full testing cycle in 2 minutes:**

1. **Start backend**: `cd backend && python3 run.py`
2. **Open docs**: http://localhost:5000/doc
3. **Login**: POST /api/v1/auth/login
4. **Copy token**: From response
5. **Authorize**: Click button, paste `Bearer TOKEN`
6. **Test endpoint**: Any protected endpoint
7. **See results**: Real data from your database

**No Postman needed. No curl commands. Just your browser!**

---

## Benefits for Your Project

✅ **Professional**: Shows enterprise-level development practices
✅ **Testable**: Anyone can test your API instantly
✅ **Maintainable**: Docs update automatically with code
✅ **Collaborative**: Frontend team can work independently
✅ **Debuggable**: Easy to verify what your API actually does
✅ **Interview-ready**: Demonstrates full-stack understanding

---

## Common Interview Questions

### Q: "Why use API documentation instead of just README?"

**A**: "README is static text. Swagger is interactive - developers can test endpoints directly in their browser. It's auto-generated from code, so it's always accurate and up-to-date. Plus, it generates a machine-readable OpenAPI spec that tools like Postman can import."

### Q: "What if the docs get out of sync with code?"

**A**: "That's the beauty of Flask-RESTX - documentation is generated from Python decorators on the actual endpoint functions. If I change the code, the docs update automatically. There's no separate documentation file to maintain."

### Q: "Can you show me how authentication works in your API?"

**A**: "Sure! Let me pull up the Swagger UI..." (This is where you demo /doc and show the Authorize button, login flow, and protected endpoints)

---

## Pro Tip

In interviews, have Swagger UI open in your browser. When asked about your API:

1. Share screen
2. Show `/doc` page
3. Live demo: login → authorize → create booking
4. Explain while demonstrating

This is **10x more impressive** than explaining with words!

---

## Next Steps

1. **Start backend**: `python3 run.py`
2. **Visit**: http://localhost:5000/doc
3. **Explore**: Click around, try endpoints
4. **Practice**: Explain it out loud (interview prep!)

Your API documentation is now **production-ready** and **interview-ready**! 🚀
