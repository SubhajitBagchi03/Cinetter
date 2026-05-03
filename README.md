# Cinetter

A full-stack cinema intelligence platform for discovering, tracking, and discussing films and television. Built as a personal project to explore full-stack architecture, real-time features, and third-party API integration at scale.

---

## Overview

Cinetter is a media tracking and discovery application that aggregates data from The Movie Database (TMDB) API and layers social, analytical, and AI-driven features on top. Users can track their watchlist, write reviews, explore upcoming releases, discuss content in community spaces, and receive AI-powered recommendations.

---

## Features

**Discovery**
- Trending, popular, top-rated, and now-playing movie and TV feeds
- Genre-based and OTT provider-based content discovery
- Advanced search with real-time results

**Drop Radar (Release Schedule)**
- Releasing Today — movies and TV shows dropping on the current date
- Dropping Soon — confirmed upcoming releases with future premiere dates
- View Past Drops — paginated history of recent theatrical releases
- Filter by All, Films, or Shows with contextual sub-filters

**Movie and TV Detail Pages**
- Full cast and crew with clickable profiles
- Season and episode breakdowns for TV
- Watch provider availability by region
- Similar titles and collection grouping

**User Features**
- JWT-based authentication with secure HTTP-only cookies
- Watchlist management with watched/unwatched state
- Star ratings and written reviews with community voting
- User profiles with Taste DNA — a visual breakdown of genre preferences
- Collections — curated personal or public lists

**Social — Spaces**
- Community discussion threads scoped to specific titles
- Real-time updates via Socket.IO

**AI Tools**
- Mood-based recommendation engine
- CineRoast — AI-generated critical takes on films
- Director's Chair — contextual analysis and filmography insights

**Interest and Notifications**
- Mark unreleased titles as Interested
- Automated release-day email notifications via Resend (cron job at 00:00 IST)

**Admin**
- Feature flag management
- Content moderation dashboard
- User management

---

## Technology Stack

### Client
- React 18 with Vite
- React Router v6
- Framer Motion for animations
- Socket.IO client for real-time features
- Lucide React for icons

### Server
- Node.js with Express (ESM)
- MongoDB with Mongoose
- Redis for API response caching (ioredis)
- BullMQ for background job queuing
- node-cron for scheduled tasks
- Socket.IO for real-time communication
- Resend for transactional email
- JWT for authentication

### External APIs
- The Movie Database (TMDB) API
- Resend Email API

---

## Project Structure

```
Cinetter/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── contexts/        # React context providers
│       ├── lib/             # API client and utilities
│       └── pages/           # Route-level page components
└── server/                  # Node.js backend (Express)
    └── src/
        ├── jobs/            # Cron jobs and background workers
        ├── middleware/      # Auth, error handling, rate limiting
        └── modules/         # Feature modules (movies, users, reviews, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- Redis instance
- TMDB API key
- Resend API key (optional, for email notifications)

### Environment Variables

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
JWT_SECRET=your_jwt_secret
TMDB_API_KEY=your_tmdb_api_key
RESEND_API_KEY=your_resend_api_key
CLIENT_URL=http://localhost:5173
```

### Installation

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running Locally

```bash
# Start the backend (from /server)
npm run dev

# Start the frontend (from /client)
npm run dev
```

The client runs on `http://localhost:5173` and the API on `http://localhost:5000`.

---

## Architecture Notes

- All TMDB responses are cached in Redis with TTL-based invalidation to stay within API rate limits.
- The interest/notification system uses MongoDB to persist user interest records and a daily cron job to batch-send release-day emails.
- Feature flags are stored in MongoDB and exposed via a protected admin endpoint, allowing runtime toggling of features without redeployment.

---

## Author

Subhajit Bagchi
