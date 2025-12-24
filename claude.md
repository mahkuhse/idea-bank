# Claude Context: Idea Bank

## Quick Overview
An intelligent idea bank that automatically researches business ideas as you write. **Core philosophy: Neutral, complete research** - no false encouragement, just comprehensive facts.

## Key Design Principles
1. **Neutrality First**: Counteract LLM optimism bias. No "Great idea!" - just facts.
2. **Passive Research**: Triggers automatically on significant changes (>50 words, title change, 7+ days)
3. **Comprehensive Discovery**: Find what already exists across multiple sources
4. **Quantified Metrics**: "85% feature overlap" not "very similar"
5. **No Prescriptive Recommendations**: Provide data, let users decide

## Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL + Prisma ORM (v7)
- **Background Jobs**: BullMQ + Redis
- **AI**: Anthropic Claude API (Sonnet 4.5)
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
**Current: Phase 1 - Foundation** ✅
- [x] Next.js + TypeScript setup
- [x] Prisma schema with 10 models
- [x] shadcn/ui configured
- [ ] NextAuth.js setup
- [ ] Basic idea CRUD
- [ ] Idea list & editor pages

**Next: Phase 2 - Research Infrastructure** (Week 3-4)
- BullMQ + Redis setup
- Claude API integration
- Research trigger logic

**Then: Phase 3 - Research Features** (Week 5-6)
- All research workers (AI, web, Product Hunt, Crunchbase, GitHub)
- Community discovery, pricing intelligence, moat analysis, people of interest
- Results UI with SSE streaming

## Code Conventions
1. **File Naming**: kebab-case for files, PascalCase for components
2. **Imports**: Use `@/` alias (e.g., `@/lib/db`, `@/components/...`)
3. **API Routes**: Next.js App Router conventions (`app/api/...`)
4. **Database**: Always use Prisma client from `@/lib/db`
5. **AI Prompts**: Emphasize neutrality, completeness, no encouragement

## Critical Files Reference
- `prisma/schema.prisma` - Database schema (10 models)
- `lib/db.ts` - Prisma singleton
- `IMPLEMENTATION.md` - Full implementation plan with phases
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

## Research Flow
1. User types idea → Auto-save (debounced 2-3s)
2. Change detection → If >50 words or title change
3. Queue background jobs → Parallel research workers
4. AI analysis + Web search + Product Hunt + Crunchbase + GitHub
5. Stream results via SSE → Update UI progressively
6. Organize by similarity → 90%+ overlap → 50%+ overlap

## Common Tasks
```bash
# Development
npm run dev              # Start dev server
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

## AI Prompt Guidelines
When implementing AI features, always:
- ✅ Use neutral language: "Several existing solutions with similar features"
- ✅ Provide quantified metrics: "85% feature overlap"
- ✅ List ALL findings: If 8 competitors exist, show all 8
- ✅ Include challenges AND opportunities
- ❌ No encouragement: "Great idea!", "This could work!"
- ❌ No discouragement: "This won't work", "Give up"
- ❌ No prescriptive advice: "You should...", "Don't..."

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
- This project uses Prisma 7 (new config format in `prisma.config.ts`)
- shadcn/ui with Tailwind CSS v4
- No fulltext indexes in PostgreSQL (use regular indexes)
- Background jobs will be BullMQ (separate worker process)
- NextAuth for authentication (models already in schema)

## Current Status
- ✅ Foundation complete (Next.js, Prisma, shadcn/ui)
- 📍 Next: Basic idea CRUD + pages
- 🎯 Goal: MVP in 8 weeks

For full details, see [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---
Last Updated: 2025-12-25
