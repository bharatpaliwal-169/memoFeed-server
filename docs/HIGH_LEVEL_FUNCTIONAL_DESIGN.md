# MemoFeed — High-Level Functional Design

**Document:** High-Level Functional Design Diagram  
**Project:** MemoFeed (Medium-style social media application)  
**Version:** 1.0  
**Last Updated:** March 14, 2026  

This document provides high-level functional design diagrams for the MemoFeed system. Use a Markdown viewer that supports Mermaid (e.g. GitHub, VS Code with Mermaid extension, or [mermaid.live](https://mermaid.live)) to render the diagrams.

---

## 1. System Context Diagram

Shows the MemoFeed system and its external actors and systems.

```mermaid
flowchart LR
    subgraph Users
        U[User / Browser]
    end

    subgraph MemoFeed["MemoFeed System"]
        direction TB
        FE[Frontend SPA<br/>React + Vite]
        BE[Backend API<br/>Node + Express]
        FE <-->|REST + JWT| BE
    end

    subgraph Data["Data & Services"]
        DB[(MongoDB)]
        SMTP[SMTP / Email]
        CLD[Cloudinary]
        GOOGLE[Google OAuth]
    end

    U <-->|HTTPS| FE
    BE <-->|Mongoose| DB
    BE -->|Nodemailer| SMTP
    FE -->|Image Upload| CLD
    BE <-->|Verify ID Token| GOOGLE
```

---

## 2. High-Level Functional Architecture

Frontend and backend functional areas and how they connect.

```mermaid
flowchart TB
    subgraph Frontend["MemoFeed Frontend (SPA)"]
        direction TB
        subgraph UI["UI Layer"]
            AUTH_UI[Auth Pages<br/>Login, Signup, Forgot/Change Pwd]
            FEED_UI[Feed & Home<br/>Posts, Search, Pagination]
            POST_UI[Post Detail<br/>View, Like, Comments]
            PROFILE_UI[Profile<br/>Stats, My Posts, Verify Email]
            TAGS_UI[Tags Page]
        end
        REDUX[Redux Store<br/>posts, auth]
        API_CLIENT[API Client<br/>Axios + Bearer Token]
        AUTH_UI --> REDUX
        FEED_UI --> REDUX
        POST_UI --> REDUX
        PROFILE_UI --> REDUX
        TAGS_UI --> REDUX
        REDUX --> API_CLIENT
    end

    subgraph Backend["MemoFeed Backend (API)"]
        direction TB
        subgraph Routes["Route Layer"]
            AUTH_ROUTES["/auth/*"]
            FEED_ROUTES["/feed/*"]
        end
        subgraph Controllers["Controllers"]
            AUTH_CTRL[Auth Controller]
            POST_CTRL[Posts Controller]
        end
        subgraph Services["Services"]
            EMAIL_SVC[Email Service]
            LOGGER[Logger]
            CACHE[Cache]
        end
        subgraph DataLayer["Data Layer"]
            USER_MODEL[(User Model)]
            POST_MODEL[(Post Model)]
        end
        AUTH_ROUTES --> AUTH_CTRL
        FEED_ROUTES --> POST_CTRL
        AUTH_CTRL --> USER_MODEL
        AUTH_CTRL --> EMAIL_SVC
        POST_CTRL --> POST_MODEL
        POST_CTRL --> CACHE
        AUTH_CTRL --> LOGGER
        POST_CTRL --> LOGGER
    end

    API_CLIENT <-->|REST / JWT| AUTH_ROUTES
    API_CLIENT <-->|REST / JWT| FEED_ROUTES
```

---

## 3. Functional Modules Overview

Grouping of features by domain.

```mermaid
flowchart LR
    subgraph MemoFeed_Features["MemoFeed — Functional Modules"]
        direction TB

        subgraph Auth["Authentication"]
            A1[Login / Signup]
            A2[Logout]
            A3[Google OAuth]
            A4[Email Verification]
            A5[Forgot / Change Password]
            A6[Delete Account]
        end

        subgraph Feed["Feed & Posts"]
            F1[List Posts]
            F2[Search & Tags]
            F3[View Post]
            F4[Create / Edit / Delete]
            F5[Like]
            F6[Comments]
        end

        subgraph Profile["Profile & Stats"]
            P1[User Details]
            P2[My Posts]
            P3[Stats]
            P4[Verify Email]
        end

        subgraph Supporting["Supporting"]
            S1[Rate Limiting]
            S2[Logging]
            S3[Image Upload]
        end
    end

    Auth --> Feed
    Auth --> Profile
    Feed --> Supporting
```

---

## 4. End-to-End Data Flow (Simplified)

Request flow from user action to database and back.

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend API
    participant MW as Middleware
    participant CTRL as Controller
    participant DB as MongoDB

    U->>FE: Action (e.g. Create Post)
    FE->>FE: Redux dispatch
    FE->>API: HTTP Request (Bearer JWT)
    API->>MW: Rate limit, Sanitize, Auth
    MW->>CTRL: req, req.userId
    CTRL->>DB: Read/Write
    DB-->>CTRL: Result
    CTRL-->>API: Response
    API-->>FE: JSON
    FE->>FE: Redux update, re-render
    FE-->>U: UI update
```

---

## 5. Auth Flow (High-Level)

```mermaid
flowchart LR
    subgraph Client["Frontend"]
        L[Login / Signup Form]
        P[Store profile + token]
        R[Redirect]
        L --> P --> R
    end

    subgraph Server["Backend"]
        V[Validate]
        J[JWT + Cookie]
        DB_AUTH[(Users)]
        V --> J
        V --> DB_AUTH
    end

    Client -->|POST /auth/login or signup| Server
    Server -->|result, token| Client
```

---

## 6. Feed / Post Flow (High-Level)

```mermaid
flowchart LR
    subgraph Client["Frontend"]
        H[Home / Feed]
        S[Search / Tags]
        D[Post Detail]
        C[Create / Edit Form]
        H --> D
        S --> D
        C -->|Submit| API
    end

    subgraph API["Backend /feed"]
        LIST[GET /]
        SEARCH[GET /search]
        ONE[GET /:id]
        CRUD[POST,PATCH,DELETE]
        LIKE[PATCH /:id/likePost]
        COMMENT[POST /:id/commentPost]
    end

    subgraph Store["Backend Store"]
        CACHE[(Cache)]
        MONGO[(MongoDB)]
        LIST --> CACHE
        LIST --> MONGO
        SEARCH --> MONGO
        ONE --> MONGO
        CRUD --> MONGO
        LIKE --> MONGO
        COMMENT --> MONGO
    end

    H --> LIST
    S --> SEARCH
    D --> ONE
    D --> LIKE
    D --> COMMENT
```

---

## 7. Component Layering (Frontend)

```mermaid
flowchart TB
    subgraph Pages["Pages (Route-level)"]
        Home
        Auth
        Profile
        PostDetails
        Tags
        ForgotPassword
        ChangePassword
        EmailVerification
    end

    subgraph Components["Shared Components"]
        Navbar
        Footer
        Posts
        PostCard
        Forms
        Pagination
        Loading
        LoginPrompt
        Notification
    end

    subgraph State["State & API"]
        Redux
        API
    end

    Pages --> Components
    Pages --> Redux
    Components --> Redux
    Redux --> API
```

---

## 8. Backend Request Pipeline

```mermaid
flowchart LR
    R[Request] --> H[Helmet]
    H --> CORS[CORS]
    CORS --> BODY[Body Parser]
    BODY --> SAN[Sanitize]
    SAN --> LIMIT[Rate Limiter]
    LIMIT --> SESS[Session]
    SESS --> ROUTE{Route?}
    ROUTE -->|/feed/*| AUTH_MW[Auth Middleware]
    ROUTE -->|/auth/*| AUTH_CTRL[Auth Routes]
    AUTH_MW --> POST_CTRL[Post Routes]
    AUTH_CTRL --> RES[Response]
    POST_CTRL --> RES
```

---

## Diagram Summary

| Diagram | Purpose |
|---------|---------|
| **1. System Context** | System boundaries, users, and external dependencies (DB, email, Cloudinary, Google). |
| **2. Functional Architecture** | Frontend vs backend blocks and their connections. |
| **3. Functional Modules** | Feature grouping: Auth, Feed, Profile, Supporting. |
| **4. Data Flow** | Sequence from user action to DB and back. |
| **5. Auth Flow** | High-level login/signup and token handling. |
| **6. Feed/Post Flow** | How feed, search, detail, and CRUD interact with API and store. |
| **7. Frontend Layering** | Pages, components, and state/API. |
| **8. Backend Pipeline** | Middleware and routing order. |

*To view Mermaid diagrams: use GitHub, VS Code (Mermaid extension), or paste the code blocks into [mermaid.live](https://mermaid.live).*
