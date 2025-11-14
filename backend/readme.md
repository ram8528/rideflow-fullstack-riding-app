# API documentation — backend

This file documents the user and captain (driver) authentication endpoints present in `backend/`.

Notes

- The backend uses JWTs signed with `process.env.JWT_SECRET`. Set this environment variable before running the server.
- Authentication middleware checks for a token in an HTTP-only cookie named `token` or in the `Authorization: Bearer <token>` header. Revoked tokens are stored in a `blacklist` collection.

Table of Contents

- Users
  - `POST /users/register` — create account
  - `POST /users/login` — login
  - `GET /users/profile` — get profile (protected)
  - `POST /users/logout` — logout (protected)
- Captains (drivers)
  - `POST /captain/register`
  - `POST /captain/login`
  - `GET /captain/profile` (protected)
  - `GET /captain/logout` (protected)

---

## Users

### POST /users/register

Register a new user. The controller hashes the password before saving and returns an auth token plus the created user (password excluded).

Request JSON

```json
{
  "fullname": { "firstname": "John", "lastname": "Doe" },
  "email": "john@example.com",
  "password": "password123"
}
```

Validation

- `email`: must be a valid email
- `fullname.firstname`: required, min length 3
- `password`: required, min length 6

Responses

- 201 Created: `{ token, user }` where `user` does not contain the password
- 400 Bad Request: validation errors or missing fields
- 500 Internal Server Error

Example success (201)

```json
{
  "token": "<jwt-token>",
  "user": {
    "_id": "64a1b2c3d4e5f67890123456",
    "fullname": { "firstname": "John", "lastname": "Doe" },
    "email": "john@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

Example validation error (400)

```json
{
  "errors": [
    {
      "value": "jd",
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    }
  ]
}
```

Quick curl

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":{"firstname":"John","lastname":"Doe"},"email":"john@example.com","password":"password123"}'
```

---

### POST /users/login

Authenticate a user. On success returns `{ token, user }`. The server may also set an HTTP-only cookie named `token` depending on the controller implementation.

Request JSON

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Validation

- `email`: must be a valid email
- `password`: required, min length 6

Responses

- 200 OK: `{ token, user }`
- 400 Bad Request: validation errors
- 401 Unauthorized: invalid credentials
- 500 Internal Server Error

Example success (200)

```json
{
  "token": "<jwt-token>",
  "user": {
    "_id": "64a1b2c3d4e5f67890123456",
    "fullname": { "firstname": "John", "lastname": "Doe" },
    "email": "john@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

Example invalid credentials (401)

```json
{ "message": "Invalid email or password" }
```

Quick curl

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

---

### GET /users/profile (protected)

Returns the authenticated user's profile. Requires valid JWT either in cookie `token` or header `Authorization: Bearer <token>`.

Responses

- 200 OK: `{ user }`
- 401 Unauthorized: missing/invalid/blacklisted token
- 404 Not Found: user not found

Example success (200)

```json
{
  "user": {
    "_id": "64a1b2c3d4e5f67890123456",
    "fullname": { "firstname": "John", "lastname": "Doe" },
    "email": "john@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

Quick curl (header)

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

Quick curl (cookie)

```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Cookie: token=<YOUR_TOKEN_HERE>"
```

---

### POST /users/logout (protected)

Logs out the currently authenticated user. Server implementation stores the token in a blacklist and clears the cookie named `token`.

Responses

- 200 OK: `{ message: "Logged out successfully" }`
- 401 Unauthorized: missing/invalid token

Quick curl

```bash
curl -X POST http://localhost:3000/users/logout \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

---

## Captains (drivers)

The captain endpoints mirror user auth flows but include vehicle fields. Routes are implemented in `backend/routes/captain.routes.js` and controllers in `backend/controllers/captain.controller.js`.

### POST /captain/register

Request JSON

```json
{
  "fullname": { "firstname": "Alice", "lastname": "Driver" },
  "email": "alice@drivers.com",
  "password": "securePassword",
  "vehicle": {
    "color": "blue",
    "plate": "ABC1234",
    "capacity": 4,
    "vehicleType": "car"
  }
}
```

Validation (see `captain.routes.js`)

- `vehicle.color` and `vehicle.plate` min length 3
- `vehicle.capacity` integer >= 1
- `vehicle.vehicleType` in `car|motorcycle|auto`

Responses

- 201 Created: `{ token, captain }`
- 400 Bad Request: validation error or email exists

Example success (201)

```json
{
  "token": "<jwt-token>",
  "captain": {
    "_id": "64b2c3d4e5f6789012345678",
    "fullname": { "firstname": "Alice", "lastname": "Driver" },
    "email": "alice@drivers.com",
    "vehicle": {
      "color": "blue",
      "plate": "ABC1234",
      "capacity": 4,
      "vehicleType": "car"
    },
    "status": "inactive",
    "socketId": null,
    "__v": 0
  }
}
```

---

### POST /captain/login

Request JSON

```json
{ "email": "alice@drivers.com", "password": "securePassword" }
```

Responses

- 200 OK: `{ token, captain }` and server sets cookie `token`
- 401 Unauthorized: invalid credentials

Example success (200)

```json
{
  "token": "<jwt-token>",
  "captain": {
    /* captain object as above */
  }
}
```

Quick curl

```bash
curl -X POST http://localhost:3000/captain/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@drivers.com","password":"securePassword"}'
```

---

### GET /captain/profile (protected)

Responses

- 200 OK: `{ captain }`
- 401 Unauthorized

Example (200)

```json
{
  "captain": {
    /* captain object */
  }
}
```

---

### GET /captain/logout

Logs the captain out by blacklisting the token and clearing cookie.

Responses

- 200 OK: `{ message: "Logout successfully" }`

Quick curl

```bash
curl -X GET http://localhost:3000/captain/logout \
  -H "Authorization: Bearer <YOUR_TOKEN_HERE>"
```

---

Security & production notes

- Use short-lived access tokens and refresh tokens, or implement a proper token revocation strategy. Blacklisting long-lived JWTs can grow unbounded — consider TTL on blacklist entries.
- Use HTTPS and set cookie flags (`HttpOnly`, `Secure`, `SameSite`) when issuing tokens in cookies.
- Rate limit authentication endpoints and add account lockout policies for repeated failures.

If you'd like, I can:

- Split this file into `backend/README.md` and `docs/api.md` with a table of endpoints.
- Generate an OpenAPI (Swagger) spec for these routes.
- Add Postman collection or automated tests (supertest + jest).
