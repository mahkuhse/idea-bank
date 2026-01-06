# Claude Context: Idea Bank

## Quick Overview
An intelligent idea bank that deeply researches business ideas on-demand. **Core philosophy: Neutral, complete, consistent research** - no false encouragement, just comprehensive facts.

## Key Design Principles
1. **Neutrality First**: Counteract LLM optimism bias. No "Great idea!" - just facts.
2. **Manual Research Trigger**: User clicks "Research" button when ready - no auto-triggers
3. **Comprehensive Discovery**: Find what already exists across multiple sources
4. **Quantified Metrics**: "85% feature overlap" not "very similar"
5. **No Prescriptive Recommendations**: Provide data, let users decide
6. **Consistent & Reproducible**: Same input at same time = same results (temperature=0, fact-based)
7. **Visual Organization**: Each idea is its own space, board view with custom ranking
8. **Multi-format Support**: Capture everything - text, images, PDFs, videos, links

## Tech Stack
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL + Prisma ORM (v5)
- **Background Jobs**: BullMQ + Redis
- **AI**: Anthropic Claude API (Sonnet 4)
- **APIs**: SerpAPI, Product Hunt, Crunchbase, GitHub

## Project Structure
```
├── app/                   # Next.js App Router
│   ├── api/              # API routes (ideas CRUD, research)
│   ├── ideas/            # Ideas pages (list, editor)
│   └── globals.css       # Tailwind + shadcn theme
├── components/           # React components
│   ├── research-panel.tsx
│   ├── landscape-map.tsx
│   └── ...
├── lib/
│   ├── db.ts            # Prisma client singleton
│   ├── ai/              # Claude API integration
│   ├── queue/           # BullMQ setup
│   └── research/        # Research logic
├── prisma/
│   ├── schema.prisma    # Database models
│   └── prisma.config.ts # Prisma 7 config
└── workers/             # Background workers
    ├── ai-analysis-worker.ts
    ├── web-search-worker.ts
    └── ...
```

## Database Models (Key Ones)
- **User**: Authentication (NextAuth compatible)
- **Idea**: `title`, `content` (Tiptap JSON), `contentText` (plain), status, marketSaturation
- **ResearchResult**: Multi-source findings with `similarityScore`, `relevanceScore`, pricing/positioning JSON
- **AiInsight**: AI analysis with `type` enum, moat analysis, network effects
- **ResearchJob**: Background job tracking

## Implementation Phases
**Phase 1 - Foundation** ✅ COMPLETE
- [x] Next.js + TypeScript setup
- [x] Prisma schema with 10 models
- [x] shadcn/ui configured
- [x] Basic idea CRUD API routes
- [x] Idea list & editor pages
- [x] Auto-save functionality

**Phase 2 - Research Infrastructure** ✅ COMPLETE
- [x] BullMQ + Redis setup
- [x] Claude API integration (Sonnet 4)
- [x] AI analysis worker
- [x] Background job processing

**Phase 3 - Core MVP** (In Progress)
- [x] Remove auto-trigger, add manual "Research" button
- [x] Visual board view for ideas
- [x] Database schema updates (attachments, progress, ranking)
- [ ] SSE for real-time progress streaming
- [ ] Web search worker (SerpAPI)
- [ ] Results display UI (links, structured data)

**Phase 4 - Extended Research**
- [ ] Product Hunt worker
- [ ] GitHub worker
- [ ] Community discovery worker (Reddit/HN)
- [ ] File attachments system (multi-format)
- [ ] Chat interface for research Q&A

**Phase 5 - Polish & Launch**
- [ ] Ranking/shelving system with drag-drop
- [ ] Email notifications
- [ ] Rich text editor (Tiptap)
- [ ] NextAuth.js authentication
- [ ] Error boundaries
- [ ] Testing
- [ ] Deployment

## Code Conventions
1. **File Naming**: kebab-case for files, PascalCase for components
2. **Imports**: Use `@/` alias (e.g., `@/lib/db`, `@/components/...`)
3. **API Routes**: Next.js App Router conventions (`app/api/...`)
4. **Database**: Always use Prisma client from `@/lib/db`
5. **AI Prompts**: Emphasize neutrality, completeness, no encouragement

## Critical Files Reference
- `prisma/schema.prisma` - Database schema (10+ models)
- `lib/db.ts` - Prisma singleton
- `.env.example` - Required environment variables

## Environment Variables Needed
```bash
DATABASE_URL          # PostgreSQL connection
REDIS_URL            # Redis for BullMQ
NEXTAUTH_SECRET      # Auth secret
ANTHROPIC_API_KEY    # Claude API
SERPAPI_API_KEY      # Web search
PRODUCT_HUNT_API_KEY # Product data
CRUNCHBASE_API_KEY   # Startup data
GITHUB_TOKEN         # GitHub API
```

## Key Features to Implement
### Core (MVP)
1. **Freeform Idea Capture** - Rich text editor (Tiptap), auto-save
2. **Passive Background Research** - Triggers on changes, runs in background
3. **Competitive Landscape Map** - Visual positioning of competitors
4. **Community Discovery** - Reddit/HN discussions about the problem
5. **Moat Analysis** - Network effects, switching costs, defensibility
6. **Pricing Intelligence** - Competitor pricing models and trends
7. **People of Interest** - Domain experts, founders, investors

### Enhanced Features
- **5+ Research Sources**: Web, Product Hunt, Crunchbase, GitHub, Reddit/HN
- **Real-time Updates**: SSE for progressive result reveal
- **Similarity Scoring**: 0-100 feature overlap calculation
- **Neutral AI Assessment**: Realistic novelty scores, no optimism bias

## Research Flow (NEW - Manual Trigger)
1. User types idea → Auto-save (debounced 2-3s)
2. User clicks **"Research"** button when ready
3. Queue background jobs → Parallel research workers
4. AI analysis + Web search + Product Hunt + GitHub + Reddit/HN
5. Stream progress via SSE → Real-time updates (Claude Code style)
6. Present results in native formats → Links, images, PDFs, videos
7. User can interact via chat → Ask questions about research
8. Organize by similarity/relevance → Structured display

**Key Changes:**
- No auto-trigger (user controls when)
- Real-time progress visibility
- Multi-format result presentation
- Interactive chat with research

## Common Tasks
```bash
# Development
npm run dev              # Start dev server
npm run worker           # Start background worker (Phase 2+)
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to DB (no migration)
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio

# Add shadcn component
npx shadcn@latest add button

# Prisma commands
npx prisma studio        # DB GUI
npx prisma format        # Format schema
```

## Running the App (Phase 2+)
1. **Terminal 1:** `npm run dev` - Next.js server
2. **Terminal 2:** `npm run worker` - Background research worker
3. **Setup:** Database (Neon/Supabase) + Redis (Upstash) + Claude API key

## AI Prompt Guidelines
When implementing AI features, always:
- ✅ Use **temperature=0** for consistent, reproducible results
- ✅ Use neutral language: "Several existing solutions with similar features"
- ✅ Provide quantified metrics: "85% feature overlap"
- ✅ List ALL findings: If 8 competitors exist, show all 8
- ✅ Include challenges AND opportunities
- ✅ Fact-based analysis: Extract from real data, don't generate
- ❌ No encouragement: "Great idea!", "This could work!"
- ❌ No discouragement: "This won't work", "Give up"
- ❌ No prescriptive advice: "You should...", "Don't..."
- ❌ No randomness: Same input = same output (at same time)

### Example AI Prompt Template
```typescript
const prompt = `
You are a comprehensive research analyst. Provide a complete, neutral assessment.
Do NOT encourage or discourage - just provide facts.

Idea: ${idea.title}
Content: ${idea.content}

Task:
1. Novelty score (0-10, realistic calibration based on existing solutions)
2. List ALL existing solutions that do similar things
3. Feature comparison: what overlaps, what's different
4. Market landscape: who else is in this space, their traction
5. Challenges: what makes this difficult (evidence-based)
6. Opportunities: where gaps exist (evidence-based)

Be complete, neutral, and factual. Help user see the full picture.
`;
```

## Success Metrics
- **Primary**: Research completeness, false negatives minimized
- **Anti-metrics**: ❌ Inflated novelty scores, ❌ Missing obvious solutions, ❌ Emotional language

## Notes for AI Assistants
- This project uses Prisma 5
- shadcn/ui with Tailwind CSS v4 (@tailwindcss/postcss)
- No fulltext indexes in PostgreSQL (use regular indexes)
- Background jobs use BullMQ (separate worker process)
- NextAuth for authentication (models already in schema)

## Current Status (Jan 7, 2026)
- ✅ Phase 1 complete (Next.js, Prisma, shadcn/ui, CRUD, pages)
- ✅ Phase 2 complete (BullMQ, Redis, Claude API, AI worker)
- 📍 **Now:** Phase 3 - Core MVP (SSE, web search, results UI)
- 🎯 Goal: Working MVP with full research pipeline

**What Works Now:**
- Create, edit, delete ideas with auto-save
- Manual "Research" button
- Visual board view with card grid
- Ranking system (#1, #2, #3)
- Shelving with collapsible section
- Background AI analysis worker

**What's Next:**
- SSE for real-time progress streaming
- Web search worker (SerpAPI)
- Results display UI

---
Last Updated: 2026-01-07
