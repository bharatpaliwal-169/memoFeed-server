# MemoFeed Server — Functional Specification

**Document Type:** Functional Specification  
**Project:** MemoFeed (Medium-style social media backend)  
**Version:** 1.0  
**Last Updated:** March 14, 2026  
**Author:** Bharat Paliwal  

---

## 1. Document Control

| Version | Date       | Author         | Changes                    |
|---------|------------|----------------|----------------------------|
| 1.0     | 2026-03-14 | Bharat Paliwal | Initial functional spec    |

---

## 2. Introduction

### 2.1 Purpose

This document describes the **functional design** of the MemoFeed server: behavior, APIs, data models, security, and integration points. It is intended for developers, QA, and stakeholders.

### 2.2 Scope

- Backend API server for the MemoFeed application (Medium-style blog/social feed).
- Covers authentication, posts (CRUD, search, likes, comments), user stats, email flows, and supporting services.
- Does not define frontend behavior or UI; the server is consumed via REST APIs.

### 2.3 Definitions and Acronyms

| Term        | Definition                                      |
|------------|--------------------------------------------------|
| JWT        | JSON Web Token (auth/session)                    |
| CRUD       | Create, Read, Update, Delete                     |
| OAuth      | Google OAuth 2.0 for sign-in                     |
| Rate limit | Request throttling per time window               |

---

## 3. System Overview

### 3.1 Architecture

- **Runtime:** Node.js (ES modules).
- **Framework:** Express.js.
- **Database:** MongoDB (via Mongoose).
- **Process model:** Cluster mode (one worker per CPU); workers share the same app and DB.
- **Caching:** In-memory cache (NodeCache) for feed data; Redis code exists but is currently replaced by NodeCache.

High-level flow:

1. Requests hit Express, pass through global middleware (Helmet, CORS, body parsing, sanitization, rate limit, session).
2. Routes are mounted under `/feed` (posts) and `/auth` (authentication).
3. Protected routes use JWT auth middleware; all routes use a logging middleware.
4. Controllers call Mongoose models and optional services (Email, Logger, Cache).

### 3.2 Technology Stack

| Layer        | Technology / Library                          |
|-------------|-------------------------------------------------|
| Runtime     | Node.js (ES modules)                            |
| Web server  | Express 4.x                                     |
| Database    | MongoDB + Mongoose 8.x                          |
| Auth        | JWT (jsonwebtoken), bcrypt, Google Auth Library |
| Email       | Nodemailer                                      |
| Logging     | Winston                                         |
| Security    | Helmet, CORS, express-mongo-sanitize, rate-limit |
| Caching     | node-cache (in-memory)                          |
| ID generation | bharat-id-generator                           |
| Deployment  | Docker (Node 23 Alpine), OnRender               |

---

## 4. Directory Structure

```
memoFeed-server/
├── index.js                 # App entry, cluster, DB connect, route mounting
├── package.json
├── Dockerfile
├── .dockerignore
├── .gitignore
├── README.md
├── docs/
│   └── FUNCTIONAL_SPECIFICATION.md  # This document
└── src/
    ├── controllers/
    │   ├── auth.js          # Auth and account actions
    │   └── posts.js         # Post CRUD, search, like, comment, stats
    ├── middleware/
    │   ├── auth.js          # JWT verification, sets req.userId
    │   ├── logMiddleware.js # Request/response logging
    │   └── rateLimiter.js   # API rate limiting
    ├── models/
    │   ├── auth.js          # User schema
    │   └── postMessage.js   # Post schema
    ├── routes/
    │   ├── auth.js          # /auth/* routes
    │   └── posts.js         # /feed/* routes
    └── services/
        ├── Cache/
        │   └── redis.js     # NodeCache wrapper (Redis commented out)
        ├── Email/
        │   ├── index.js     # Send email by type (verify, forgot pwd, change pwd)
        │   └── templates/
        │       ├── verifyEmail.js
        │       ├── forgotPswd.js
        │       └── changePswd.js
        └── Logger/
            └── index.js     # Winston logger
```

---

## 5. Functional Requirements by Module

### 5.1 Authentication (`/auth`)

| ID   | Requirement | Description |
|------|-------------|-------------|
| AUTH-1 | Login | Accept `email` and `password`; validate user; compare password with bcrypt; issue JWT (1h), set httpOnly cookie `token`, return user object (`_id`, `name`, `email`, `verified`). |
| AUTH-2 | Signup | Accept `firstName`, `lastName`, `email`, `password`; reject if user exists or password weak; hash password; create user with generated `user_id`; issue JWT and set cookie; return created user. |
| AUTH-3 | Logout | Clear `token` cookie and return success. |
| AUTH-4 | Delete account | Delete user by `id` (path param); clear cookie; return goodbye message. |
| AUTH-5 | Verify email (request) | Accept `email`; generate short-lived JWT; send verification email with link; return “Email have been sent.” |
| AUTH-6 | Verify email (confirm) | Accept `token` (query); verify JWT; set user `verified: true`; return success. |
| AUTH-7 | Forgot password (request) | Accept `email`; send “forgot password” email with token link; return “We have sent you a email” or error. |
| AUTH-8 | Change password (request) | Accept `email`; send “change password” email with token link. |
| AUTH-9 | Change password (confirm) | Accept `password`, `confirmPassword`, `token` (body); verify token; validate match and strength; update hashed password; return success. |
| AUTH-10 | Google OAuth | Accept `credential` (ID token); verify with Google; find or create user by email; issue JWT and set cookie; return user. |

**Password rules (current logic):**  
Reject if `!password` or `password.length < 6` or `password.length > 20`. (Note: condition as written may be incorrect; document reflects code.)

**Session / cookie:**  
JWT stored in httpOnly cookie `token`, 1h expiry, `sameSite: 'Strict'`. Logout/delete use `sameSite: "none", secure: true` for cookie clear.

### 5.2 Posts / Feed (`/feed`)

| ID   | Requirement | Description |
|------|-------------|-------------|
| POST-1 | List posts (paginated) | `GET /feed?page=n`. Page size 6; sort by `_id` desc; return `data`, `currentPage`, `NumberOfPages`. First page may be served from cache (key from env); cache invalidated on create/update/delete. |
| POST-2 | Search posts | `GET /feed/search?searchQuery=...&tags=tag1,tag2`. Match title (regex, case-insensitive) or tags; return `data` array. |
| POST-3 | Get single post | `GET /feed/:id`. Return post; increment `viewCount` and persist. |
| POST-4 | Get user stats | `GET /feed/stats/:id`. For creator `id`, return `myPosts`, `totalLikes`, `totalPosts`, `popularity` (sum of viewCount). |
| POST-5 | Create post | **Protected.** `POST /feed` with body (title, message, tags, selectedFile, etc.). Validate length (title ≤30, message ≤5000, tags ≤10); set `creator` from `req.userId`, `story_id` from generator; save and return new post; invalidate feed cache. |
| POST-6 | Update post | **Protected.** `PATCH /feed/:id`. Body: creator, title, message, tags, selectedFile; replace post; invalidate cache; return success. |
| POST-7 | Delete post | **Protected.** `DELETE /feed/:id`. Remove post; invalidate cache. |
| POST-8 | Like post | **Protected.** `PATCH /feed/:id/likePost`. Toggle current user in `likes` array; return updated post. |
| POST-9 | Comment on post | **Protected.** `POST /feed/:id/commentPost`. Body: `value` (comment text); append to `comments`; return updated post. |

**Auth for protected routes:**  
`Authorization: Bearer <JWT>`. Middleware verifies JWT and sets `req.userId`; no body/session auth for these endpoints.

### 5.3 Global Behavior

- **Root:** `GET /` returns “APP is UP n RUNNING”.
- **Fallback:** `GET /*` (any other path) returns “Undefined endpoint!”.
- **Request logging:** Method, URL, and on finish: status and content length.
- **Rate limiting:** 100 requests per minute per IP; 429 “Too many attempts” when exceeded.

---

## 6. Data Models

### 6.1 User (authMessage)

| Field     | Type    | Required | Default | Notes                    |
|----------|---------|----------|---------|--------------------------|
| name     | String  | Yes      | —       | Full name                |
| email    | String  | Yes      | —       | Unique per user          |
| password | String  | No       | ''      | Bcrypt hash; empty for Google |
| verified | Boolean | No       | false   | Email verified           |
| id       | String  | No       | —       | Optional legacy id       |
| google_id| String  | No       | —       | Unique; from Google      |
| user_id  | String  | No       | ''      | Unique; e.g. MEM-xxx     |

### 6.2 Post (PostMessage)

| Field       | Type     | Required | Default   | Notes                    |
|------------|----------|----------|-----------|--------------------------|
| title      | String   | —        | —         | Max 30 (enforced in controller) |
| message    | String   | —        | —         | Max 5000 (enforced in controller) |
| name       | String   | —        | —         | Creator display name     |
| creator    | String   | —        | —         | User ID (MongoDB ObjectId string) |
| tags       | [String] | —        | —         | Max 10 (enforced in controller) |
| selectedFile | String | —        | —         | Image/file reference     |
| viewCount  | Number   | —        | 0         | Incremented on GET by id |
| likes      | [String] | —        | []        | User IDs                 |
| comments   | [String] | —        | []        | Comment strings          |
| createdAt  | Date     | —        | new Date()| Creation time            |
| story_id   | String   | —        | —         | Unique; e.g. MEM-xxx     |

---

## 7. API Reference Summary

### 7.1 Authentication — Base path: `/auth`

| Method | Path                      | Auth  | Description                |
|--------|----------------------------|-------|----------------------------|
| POST   | /auth/login                | No    | Login                      |
| POST   | /auth/logout               | No    | Logout                     |
| POST   | /auth/signup               | No    | Register                   |
| DELETE | /auth/deleteAccount/:id    | No    | Delete user                |
| POST   | /auth/google               | No    | Google OAuth               |
| POST   | /auth/verifyEmail          | No    | Request verification email  |
| GET    | /auth/verification         | No    | Confirm verification (query: token) |
| POST   | /auth/changepswd/request   | No    | Request change-password email |
| POST   | /auth/changepassword       | No    | Set new password (body: password, confirmPassword, token) |
| POST   | /auth/forgotpswd/request   | No    | Request forgot-password email |

### 7.2 Feed — Base path: `/feed`

| Method | Path                   | Auth  | Description        |
|--------|------------------------|-------|--------------------|
| GET    | /feed                  | No    | Paginated list     |
| GET    | /feed/search           | No    | Search by query/tags |
| GET    | /feed/stats/:id        | No    | User stats         |
| GET    | /feed/:id              | No    | Single post + viewCount |
| POST   | /feed                  | Yes   | Create post        |
| PATCH  | /feed/:id              | Yes   | Update post        |
| DELETE | /feed/:id              | Yes   | Delete post        |
| PATCH  | /feed/:id/likePost     | Yes   | Toggle like        |
| POST   | /feed/:id/commentPost  | Yes   | Add comment        |

**Auth:** Send JWT in header: `Authorization: Bearer <token>`.

---

## 8. Security Design

| Measure           | Implementation                                      |
|-------------------|------------------------------------------------------|
| HTTP headers      | Helmet                                              |
| CORS              | Enabled for all origins (`cors()`)                  |
| Input size         | JSON/urlencoded body limit 50mb                      |
| NoSQL injection   | express-mongo-sanitize                              |
| Rate limiting     | 100 req/min per IP (express-rate-limit)             |
| Passwords         | bcrypt (salt 10, hash rounds 12)                    |
| JWT               | Signed with SECRET; 1h expiry                       |
| Cookies           | httpOnly, sameSite Strict (or none for clear)        |
| Session           | express-session with SECRET (ensure package present)|

**Note:** `index.js` imports `express-session`; `package.json` lists `cookie-session`. For current code, `express-session` should be added if not installed via another dependency.

---

## 9. Email Service

- **Transport:** Nodemailer (SMTP from env: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_ID`, `EMAIL_PASS`, `EMAIL_SECURE`).
- **Templates:** HTML emails for:
  - **EMAILVERIFY** — Verification link (uses `CLIENT_PROD_URL` + `/auth/verification/?token=...`).
  - **FORGOTPASSWORD** — Forgot password link (`CLIENT_PROD_URL` + `/auth/changepassword/?token=...`).
  - **CHANGEPASSWORD** — Change password link (same URL as forgot).
- **Return:** `"OK"` or `"ERROR"`; controllers use this to set response status.

---

## 10. Logging

- **Library:** Winston.
- **Level:** info; format includes timestamp and message.
- **Transports:** Console (colorized). File transport commented out.
- **Usage:** Request/response in log middleware; auth and post controllers log key actions and errors.

---

## 11. Caching

- **Implementation:** NodeCache (in-memory) in `src/services/Cache/redis.js` (Redis client commented out).
- **Usage:** Feed list for page 1; key from `process.env.CACHE_KEY`. Cache cleared on post create/update/delete.
- **Scope:** Per process; in cluster mode each worker has its own cache.

---

## 12. Configuration and Environment

| Variable           | Purpose                          |
|--------------------|----------------------------------|
| PORT / MY_PORT     | Server port                      |
| DB_URL             | MongoDB connection string        |
| SECRET             | JWT and session secret           |
| GOOGLE_CLIENT_ID   | Google OAuth client ID           |
| EMAIL_HOST         | SMTP host                        |
| EMAIL_PORT         | SMTP port                        |
| EMAIL_ID           | Sender email                     |
| EMAIL_PASS         | SMTP password                    |
| EMAIL_SECURE       | Use TLS                          |
| CLIENT_PROD_URL    | Frontend base URL for email links|
| CACHE_KEY          | Key for feed cache entry         |

---

## 13. Deployment

- **Docker:** Dockerfile uses `node:23-alpine`, installs deps, copies app, runs `npm start`.
- **Hosting:** Documented migration from Heroku to OnRender (e.g. `https://memofeed-backend.onrender.com/`).
- **Process:** Cluster mode in `index.js` (primary forks workers; workers run Express and connect to MongoDB).

---

## 14. Non-Functional Considerations

- **Scalability:** Stateless API; horizontal scaling possible; cache is per-process.
- **Availability:** Cluster restarts workers on exit; single MongoDB dependency.
- **Maintainability:** Layered structure (routes → controllers → models/services); centralized logger and error responses.

---

## 15. Pipeline / Future Work (from README)

| Feature                         | Status      |
|---------------------------------|------------|
| Google O-Auth                   | Development|
| Input sanitize and restriction | Pending    |
| User activity logs              | Pending    |
| Notifications                   | Pending    |
| Security and long sign-in with cookies | Pending |

---

## 16. References

- Project README: `memoFeed-server/README.md`
- Package manifest: `memoFeed-server/package.json`
- Entry point: `memoFeed-server/index.js`

---

*End of Functional Specification*
