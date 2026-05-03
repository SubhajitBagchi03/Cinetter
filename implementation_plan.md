# 🏗️ CINETTER — Architecture & System Design
### Comprehensive Technical Reference Document

---

## 1. SYSTEM OVERVIEW

**Cinetter** is a full-stack, real-time, AI-powered movie discovery and social platform built to handle 100K+ concurrent users. The architecture is modular, stateless, and horizontally scalable.

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENTS                          │
│           React SPA (Vite + Tailwind + Framer)          │
└─────────────────────┬───────────────────────────────────┘
                       │ HTTPS / WSS
┌─────────────────────▼───────────────────────────────────┐
│                    API GATEWAY LAYER                     │
│          Express.js — /api/v1/ — Port 5000              │
│     Helmet │ CORS │ Rate Limiting │ JWT Auth │ Zod       │
└──┬──────────────────────────┬──────────────────────┬────┘
   │                          │                       │
┌──▼──────────┐  ┌────────────▼──────┐  ┌────────────▼───┐
│  REST API   │  │   Socket.io       │  │   BullMQ       │
│  Modules    │  │   Real-time       │  │   Job Queue    │
└──┬──────────┘  └────────────┬──────┘  └────────────┬───┘
   │                          │                       │
┌──▼──────────────────────────▼───────────────────────▼───┐
│                     DATA LAYER                           │
│         MongoDB (primary)   │   Redis (cache + queue)    │
└──────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────┐
│                   EXTERNAL SERVICES                       │
│                    TMDB API (movies data)                 │
└───────────────────────────────────────────────────────────┘
```

---

## 2. DIRECTORY STRUCTURE

```
d:\Cinetter\
├── design.md                    # Visual Bible (single source of truth — UI)
├── implementation_plan.md       # This file — Architecture reference
├── task_planner.md              # Sprint tracker with all tasks
│
├── client/                      # React + Vite + Tailwind
│   ├── public/
│   │   └── logo.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/              # Reusable primitives
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Tooltip.jsx           # Component 13
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   └── Badge.jsx
│   │   │   ├── motion/          # The 15 Modern Components
│   │   │   │   ├── DynamicIsland.jsx     # Component 1
│   │   │   │   ├── ParallaxHero.jsx      # Component 2
│   │   │   │   ├── InfiniteCanvas.jsx    # Component 3
│   │   │   │   ├── FeatureBlock.jsx      # Component 4
│   │   │   │   ├── ExpandableTabs.jsx    # Component 5
│   │   │   │   ├── RollingText.jsx       # Component 6
│   │   │   │   ├── AnimatedIcon.jsx      # Component 7
│   │   │   │   ├── AIGradient.jsx        # Component 8
│   │   │   │   ├── AnimatedInput.jsx     # Component 9
│   │   │   │   ├── ExpandHover.jsx       # Component 10
│   │   │   │   ├── NavPill.jsx           # Component 11
│   │   │   │   ├── CardStack.jsx         # Component 12
│   │   │   │   ├── CommandSearch.jsx     # Component 14
│   │   │   │   └── Carousel.jsx          # Component 15 (all variants)
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── MobileNav.jsx
│   │   │   │   └── Preloader.jsx
│   │   │   ├── movies/
│   │   │   │   ├── MovieCard.jsx
│   │   │   │   ├── MovieHero.jsx
│   │   │   │   ├── MovieGrid.jsx
│   │   │   │   └── MovieRow.jsx
│   │   │   ├── cinepulse/
│   │   │   │   ├── CinePulseMeter.jsx
│   │   │   │   ├── CinePulseDonut.jsx
│   │   │   │   ├── VoteBar.jsx
│   │   │   │   └── CinePulseBadge.jsx
│   │   │   ├── reviews/
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── ReviewForm.jsx
│   │   │   │   └── ReviewThread.jsx
│   │   │   ├── social/
│   │   │   │   ├── FeedCard.jsx
│   │   │   │   └── TopicSidebar.jsx
│   │   │   ├── collections/
│   │   │   │   ├── CollectionCard.jsx
│   │   │   │   └── CollectionGrid.jsx
│   │   │   └── ai/
│   │   │       ├── MoodEngine.jsx
│   │   │       ├── CineRoast.jsx
│   │   │       ├── DejaView.jsx
│   │   │       ├── DirectorsChair.jsx
│   │   │       └── TasteDNA.jsx
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Explore.jsx
│   │   │   ├── MovieDetail.jsx
│   │   │   ├── Schedule.jsx
│   │   │   ├── Spaces.jsx
│   │   │   ├── Collections.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PersonDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/
│   │   │       └── Dashboard.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useDebounce.js
│   │   │   ├── useInfiniteScroll.js
│   │   │   └── useLocalStorage.js
│   │   ├── lib/
│   │   │   └── api.js             # Axios instance + interceptors
│   │   ├── utils/
│   │   │   ├── animations.js      # Framer Motion presets
│   │   │   └── format.js          # Date, number formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css              # Design tokens + global styles
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/
    ├── src/
    │   ├── config/
    │   │   ├── index.js            # All env vars
    │   │   ├── db.js               # MongoDB connection
    │   │   └── redis.js            # Redis connection
    │   ├── middleware/
    │   │   ├── auth.js             # JWT + RBAC
    │   │   ├── errorHandler.js     # Global error + ApiError class
    │   │   └── rateLimiter.js      # Multiple limiters
    │   ├── modules/
    │   │   ├── auth/
    │   │   │   ├── user.model.js
    │   │   │   ├── auth.controller.js
    │   │   │   ├── auth.validation.js
    │   │   │   └── auth.routes.js
    │   │   ├── movies/
    │   │   │   ├── tmdb.service.js
    │   │   │   ├── movies.controller.js
    │   │   │   └── movies.routes.js
    │   │   ├── cinepulse/
    │   │   │   ├── vote.model.js
    │   │   │   ├── cinepulse.controller.js
    │   │   │   └── cinepulse.routes.js
    │   │   ├── reviews/
    │   │   │   ├── review.model.js
    │   │   │   ├── reviews.controller.js
    │   │   │   └── reviews.routes.js
    │   │   ├── watchlist/
    │   │   │   └── watchlist.routes.js
    │   │   ├── collections/
    │   │   │   ├── collection.model.js
    │   │   │   ├── collections.controller.js
    │   │   │   └── collections.routes.js
    │   │   ├── social/
    │   │   │   ├── post.model.js
    │   │   │   ├── social.controller.js
    │   │   │   └── social.routes.js
    │   │   ├── users/
    │   │   │   ├── users.controller.js
    │   │   │   └── users.routes.js
    │   │   ├── ai/
    │   │   │   ├── mood.service.js
    │   │   │   ├── roast.service.js
    │   │   │   └── ai.routes.js
    │   │   ├── analytics/
    │   │   │   ├── analytics.model.js
    │   │   │   ├── analytics.controller.js
    │   │   │   └── analytics.routes.js
    │   │   ├── admin/
    │   │   │   ├── admin.controller.js
    │   │   │   └── admin.routes.js
    │   │   ├── moderation/
    │   │   │   ├── report.model.js
    │   │   │   ├── moderation.controller.js
    │   │   │   └── moderation.routes.js
    │   │   └── featureFlags/
    │   │       ├── featureFlag.model.js
    │   │       └── featureFlags.routes.js
    │   ├── jobs/
    │   │   ├── queue.js             # BullMQ setup
    │   │   ├── trending.job.js
    │   │   ├── spamCleanup.job.js
    │   │   ├── cinepulseRecalc.job.js
    │   │   └── analyticsAggregate.job.js
    │   ├── sockets/
    │   │   ├── index.js             # Socket.io init
    │   │   ├── vote.socket.js
    │   │   ├── comment.socket.js
    │   │   └── notification.socket.js
    │   ├── utils/
    │   │   └── logger.js            # Winston
    │   ├── app.js                   # Express app
    │   └── index.js                 # HTTP server entry
    ├── logs/
    ├── .env
    └── package.json
```

---

## 3. DATABASE DESIGN (MongoDB)

### 3.1 Users Collection
```js
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed, bcrypt),
  role: Enum ['user','moderator','admin'],
  avatar: String (URL),
  bio: String (max 500),
  followers: [ObjectId → User],
  following: [ObjectId → User],
  watchlist: [Number],           // TMDB movie IDs
  isBanned: Boolean,
  refreshToken: String (hashed),
  lastLogin: Date,
  createdAt, updatedAt: Date
}
```

### 3.2 Votes Collection (CinePulse)
```js
{
  _id: ObjectId,
  userId: ObjectId → User (indexed),
  movieId: Number (TMDB ID, indexed),
  category: Enum ['drop','chill','engage','masterpiece'],
  createdAt: Date,
  // Compound unique index: { userId, movieId } — 1 vote per user per movie
}
```

### 3.3 Reviews Collection
```js
{
  _id: ObjectId,
  userId: ObjectId → User (indexed),
  movieId: Number (TMDB ID, indexed),
  text: String (max 2000),
  cinePulseCategory: Enum ['drop','chill','engage','masterpiece'],
  hasSpoiler: Boolean,
  likes: [ObjectId → User],
  likeCount: Number,             // denormalized for performance
  replies: [{
    userId: ObjectId → User,
    text: String,
    likes: [ObjectId],
    createdAt: Date
  }],
  isRemoved: Boolean,
  createdAt, updatedAt: Date
}
// Indexes: { movieId, createdAt }, { userId }, { likeCount }
```

### 3.4 Collections Collection
```js
{
  _id: ObjectId,
  name: String,
  description: String,
  coverMovieIds: [Number],       // First 3 TMDB IDs for cover collage
  movies: [Number],              // All TMDB IDs in collection
  authorId: ObjectId → User,
  isPublic: Boolean,
  likes: [ObjectId → User],
  likeCount: Number,
  savedBy: [ObjectId → User],
  createdAt, updatedAt: Date
}
```

### 3.5 Posts Collection (Spaces)
```js
{
  _id: ObjectId,
  authorId: ObjectId → User,
  type: Enum ['news','discussion','poll'],
  title: String,
  content: String,
  mediaUrl: String,
  topics: [Enum ['Indian','International','Anime','Sports','Games']],
  likes: [ObjectId → User],
  likeCount: Number,
  comments: [{
    userId: ObjectId,
    text: String,
    createdAt: Date
  }],
  linkedMovieId: Number,         // optional TMDB reference
  isRemoved: Boolean,
  createdAt, updatedAt: Date
}
```

### 3.6 Reports Collection
```js
{
  _id: ObjectId,
  reporterId: ObjectId → User,
  targetType: Enum ['review','post','comment','user'],
  targetId: ObjectId,
  reason: String,
  status: Enum ['pending','approved','rejected'],
  handledBy: ObjectId → User,
  createdAt, updatedAt: Date
}
```

### 3.7 FeatureFlags Collection
```js
{
  _id: ObjectId,
  name: String (unique),        // 'ai_recommendations', 'cinepulse', 'watch_party'
  enabled: Boolean,
  rolloutPercent: Number (0-100),
  description: String,
  updatedAt: Date
}
```

### 3.8 Analytics Collection
```js
{
  _id: ObjectId,
  event: Enum ['page_view','search','watchlist_add','vote','review_post','movie_click'],
  userId: ObjectId,             // optional
  movieId: Number,              // optional
  query: String,                // for searches
  metadata: Object,
  createdAt: Date               // TTL index: 90 days
}
```

### 3.9 MongoDB Indexes Summary
```
users:       { username:1 }, { email:1 }, { role:1 }
votes:       { userId:1, movieId:1 } (unique), { movieId:1 }
reviews:     { movieId:1, createdAt:-1 }, { userId:1 }, { likeCount:-1 }
collections: { authorId:1 }, { isPublic:1, likeCount:-1 }
posts:       { topics:1, createdAt:-1 }, { authorId:1 }
analytics:   { event:1 }, { movieId:1 }, { createdAt:1 } (TTL 90d)
```

---

## 4. REDIS CACHING STRATEGY

```
Key Pattern                      TTL        Content
────────────────────────────────────────────────────────
trending:movies                  1 hour     TMDB trending array
movie:detail:{tmdbId}            24 hours   Full movie details
movie:credits:{tmdbId}           24 hours   Cast + crew
movie:similar:{tmdbId}           6 hours    Similar movies array
cinepulse:{movieId}              5 minutes  Score + distribution
cinepulse:{movieId}:vote:{uid}   7 days     User's vote (prevent re-calc)
search:{query}                   30 minutes Search results
session:{userId}                 15 min     Active session data
feature_flags                    5 minutes  All feature flags
```

---

## 5. API ENDPOINTS REFERENCE

### Auth `/api/v1/auth`
```
POST   /register       Public    Register new user
POST   /login          Public    Login, receive tokens
POST   /refresh-token  Public    Rotate refresh token
POST   /logout         Auth      Invalidate refresh token
GET    /me             Auth      Get current user
```

### Movies `/api/v1/movies`
```
GET    /trending       Public    Trending (Redis cached 1hr)
GET    /search         Public    TMDB multi-search (debounced)
GET    /:id            Public    Movie detail (cached 24hr)
GET    /:id/credits    Public    Cast & crew
GET    /:id/similar    Public    Similar movies
GET    /:id/videos     Public    Trailers
```

### CinePulse `/api/v1/cinepulse`
```
POST   /vote           Auth      Vote (1 per user/movie)
GET    /:movieId       Public    Score + category %
DELETE /vote/:movieId  Auth      Remove vote
```

### Reviews `/api/v1/reviews`
```
POST   /               Auth+Limit  Create review
GET    /:movieId       Public      Get reviews (paginated, sorted)
PATCH  /:id            Auth+Owner  Edit own review
DELETE /:id            Auth+Owner  Delete own review
POST   /:id/like       Auth        Toggle like
POST   /:id/reply      Auth        Add reply
DELETE /:id/reply/:rid Auth+Owner  Delete reply
POST   /:id/report     Auth        Report review
```

### Watchlist `/api/v1/watchlist`
```
GET    /               Auth    Get user's watchlist (TMDB data)
POST   /               Auth    Add movie (TMDB ID)
DELETE /:movieId       Auth    Remove movie
```

### Collections `/api/v1/collections`
```
GET    /discover       Public  Browse public collections
GET    /my             Auth    User's own collections
GET    /saved          Auth    Saved collections
POST   /               Auth    Create collection
GET    /:id            Public  Get collection detail
PATCH  /:id            Auth+Owner  Edit collection
DELETE /:id            Auth+Owner  Delete collection
POST   /:id/like       Auth    Toggle like
POST   /:id/save       Auth    Save/unsave collection
POST   /:id/movies     Auth+Owner  Add movie
DELETE /:id/movies/:mid Auth+Owner Remove movie
```

### Social/Spaces `/api/v1/spaces`
```
GET    /feed           Auth    Get feed (topic-filtered, paginated)
POST   /               Auth    Create post
GET    /:id            Public  Single post
POST   /:id/like       Auth    Toggle like
POST   /:id/comment    Auth    Add comment
DELETE /:id            Auth+Owner  Delete post
POST   /:id/report     Auth    Report post
```

### Users `/api/v1/users`
```
GET    /:id            Public  User profile
PATCH  /me             Auth    Update own profile
POST   /:id/follow     Auth    Follow user
DELETE /:id/follow     Auth    Unfollow user
GET    /:id/reviews    Public  User's reviews
GET    /:id/collections Public User's collections
```

### AI `/api/v1/ai`
```
POST   /mood-recommend Auth    Mood → movie recommendations
POST   /cine-roast     Auth    Generate movie roast
POST   /deja-view      Auth    Scene description → match
POST   /directors-chair Auth   AI movie pitch generator
GET    /taste-dna/:uid Auth    Generate taste fingerprint
```

### Analytics `/api/v1/analytics`
```
POST   /track          Public  Track event (fire-and-forget)
GET    /dashboard      Admin   Analytics summary
```

### Admin `/api/v1/admin`
```
GET    /users          Admin   List all users (paginated)
PATCH  /ban-user/:id   Admin   Ban/unban user
DELETE /review/:id     Admin   Delete any review
GET    /reports        Admin   All reports
GET    /analytics      Admin   Platform analytics
```

### Moderation `/api/v1/moderation`
```
GET    /reported       Mod+    Pending reported content
PATCH  /approve/:id    Mod+    Approve (dismiss) report
DELETE /remove/:id     Mod+    Remove reported content
```

### Feature Flags `/api/v1/feature-flags`
```
GET    /               Auth    Get all flags (respects role)
PATCH  /:name          Admin   Toggle flag
```

### System
```
GET    /health         Public  Health check (DB + Redis status)
```

---

## 6. REAL-TIME ARCHITECTURE (Socket.io)

```
Events Flow:

CLIENT                          SERVER
  │                               │
  ├─── join:movie:{id} ─────────► │  Join movie room
  │                               │
  │◄── cinepulse:update ──────────┤  Broadcast vote to room
  │◄── review:new ────────────────┤  New review in room
  │◄── review:liked ──────────────┤  Review like update
  │                               │
  ├─── join:party:{roomId} ─────► │  Watch party join
  │◄── party:sync ────────────────┤  Playback sync timestamp
  │◄── party:reaction ────────────┤  Emoji reactions
  │                               │
  │◄── notification:new ──────────┤  Personal notification
  │◄── island:show ───────────────┤  Trigger Dynamic Island
```

**Rooms strategy**:
- `movie:{tmdbId}` — All users viewing same movie
- `party:{uuid}` — Watch party participants
- `user:{userId}` — Personal notification channel

---

## 7. BACKGROUND JOBS (BullMQ)

```
Queue: cinetter-jobs (Redis-backed)

Job Name                  Schedule      Description
─────────────────────────────────────────────────────────
update-trending           Every 1hr     Fetch TMDB trending, update Redis
recalc-cinepulse          Every 30min   Recalculate aggregate scores
cleanup-spam              Daily 3am     Remove flagged spam votes/reviews
aggregate-analytics       Daily 2am     Aggregate raw events into summaries
purge-old-analytics       Weekly        Delete analytics events > 90 days

Each job: retry 3x, exponential backoff, Winston error logging
```

---

## 8. FEATURE FLAGS

```
Flag Name               Default   Description
─────────────────────────────────────────────────────────
ai_mood_engine          true      Show Mood Engine FAB
cinepulse_voting        true      Enable CinePulse voting
watch_party             false     Watch party feature (beta)
cine_roast              true      AI roast generator
deja_view               false     Scene matcher (heavy compute)
directors_chair         true      AI pitch generator
taste_dna               true      Taste fingerprint feature
spaces_discussions      true      Social spaces
admin_analytics_v2      false     New analytics dashboard
```

---

## 9. SECURITY ARCHITECTURE

```
Layer              Mechanism
───────────────────────────────────────────────────────
Transport          HTTPS enforced, HSTS headers (Helmet)
Auth               JWT (15min) + Refresh Token (7d, rotated)
RBAC               user < moderator < admin middleware chain
Input              Zod validation on all POST/PATCH bodies
Rate Limiting      Auth: 10/15min | API: 100/15min | Vote: 30/min
Passwords          bcrypt, cost factor 12
XSS                Helmet CSP headers, React auto-escaping
CSRF               SameSite cookies + origin validation
Injection          Mongoose parameterized queries, no raw $where
Bot Detection      Vote rate limiter + duplicate vote DB constraint
Headers            Helmet: X-Frame-Options, X-XSS-Protection, etc.
CORS               Whitelist CLIENT_URL only
```

---

## 10. SCALABILITY DESIGN (V2-Ready)

```
Current (V1):          Future (V2):
─────────────────────────────────────────────
Single Node.js         → Horizontal scaling (PM2 cluster / K8s)
Single MongoDB         → MongoDB Atlas replica set
Single Redis           → Redis Cluster / ElastiCache
Local BullMQ           → Distributed worker fleet
No CDN                 → CloudFront / Cloudflare for static assets
No load balancer       → AWS ALB / Nginx upstream
```

**Stateless by design**: No server-side sessions. JWT auth + Redis for shared state only. Any request can hit any node.

---

## 11. THE 5 UNIQUE STANDOUT FEATURES

### 11.1 🎭 CineRoast — AI Satirical Roast Generator
AI generates brutally funny roasts of movies based on plot holes and tropes. Users share roasts socially. Viral shareability drives organic growth.

### 11.2 🔮 Déjà View — Scene Memory Matcher
"I've seen this scene before!" — Describe a scene, AI matches it to a movie using embedding similarity search across a scene description database.

### 11.3 🎬 Director's Chair — AI Movie Pitcher
Pitch a movie idea (genre + vibe + premise) → AI generates: title, tagline, poster concept, cast suggestions, and a predicted CinePulse score.

### 11.4 ⚡ Watch Party Sync
Real-time virtual watch parties with synchronized timestamps, live emoji reactions, sidebar discussion, and shared CinePulse voting during playback. Socket.io powered.

### 11.5 📊 Taste DNA — Visual Taste Fingerprint
Unique radar chart + color genome generated from watch history, CinePulse votes, and genre patterns. Compare your DNA with friends. Shareable as a card.

---

## 12. ENVIRONMENT VARIABLES

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/cinetter

# Cache & Queue
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=<strong-secret>
JWT_REFRESH_SECRET=<strong-refresh-secret>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# External
TMDB_API_KEY=<your-tmdb-key>
TMDB_BASE_URL=https://api.themoviedb.org/3

# Client
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

---

## 13. TECH STACK SUMMARY

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | SPA framework |
| Styling | Tailwind CSS v3 | Utility-first CSS |
| Animation | Framer Motion | 15 modern components |
| Routing | React Router v6 | Client-side routing |
| HTTP Client | Axios | API calls + interceptors |
| Real-time (FE) | socket.io-client | Live updates |
| Charts | Recharts | CinePulse, Analytics |
| Icons | Lucide React | Consistent icon set |
| Backend | Node.js + Express | REST API |
| Database | MongoDB + Mongoose | Primary data store |
| Cache | Redis + ioredis | Caching + rate limiting |
| Queue | BullMQ | Background jobs |
| Real-time (BE) | Socket.io | WebSocket server |
| Auth | JWT (jsonwebtoken) | Access + refresh tokens |
| Password | bcryptjs | Hashing |
| Validation | Zod | Schema validation |
| Logging | Winston | Structured logging |
| Security | Helmet + cors | HTTP headers |

---

*Version 2.0 — April 2026 | Architecture reference for Cinetter platform*
