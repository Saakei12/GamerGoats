# GamerGoats — Discover Your Next Game

> **Premium, minimalist PC game discovery platform.**  
> Automatically discovers and retrieves video game information from external APIs and recommends games tailored to user preferences, hardware targets, and playstyles.

---

## 🌟 Visual Identity & Design Principles

Inspired by:
- **Apple**: Clean typography, generous spacing, restrained accents, minimal borders.
- **Steam**: Deep discovery, rich genre categorization, and hardware requirements.
- **Epic Games Store**: High-resolution cinematic game artwork and curated presentations.

### Visual Architecture
- **Palette**: Deep charcoal and black (`#09090b`, `#121214`, `#18181b`) with subtle emerald (`#10b981`), amber (`#f59e0b`), and muted zinc accents.
- **Restraint**: Zero neon clutter, zero generic AI placeholders, focused on high-quality artwork and readable typography.
- **Responsive**: Fluid navigation and layouts across mobile, tablet, and ultra-wide displays.

---

## 🕹️ Core Features

### 1. Navigation
- **GamerGoats Logo**: Minimalist geometric goat horn glyph with subtle hover glow.
- **Discover**: Full cinematic homepage with personalized rails and hero spotlight.
- **Categories**: Multi-genre filterable catalogue.
- **Free Games**: Dedicated hub for 100% Free-to-Play games and active PC giveaways.
- **Instant Search**: Debounced search by title, mechanics, developer, or genre with filter chips and search history.
- **Player Profile**: Anonymous session manager for bookmarks, active taste profile tags, and hardware target.

### 2. Homepage Sections
- **A. Hero Spotlight**: Large cinematic artwork, release date, tags, and quick-action buttons.
- **B. For You (Personalized Recommendations)**: Matches games against user-selected tags, calculating transparent match scores (e.g. `98% MATCH`) and highlighting matching criteria.
- **C. Trending**: Currently popular and high-traffic PC releases with smooth horizontal carousel navigation.
- **D. Free to Play & Giveaways**: Highlighting active giveaways (Steam, Epic, GOG) with original worth and direct claim links.
- **E. Hidden Gems**: Atmospheric, highly-rated, and artistic indie gems.
- **F. Explore by Genre**: Interactive visual cards covering Action, Adventure, Racing, Horror, RPG, Survival, Strategy, and Simulation.

### 3. Personalized Recommendation System
- **Interactive Onboarding Modal**:
  - **Genre**: Action, Adventure, Racing, Horror, RPG, Strategy, Simulation, Sports, Shooter
  - **Gameplay**: Open World, Survival, Story Rich, Stealth, Exploration, Sandbox
  - **Multiplayer**: Single Player, Co-op, PvP, Online Multiplayer
  - **Visual Style**: Realistic, Pixel Art, Anime, Stylized
  - **Performance / Hardware**: Low-End PC, Mid-Range PC, High-End PC
- **Algorithm**:
  - Computes weighted tag overlap across categories.
  - Factors in Metacritic/community ratings and popularity.
  - Dynamically recalculates scores across the app upon tag changes.
  - Persisted in browser `localStorage` for privacy and instant responsiveness.

### 4. Automatic Game Retrieval & Backend Service
- **FreeToGame API**: Aggregates hundreds of PC titles, detailed system requirements, screenshots, and developer info.
- **GamerPower API**: Live PC game giveaway tracker across Steam, Epic Store, and GOG.
- **RAWG API**: Configurable support for RAWG's comprehensive database (`RAWG_API_KEY`).
- **Curated Database**: Verified AAA PC masterpieces (Cyberpunk 2077, Baldur's Gate 3, Elden Ring, Hollow Knight, Hades II, etc.) with official links and system specifications.
- **Normalization & Deduplication**: Canonical slug and normalized title comparison eliminates duplicates across providers.
- **Scheduled Background Sync**: Automatic re-indexing every 12 hours with error handling and rate-limiting safeguards.

### 5. Game Detail Page (`/game/:id`)
- Full-bleed cinematic backdrop with vignette gradient.
- Detailed developer, publisher, and release date metadata.
- Match score pill based on active user preferences.
- Screenshots gallery with fullscreen interactive lightbox viewer.
- PC System Requirements breakdown (Minimum vs Recommended OS, CPU, RAM, GPU, Storage).
- Official store links (Steam, Epic Games Store, official publishers).
- "More Games Like This" contextual recommendation rail.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4, Lucide React Icons |
| **Routing** | React Router v7 |
| **Backend** | Node.js (v22), Express (ESM) |
| **APIs** | FreeToGame, GamerPower, RAWG |
| **Storage / State** | In-Memory Aggregator Cache + Browser LocalStorage |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.x
- npm >= 9.x

### Installation

1. Clone or open the repository:
   ```bash
   cd d:\GamerGoats
   ```

2. Install dependencies:
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. (Optional) Configure environment variables:
   Create `server/.env`:
   ```env
   PORT=5000
   RAWG_API_KEY=your_optional_rawg_api_key
   ```

4. Run the development environment:
   ```bash
   # Terminal 1: Start Backend API
   cd server
   node src/index.js

   # Terminal 2: Start Frontend Client
   cd client
   npm run dev
   ```

5. Open your browser at `http://localhost:5173/`.

---

## 📦 Production Build

```bash
cd client
npm run build
```
Generates an optimized bundle ready for deployment to Cloudflare Pages, Vercel, or any static hosting service.

