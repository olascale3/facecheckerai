# FaceChecker.AI

## Overview
AI-powered reverse face search platform. Users upload a face photo, the system simulates scanning billions of images across the internet, and presents results showing where the face appears online. Free users see blurred/partial results; they pay via crypto to unlock full details.

## Recent Changes
- 2026-02-10: Added admin panel at /admin with password-protected dashboard, search list, full result viewing, and stats
- 2026-02-10: Updated payment to Solana network (wallet: 6D9hPAdCYbH2tXRra6gVQn5P1AToLseyirvpQtbziFk9)
- 2026-02-10: Initial MVP built with landing page, scanning animation, results with payment gating

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui, wouter routing, TanStack Query
- **Backend**: Express.js API
- **Database**: PostgreSQL with Drizzle ORM
- **Theme**: Dark cyber-security aesthetic with cyan/teal primary accents

## Key Pages
- `/` - Landing page with hero, upload zone, how-it-works, features, pricing
- `/scanning/:id` - Animated scanning progress page
- `/results/:id` - Results page with blurred previews and unlock flow
- `/admin` - Password-protected admin dashboard with all searches, results, and stats

## API Routes
- `POST /api/searches` - Create search with base64 imageData
- `GET /api/searches/:id` - Get search status
- `GET /api/searches/:id/results` - Get search results
- `POST /api/searches/:id/unlock` - Unlock results with txHash
- `POST /api/admin/login` - Admin login with password, returns HMAC token
- `GET /api/admin/searches` - List all searches (admin, requires Bearer token)
- `GET /api/admin/searches/:id` - Full search details with unblurred results (admin)
- `GET /api/admin/stats` - Dashboard stats (admin)

## Database Tables
- `searches` - Stores search sessions with image data and status
- `search_results` - Individual match results per search
- `payments` - Payment records for unlocks

## Configuration
- Solana wallet address hardcoded in `server/routes.ts`
- Price is $9.99 per search unlock
- JSON body limit set to 50MB for base64 images
- Admin password set via ADMIN_PASSWORD env var
- Admin tokens: HMAC-generated, 24h expiry, rate-limited login (10 attempts/min)
