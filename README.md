# Idea Bank

An intelligent idea bank that deeply researches business ideas on-demand. **Core philosophy: Neutral, complete, consistent research** - no false encouragement, just comprehensive facts.

## Features

- **Freeform Idea Capture** - Notes-app feel with auto-save
- **Manual Research Trigger** - User controls when research happens
- **Visual Board View** - Grid layout with custom ranking (Top 1, 2, 3)
- **Background Research** - Continues even when you tab away
- **Multi-Source Discovery** - Web, Product Hunt, GitHub, Reddit/HN
- **Neutral AI Assessment** - Realistic novelty scores without optimism bias

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Background Jobs**: BullMQ + Redis
- **AI**: Anthropic Claude API (Sonnet 4)
- **Research APIs**: SerpAPI, Product Hunt, Crunchbase, GitHub

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Option A: Neon (Recommended - Free)**
1. Go to https://neon.tech
2. Create a free account and project
3. Copy the connection string
4. Add to `.env` as `DATABASE_URL`

**Option B: Supabase**
1. Go to https://supabase.com
2. Create a free account and project
3. Go to Settings → Database
4. Copy the connection string (use "Connection Pooling" URL)
5. Add to `.env` as `DATABASE_URL`

**Option C: Local PostgreSQL**
```bash
createdb ideabank
# Set DATABASE_URL="postgresql://user:password@localhost:5432/ideabank"
```

### 3. Set Up Redis (For Background Research)

**Option A: Upstash (Recommended - Free)**
1. Go to https://upstash.com
2. Create a free account and Redis database
3. Copy the connection string
4. Add to `.env` as `REDIS_URL`

**Option B: Local Redis**
```bash
docker run -d -p 6379:6379 redis
# Set REDIS_URL="redis://localhost:6379"
```

### 4. Set Up Claude API

1. Go to https://console.anthropic.com
2. Create an account and generate an API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

### 5. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 6. Initialize Database

```bash
npm run db:generate   # Generate Prisma Client
npm run db:push       # Push schema to database
```

### 7. Start Development

```bash
# Terminal 1: Next.js server
npm run dev

# Terminal 2: Background worker (for research)
npm run worker
```

Visit http://localhost:3000

## Usage

1. **Create an idea** - Click "New Idea" button
2. **Write content** - Add a title and description (auto-saves)
3. **Research** - Click the "Research" button when ready
4. **Rank ideas** - Hover card menu → "Set as #1, #2, #3"
5. **Shelve ideas** - Hover card menu → "Shelve idea"

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── ideas/         # Ideas CRUD + research
│   ├── ideas/             # Ideas pages (list, editor)
│   └── globals.css        # Tailwind theme
├── components/            # React components (shadcn/ui)
├── lib/
│   ├── db.ts             # Prisma client singleton
│   ├── ai/               # Claude API integration
│   ├── queue/            # BullMQ setup
│   └── research/         # Research logic
├── prisma/
│   └── schema.prisma     # Database models
└── workers/              # Background workers
```

## Scripts

```bash
npm run dev          # Start dev server
npm run worker       # Start background worker
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to DB
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio GUI
```

## Environment Variables

```bash
DATABASE_URL=         # PostgreSQL connection string
REDIS_URL=            # Redis connection string
ANTHROPIC_API_KEY=    # Claude API key
SERPAPI_API_KEY=      # Web search (optional)
PRODUCT_HUNT_API_KEY= # Product data (optional)
GITHUB_TOKEN=         # GitHub API (optional)
```

## Current Status

**Working:**
- Create, edit, delete ideas with auto-save
- Manual "Research" button
- Visual board view with card grid
- Ranking system (#1, #2, #3)
- Shelving with collapsible section
- Background AI analysis worker

**In Progress:**
- SSE for real-time progress streaming
- Web search worker (SerpAPI)
- Results display UI

## Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running

### "Prisma Client not generated"
```bash
npm run db:generate
```

### "Table does not exist"
```bash
npm run db:push
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

## License

MIT
