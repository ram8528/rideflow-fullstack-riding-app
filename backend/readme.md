## POST /users/register

Description
\- Register a new user in the system. This endpoint creates a user record, hashes the password, and returns an authentication token plus the created user object (password is not returned).

Files involved
\- `backend/routes/user.routes.js` (route & validation)
\- `backend/controllers/user.controller.js` (request handling, token creation)
\- `backend/services/user.service.js` (user creation logic)
\- `backend/models/user.model.js` (Mongoose schema, hashing, token method)

Endpoint
\- Method: POST
\- URL: `/users/register`

Request body (JSON)

```
{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"    // optional per schema (min length constraint only)
  },
  "email": "john@example.com",
  "password": "password123"
}
```

Validation rules (applied in `user.routes.js`)
\- `email` — must be a valid email (required)
\- `fullname.firstname` — required, minimum length 3
\- `password` — required, minimum length 6

Model constraints (from `user.model.js`)
\- `fullname.firstname` is required and min length 3
\- `fullname.lastname` has a minlength constraint but is not required
\- `email` is required, unique, and min length 5
\- `password` is required and is stored hashed; the schema sets `select: false` so password is not returned in normal responses

Responses / Status Codes
\- 201 Created
\- Description: User created successfully. Returns a JSON body containing an auth token and the created user object (without password).
\- 400 Bad Request
\- Description: Validation errors (invalid/missing fields) or service-level missing required fields. The response will include validation error details when triggered by `express-validator`.
\- 500 Internal Server Error
\- Description: Unexpected server error (database, environment, etc.).

Example success response (201)

```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f67890123456",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

Example validation error response (400)

```
{
  "errors": [
    {
      "value": "jd",
      "msg": "First name must be at least 3 characters long",
      "param": "fullname.firstname",
      "location": "body"
    },
    {
      "value": "not-an-email",
      "msg": "Invalid Email",
      "param": "email",
      "location": "body"
    }
  ]
}
```

Notes and usage
\- Make sure `JWT_SECRET` is set in your environment before calling this endpoint; the controller uses it to generate the token.
\- The controller hashes the password by calling the model's `hashPassword` helper before creating the user.
\- The created user object returned by the endpoint intentionally does not include the password field.

Quick curl example

```
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"fullname": {"firstname": "John", "lastname": "Doe"}, "email": "john@example.com", "password": "password123"}'
```

If you want more examples (error cases or integration with the frontend), tell me which variant to add.

---

## POST /users/login

Description
\- Authenticate a user by email and password. If credentials are valid, the endpoint returns a JSON Web Token and the user object (password is not returned). The controller compares the supplied password with the stored hashed password.

Endpoint
\- Method: POST
\- URL: `/users/login`

Request body (JSON)

```
{
  "email": "john@example.com",
  "password": "password123"
}
```

Validation rules (recommended)
\- `email` — must be a valid email (required)
\- `password` — required, minimum length 6

Responses / Status Codes
\- 200 OK
\- Description: Authentication successful. Returns an auth token and the user object (without password).
\- 400 Bad Request
\- Description: Validation errors (missing/invalid fields) — the response will include validation error details.
\- 401 Unauthorized
\- Description: Invalid credentials (email not found or password mismatch).
\- 500 Internal Server Error
\- Description: Unexpected server error (database, environment, etc.).

Example success response (200)

```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64a1b2c3d4e5f67890123456",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

Example invalid credentials response (401)

```
{
  "error": "Invalid email or password"
}
```

Quick curl example

```
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

Notes
\- Ensure `JWT_SECRET` is set in your environment to enable token creation.
\- Implement proper rate limiting and account lockout in production to protect against brute-force attacks.
