# Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database

#### Option A: Local PostgreSQL
If you have PostgreSQL installed locally:

```bash
# Create a new database
createdb ideabank

# Copy environment file
cp .env.example .env

# Edit .env and set your DATABASE_URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/ideabank"
```

#### Option B: Hosted Database (Recommended for Testing)
Use a free hosted PostgreSQL database:

**Neon (Recommended)**
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Add to `.env` as `DATABASE_URL`

**Supabase**
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string (use "Connection Pooling" URL)
6. Add to `.env` as `DATABASE_URL`

### 3. Run Database Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR create a migration (for production)
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Testing the App (Without Auth)

Currently, the app uses a temporary user ID (`temp-user-id`) since authentication isn't set up yet. You can:

1. Create new ideas
2. Edit and auto-save ideas
3. Search ideas
4. Delete ideas

## Known Limitations (Current Phase)

- ❌ No authentication (all ideas use temp user)
- ❌ No background research yet (Phase 2)
- ❌ No AI analysis yet (Phase 2)
- ❌ Plain textarea instead of rich text editor (Phase 4)

## Phase 2: Research Infrastructure (Now Available!)

### Set Up Redis (Required for Background Research)

**Option A: Upstash (Recommended - Free)**
1. Go to https://upstash.com
2. Create a free account
3. Create a Redis database
4. Copy the connection string
5. Add to `.env` as `REDIS_URL`

**Option B: Local Redis**
```bash
# Install Redis locally or use Docker
docker run -d -p 6379:6379 redis
```

### Set Up Claude API

1. Go to https://console.anthropic.com
2. Create an account
3. Generate an API key
4. Add to `.env` as `ANTHROPIC_API_KEY`

### Running the Worker

To enable AI-powered research, run the background worker:

```bash
# In a separate terminal
npm run worker
```

This starts the AI analysis worker that processes research jobs.

### How It Works

1. Create or edit an idea (>50 words)
2. Worker automatically triggers research
3. AI analyzes the idea:
   - Novelty score (realistic, no optimism bias)
   - Existing solutions
   - Market landscape
   - Challenges and opportunities
4. Results saved to database

## Next Steps

After Phase 2 testing works:
1. Phase 3: Add more research sources (web search, Product Hunt, etc.)
2. Phase 4: Rich text editor and UI polish
3. Add NextAuth.js for real user authentication

## Troubleshooting

### "Cannot connect to database"
- Check your `DATABASE_URL` in `.env`
- Make sure PostgreSQL is running (if local)
- Try using a hosted database (Neon/Supabase)

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
# Kill the process on port 3000 or use a different port
npm run dev -- -p 3001
```

## Database GUI

To view your database:
```bash
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555
