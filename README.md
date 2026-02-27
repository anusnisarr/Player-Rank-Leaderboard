# CS2 RANK — Player Intelligence Platform

A full-stack CS2 player ranking and stats tracking app built with **Next.js**, **Node.js/Express**, and **MongoDB/Mongoose**.

---

## Features

- **Leaderboard** — Full sortable/filterable ranking table with tier + role categorization
- **Podium** — Top 3 players highlighted with tier-colored cards
- **Manual Stat Entry** — Add matches with per-player K/D/A/HS/ADR/KAST
- **Auto Rating** — HLTV Rating 2.0-inspired formula computed on every match
- **Tier System** — S/A/B/C/D tiers auto-assigned from rating
- **Role Detection** — Entry Fragger / AWPer / Support / Lurker / IGL from stat patterns
- **Player Profiles** — Radar chart, tier breakdown, match history, rating trend chart
- **Match History** — Expandable match cards with per-player scorecards + MVP highlight
- **Delete & Recompute** — Deleting a match auto-recalculates all affected player ratings

---

## Tech Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | Next.js 14 (App Router)       |
| Styling   | Tailwind CSS + custom CSS     |
| Charts    | Recharts                      |
| Backend   | Node.js + Express             |
| Database  | MongoDB + Mongoose            |
| HTTP      | Axios                         |

---

## Quick Start

### Option A: Docker (recommended)

```bash
git clone <repo>
cd cs2-ranking
docker-compose up --build
```

Open http://localhost:3000

---

### Option B: Manual

#### 1. MongoDB
Make sure MongoDB is running locally on port 27017.

#### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Runs on http://localhost:5000
```

#### 3. Frontend

```bash
cd frontend
# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
npm install
npm run dev
# Runs on http://localhost:3000
```

---

## Rating Formula

Based on HLTV Rating 2.0:

```
Rating = 
  Kill Rating (0.38)       → KPR / avg_KPR
  + Survival Rating (0.22) → (Rounds - Deaths) / Rounds
  + KAST Rating (0.22)     → KAST% / 100
  + Assist Rating (0.10)   → APR / avg_APR
  + HS Rating (0.04)       → HSR / avg_HSR
  + ADR Rating (0.04)      → ADR / avg_ADR
```

### Tiers

| Tier | Rating    | Label      |
|------|-----------|------------|
| S    | 1.30+     | Elite      |
| A    | 1.10–1.29 | Strong     |
| B    | 0.90–1.09 | Solid      |
| C    | 0.70–0.89 | Average    |
| D    | < 0.70    | Developing |

### Roles (auto-detected from stats)

| Role          | Detection Logic                      |
|---------------|--------------------------------------|
| AWPer         | HS% > 55 and ADR > 90                |
| Entry Fragger | KPR > 0.82 and APR < 0.28            |
| Support       | APR > 0.45                           |
| IGL           | ADR > 82 and KPR < 0.68              |
| Lurker        | Default (balanced stats)             |

---

## API Reference

### Players
| Method | Route            | Description              |
|--------|------------------|--------------------------|
| GET    | /api/players     | All players (leaderboard)|
| GET    | /api/players/:id | Single player + history  |
| POST   | /api/players     | Create player            |
| PUT    | /api/players/:id | Update player info       |
| DELETE | /api/players/:id | Delete player            |

### Matches
| Method | Route             | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | /api/matches      | All matches (paginated)              |
| GET    | /api/matches/:id  | Single match detail                  |
| POST   | /api/matches      | Add match (triggers rating update)   |
| DELETE | /api/matches/:id  | Delete match (recomputes all stats)  |

### Player filter/sort params (GET /api/players)
- `sort` — `rating | totalKills | matchesPlayed | wins`
- `order` — `asc | desc`
- `tier` — `S | A | B | C | D`
- `role` — `Entry Fragger | AWPer | Support | Lurker | IGL`
- `team` — partial match string

---

## Project Structure

```
cs2-ranking/
├── backend/
│   ├── models/
│   │   ├── Player.js         # Player schema + rating statics
│   │   └── Match.js          # Match + per-player stat schema
│   ├── routes/
│   │   ├── players.js        # Player CRUD routes
│   │   └── matches.js        # Match routes + stat aggregation
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── page.js           # Leaderboard
│   │   ├── add-match/        # Match entry form
│   │   ├── add-player/       # Player registration
│   │   ├── matches/          # Match history
│   │   └── player/[id]/      # Player profile
│   ├── components/
│   │   ├── Navbar.js
│   │   └── UI.js             # Shared components
│   ├── lib/
│   │   ├── api.js            # Axios API calls
│   │   └── utils.js          # Helpers & constants
│   └── package.json
└── docker-compose.yml
```
