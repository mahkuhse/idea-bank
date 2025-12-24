# Idea Bank - Implementation Plan

## Overview
Build a web-based idea bank that replaces traditional notes apps with intelligent, passive background research. The system automatically researches ideas as you write, surfacing competitive analysis, market insights, and validation data without interrupting your creative flow.

**Core Philosophy: Neutral, Complete Research**
- Primary goal: Give you the full picture - good, bad, and in-between
- Counteract LLM tendency toward optimism and encouragement
- Show what already exists with the same weight as opportunities
- No sugar-coating, no discouragement - just comprehensive facts
- Value = making informed decisions based on reality, not hype

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Editor**: Tiptap (rich text, notes-app feel)
- **Backend**: Next.js API Routes → tRPC (for type safety)
- **Database**: PostgreSQL + Prisma ORM
- **Background Jobs**: BullMQ + Redis (for async research processing)
- **AI**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Research APIs**: SerpAPI (web search), Product Hunt API, Crunchbase API, GitHub API
- **Hosting**: Vercel (frontend/API) + Railway/Render (background workers)

## Core Architecture

```
User Browser (Next.js + React)
    ↓↑
Next.js API Routes / tRPC
    ↓↑
Background Workers (BullMQ) ←→ PostgreSQL
    ↓↑
External APIs (Claude, SerpAPI, Product Hunt, etc.)
```

## Key Features

### 1. Freeform Idea Capture
- Rich text editor (Tiptap) with auto-save every 2-3 seconds
- Title + content fields (not rigid - feels like a notes app)
- Optional tags for loose organization
- Fast, distraction-free writing experience

### 2. Passive Background Research (The Core Innovation)
**Trigger Logic**: Research automatically starts when:
- First save of new idea
- Significant content changes (>50 words added)
- Title changes
- Manual trigger button
- 7+ days since last research

**What Gets Researched** (Comprehensive & Balanced):

1. **Existing Solutions Discovery** (Multi-source)
   - **Exact matches**: Products/services doing the exact same thing
   - **Feature-level matches**: Solutions with significant feature overlap
   - **Near-duplicates**: Similar execution with slight variations
   - **Adjacent solutions**: Solves same problem differently
   - **Dead projects**: Failed attempts at the same idea (learn why they failed)

2. **AI Analysis** (Claude API) - Neutral Assessment
   - **Novelty score (0-10)**: Calibrated to realistic distribution (no optimism bias)
   - **Similar existing solutions**: Specific products/services found
   - **Feature comparison**: What overlaps, what's different
   - **Market landscape**: Who else is in this space
   - **Execution challenges**: What makes this difficult (based on similar attempts)
   - **Potential differentiation**: How this could be different (if applicable)
   - **Market gaps**: Where opportunities might exist (if any)
   - Category identification
   - Key concept extraction

3. **Comprehensive Web Search** (SerpAPI) - Multiple Query Angles
   - Direct searches: "[idea name] app/product/service"
   - Problem-based: "tools to solve [problem]"
   - Feature-based: "app with [key feature 1] and [key feature 2]"
   - Alternative phrasing: Different ways people might search for this
   - Existing solutions/competitors (prioritized)
   - Market size/trends
   - Recent news and launches
   - Forum discussions (Reddit, HN) about similar ideas

4. **Product Hunt Deep Search**
   - Similar launched products (PRIORITIZED)
   - Products with overlapping features
   - Validation metrics (upvotes, comments, traction)
   - Maker insights and post-mortems
   - "Shut down" or failed similar products

5. **Crunchbase Integration** - Follow the Money
   - Related startups (PRIORITIZED)
   - Funding data (who's already funded for this?)
   - Competitor funding rounds
   - Dead/acquired companies in space
   - Market saturation indicators

6. **GitHub Search** (for tech ideas)
   - Existing open source implementations (PRIORITIZED)
   - Trending repositories doing similar things
   - Abandoned projects (learn from failures)
   - Stars/forks as validation metric

7. **Additional Sources** (Phase 2+)
   - **Reddit/HN Search**: Has this been discussed? What did people say?
   - **Patent Search** (USPTO): Has this been patented?
   - **Academic Papers** (Semantic Scholar): Has this been researched?
   - **App Stores**: iOS/Android apps doing this
   - **Chrome Web Store**: Browser extensions
   - **Indie Hackers**: Similar projects and their revenue

**How Results Surface** (Organized by Relevance):
- Real-time streaming via Server-Sent Events (SSE)
- Progressive reveal: "Researching..." → "Analysis complete" → Show results
- **Result Organization** (logical grouping):
  1. **AI Overview** (always first): Neutral assessment with novelty score, market landscape, key findings, moat analysis
  2. **Competitive Landscape Map** (visual): Interactive positioning chart showing where competitors sit
     - Plot by price, complexity, target market, or custom dimensions
     - Your idea shown as reference point
     - Click competitors for details
     - Identifies white space visually
  3. **Existing Solutions** (if found): Products/services doing the same or similar things
     - Organized by similarity (exact matches → adjacent solutions)
     - Feature comparison showing overlap and differences
     - Traction indicators (users, funding, status: active/failed/acquired)
     - Pricing information side-by-side
  4. **Community Insights** (user discussions): Real problems from target users
     - Reddit/HN/forum posts about this pain point
     - Complaint frequency: "50 posts in last month"
     - Direct quotes showing user pain
     - Links to discussions
  5. **Pricing Intelligence**: How competitors monetize
     - Pricing model comparison (SaaS, one-time, freemium)
     - Price ranges by tier
     - Historical pricing changes
     - Feature gating at each tier
  6. **Moat & Defensibility Analysis**: Strategic considerations
     - Network effects assessment
     - Switching cost evaluation
     - Competitive advantage sustainability
     - Comparison: which competitors have strong moats
  7. **People of Interest**: Domain experts you could learn from
     - Founders/executives of similar companies
     - Investors funding this space
     - Thought leaders and practitioners
     - Context on why they're relevant
     - Links to profiles and content
  8. **Market Context**: Related startups, funding landscape, trends
  9. **Learning Opportunities**: Failed attempts with post-mortem analysis
  10. **Additional Research**: News, technical implementations
- **Neutral AI Assessment** prominently displayed:
  - "Novelty: 3/10 - Several existing solutions with similar features"
  - "Market Saturation: Medium - 8 active competitors, 2 shut down"
  - "Key Differences: [specific differentiators if any]"
  - "Moat Potential: Weak network effects, moderate switching costs"
  - "Considerations: [balanced list of challenges and opportunities]"
- **Visual clarity without bias**:
  - Similarity indicators (e.g., "85% feature overlap") for factual comparison
  - Interactive charts and visualizations
  - No color-coded "warnings" - just organized information
  - Links to all sources for user verification
- Expandable cards in sidebar/panel
- Notifications: "Research complete for [idea]"

### 3. Research Result Management
- Save/dismiss individual research items
- Historical view (research from different dates)
- Re-trigger research for updates
- Persistent storage in database

### 4. Idea Organization
- List all ideas with search
- Filter by tags, date, research status
- Sort by recent, oldest, most researched
- Full-text search across titles and content

### 5. Enhanced Features (High Value)

#### Competitive Landscape Map (Visual Positioning)
- Interactive visual map showing where competitors are positioned
- Plot by dimensions: price, target market, features, complexity
- Identifies white space and differentiation opportunities
- Shows market saturation visually
- Updates automatically as new competitors discovered

#### Target Market Research (Community Discovery)
- Automatically finds where target users discuss this problem
- Searches Reddit, HN, Twitter, forums, Discord servers
- Extracts actual user pain points in their own words
- Shows complaint frequency: "50 Reddit posts in last month about [specific pain]"
- Links directly to relevant discussions
- Identifies influential community members/thought leaders

#### Network Effects & Moat Analysis
- Analyzes if idea has defensibility: network effects, switching costs, data moats
- Evaluates incumbent lock-in strength
- Identifies moat opportunities: "Existing solutions have weak lock-in - opportunity for better UX"
- Compares moat strength across competitors
- Highlights which competitive advantages are sustainable

#### Pricing Intelligence
- Aggregates how existing solutions are priced
- Shows pricing models: SaaS ($X/mo), one-time ($Y), freemium, usage-based
- Tracks pricing changes over time
- Identifies pricing experiments: "Competitor X raised prices 40% last year"
- Calculates pricing ranges by tier
- Shows what features are gated at each price point

#### People of Interest (Domain Experts)
- Identifies key people with relevant domain expertise
- Finds founders/executives of similar companies (e.g., "Sam Levy, COO of Rodeo, former COO of Hinge")
- Locates investors who fund this space
- Discovers influential thought leaders, researchers, and practitioners
- Extracts from: LinkedIn, Crunchbase, Twitter/X, company websites, podcast appearances
- Provides context: "Why they're relevant to your idea"
- Links to profiles, contact info (if public), and their content (blog posts, podcasts, interviews)
- Suggests: "People you could learn from or potentially reach out to"

## Data Model (Prisma Schema)

### Core Models
1. **User**: Authentication, profile, API keys
2. **Idea**: Title, content (rich text JSON + plain text), status, timestamps, **marketSaturation** enum
3. **Tag**: Name, color, many-to-many with Ideas
4. **ResearchResult**: Type, source, title, description, URL, **similarityScore** (0-100), relevance score, metadata, **pricing** JSON, **positioning** JSON
5. **AiInsight**: Type (novelty, marketLandscape, existingSolutions, challenges, opportunities, moatAnalysis, etc.), content, confidence
6. **ResearchJob**: Job tracking, status, error handling
7. **Competitor**: NEW - Extracted from research results for landscape mapping
8. **CommunityDiscussion**: NEW - Reddit/HN/forum posts about the problem space
9. **PricingSnapshot**: NEW - Tracks competitor pricing over time
10. **PersonOfInterest**: NEW - Domain experts, founders, investors, thought leaders

### New Fields
- **similarityScore**: 0-100 percentage representing feature/concept overlap
- **marketSaturation**: SATURATED, COMPETITIVE, MODERATE, EMERGING, UNCLEAR
- **projectStatus**: ACTIVE, FAILED, ACQUIRED, DORMANT (for tracking competitor state)
- **pricing**: JSON storing pricing model, tiers, and amounts
- **positioning**: JSON storing market position coordinates (price, complexity, target market)
- **moatStrength**: STRONG, MODERATE, WEAK, NONE (defensibility assessment)
- **networkEffect**: BOOLEAN indicating if product has network effects

### Key Relationships
- User → Ideas (one-to-many)
- Idea → ResearchResults (one-to-many)
- Idea → AiInsights (one-to-many)
- Idea ↔ Tags (many-to-many)

## Implementation Phases

**Note on Enhanced Features**: The 4 high-value features (Competitive Landscape Map, Community Discovery, Moat Analysis, Pricing Intelligence) are integrated into Phase 3. They share infrastructure with core research features and add significant strategic value without much additional complexity.

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up project infrastructure and basic idea management

1. **Project Setup**
   - Initialize Next.js 14 with TypeScript, ESLint, Tailwind
   - Configure Prisma with PostgreSQL
   - Set up shadcn/ui components
   - Configure NextAuth.js for authentication (email/password + Google OAuth)

2. **Database Schema**
   - Define Prisma schema with all models
   - Create initial migrations
   - Seed database with test data

3. **Basic Idea CRUD**
   - Create API routes: `POST /api/ideas`, `GET /api/ideas`, `GET /api/ideas/[id]`, `PATCH /api/ideas/[id]`, `DELETE /api/ideas/[id]`
   - Implement auto-save with debouncing
   - Build idea list page with search/filter
   - Build idea detail/edit page
   - Start with simple textarea (upgrade to Tiptap in Phase 4)

**Critical Files**:
- `prisma/schema.prisma` - Database schema
- `src/app/api/ideas/route.ts` - Create/list ideas
- `src/app/api/ideas/[id]/route.ts` - Get/update/delete idea
- `src/app/ideas/page.tsx` - Ideas list page
- `src/app/ideas/[id]/page.tsx` - Idea editor page
- `src/lib/db.ts` - Prisma client singleton

### Phase 2: Research Infrastructure (Week 3-4)
**Goal**: Set up background job processing and AI integration

1. **Background Jobs Setup**
   - Install and configure BullMQ + Redis (Upstash)
   - Create worker service architecture
   - Implement job queue management
   - Add job status tracking and error handling

2. **Claude API Integration** - Configured for Neutral, Complete Analysis
   - Set up Anthropic SDK
   - Create `analyzeIdea()` function with **balanced assessment prompts**:
     - "Provide a neutral assessment - no encouragement, no discouragement"
     - "Grade novelty realistically based on existing solutions"
     - "Find existing solutions comprehensively"
     - "Identify both challenges and opportunities based on evidence"
     - "Be factual and complete - cover the full landscape"
   - Create `generateSearchQueries()` function with **comprehensive discovery focus**:
     - Generate multiple query variations to find all relevant existing solutions
     - Include problem-based, feature-based, and alternative phrasings
     - Cover both direct competitors and adjacent solutions
   - Create `calculateSimilarity()` function:
     - Analyze research results to calculate similarity scores (0-100)
     - Compare feature sets objectively
     - Return quantified metrics, not subjective judgments
   - Implement prompt templates emphasizing completeness and neutrality
   - Add response parsing and error handling
   - Implement caching for cost control

3. **Research Trigger Logic**
   - Implement change detection algorithm
   - Create research orchestrator
   - Build queue management system

**Critical Files**:
- `src/lib/queue/research-queue.ts` - BullMQ queue setup
- `src/workers/ai-analysis-worker.ts` - AI analysis background worker (neutral assessment)
- `src/lib/ai/claude.ts` - Claude API integration with balanced prompts
- `src/lib/ai/similarity-calculator.ts` - NEW: Similarity scoring logic (0-100)
- `src/lib/research/trigger.ts` - Research trigger logic
- `src/app/api/ideas/[id]/research/route.ts` - Manual research trigger endpoint

### Phase 3: Research Features (Week 5-6)
**Goal**: Implement all research workers and result display

1. **Research Workers** - Comprehensive Discovery
   - Build **AI analysis worker** (uses Claude API):
     - Realistic novelty grading (counteract optimism bias)
     - Market landscape assessment
     - Existing solution identification
     - Challenge and opportunity analysis
     - Feature comparison
   - Build **web search worker** (SerpAPI integration):
     - Multiple query variations per idea
     - Find existing products comprehensively
     - Search for "[idea] alternative", "best [problem] tool", "[feature] app"
     - Capture snippets showing features and positioning
   - Build **Product Hunt worker**:
     - Search for similar products
     - Include active, failed, and shut down products
     - Extract feature lists and traction data
   - Build **Crunchbase worker**:
     - Find related startups
     - Track funding, status (active/failed/acquired)
     - Assess market saturation level
   - Build **GitHub worker**:
     - Find existing implementations
     - Track project status (active/abandoned)
     - Extract feature information from READMEs
   - Implement parallel job execution
   - Add retry logic and rate limiting
   - **Build result aggregation logic**:
     - Cross-reference results from all sources
     - Calculate similarity scores (0-100) based on features
     - Organize by relevance and similarity

2. **Results API & Real-time Updates**
   - Create research results API endpoints
   - Implement Server-Sent Events (SSE) for real-time updates
   - Build relevance scoring algorithm
   - Add result persistence to database

3. **Results UI Components** - Clean, Neutral Presentation
   - Build research panel/sidebar component with **logical organization**:
     - AI Overview section (always first)
     - Existing Solutions (organized by similarity score: 90%+ → 50%+)
     - Market Context (funding, trends)
     - Learning from Failures (shut down projects)
     - Additional Research (news, forums)
   - Create **informative result cards**:
     - Clean design with similarity scores (e.g., "85% feature overlap")
     - Feature comparison tables (your idea vs existing solution)
     - Direct links to products/companies
     - Traction metrics (users, funding, status)
     - No emotional language - just facts
   - Create **AI assessment card** (always visible at top):
     - Novelty score with explanation
     - Market saturation assessment
     - Feature comparison summary
     - Balanced considerations (both challenges and opportunities)
     - No prescriptive recommendations - just information
   - Add loading states showing current search progress
   - Implement save/dismiss actions
   - Add research status indicators
   - **Failed project analysis**: Show why similar attempts shut down

4. **Enhanced Research Features** (High-Value Additions)
   - Build **community discovery worker**:
     - Search Reddit API for problem discussions
     - Search HN (Algolia API) for relevant posts
     - Track complaint frequency and patterns
     - Extract pain points from user comments
   - Build **pricing intelligence worker**:
     - Extract pricing from competitor websites
     - Track pricing models and tiers
     - Store pricing snapshots over time
   - Build **moat analysis worker** (AI-powered):
     - Analyze network effects potential
     - Evaluate switching costs
     - Assess data moat opportunities
     - Compare defensibility across competitors
   - Build **people discovery worker**:
     - Extract founders/executives from Crunchbase data
     - Find investors from funding rounds
     - Search LinkedIn for domain experts (if API available)
     - Identify thought leaders from podcast appearances, articles
     - Use AI to assess relevance and provide context
   - Build **landscape mapping logic**:
     - Extract positioning dimensions from research
     - Calculate market position coordinates
     - Identify white space opportunities

**Critical Files**:
- `src/workers/web-search-worker.ts` - Web search with multiple query variations
- `src/workers/product-hunt-worker.ts` - Product Hunt integration (all statuses)
- `src/workers/crunchbase-worker.ts` - Crunchbase integration (active and defunct)
- `src/workers/github-worker.ts` - NEW: GitHub search for existing implementations
- `src/workers/community-discovery-worker.ts` - NEW: Reddit/HN discussion finder
- `src/workers/pricing-intelligence-worker.ts` - NEW: Competitor pricing extraction
- `src/workers/moat-analysis-worker.ts` - NEW: AI-powered defensibility analysis
- `src/workers/people-discovery-worker.ts` - NEW: Domain expert identification
- `src/lib/research/result-aggregation.ts` - NEW: Cross-source result aggregation
- `src/lib/research/feature-comparison.ts` - NEW: Feature similarity calculation
- `src/lib/research/landscape-mapping.ts` - NEW: Competitive positioning logic
- `src/lib/research/relevance-scoring.ts` - Relevance algorithm (organize by similarity)
- `src/app/api/ideas/[id]/research/stream/route.ts` - SSE endpoint
- `src/components/research-panel.tsx` - Organized research UI
- `src/components/research-card.tsx` - Neutral result cards
- `src/components/ai-assessment-card.tsx` - NEW: Always-visible AI overview
- `src/components/similarity-indicator.tsx` - NEW: Visual similarity scores
- `src/components/landscape-map.tsx` - NEW: Interactive competitive landscape visualization
- `src/components/community-insights.tsx` - NEW: User discussion aggregation
- `src/components/pricing-table.tsx` - NEW: Competitor pricing comparison
- `src/components/moat-analysis.tsx` - NEW: Defensibility assessment display
- `src/components/people-of-interest.tsx` - NEW: Domain experts and key contacts

### Phase 4: Polish & Launch (Week 7-8)
**Goal**: Enhance UX and deploy to production

1. **UX Improvements**
   - Upgrade textarea to Tiptap rich text editor
   - Add smooth loading states and transitions
   - Implement optimistic UI updates
   - Add keyboard shortcuts
   - Improve mobile responsiveness

2. **Error Handling & Resilience**
   - Add comprehensive error boundaries
   - Implement graceful degradation (if AI fails, show web results)
   - Add user-friendly error messages
   - Implement retry mechanisms

3. **Testing & Optimization**
   - Write integration tests for critical paths
   - Test background job processing
   - Performance optimization (lazy loading, code splitting)
   - Database query optimization

4. **Deployment**
   - Deploy Next.js app to Vercel
   - Deploy background workers to Railway/Render
   - Set up PostgreSQL (Vercel Postgres or Supabase)
   - Set up Redis (Upstash)
   - Configure environment variables
   - Set up monitoring and logging

**Critical Files**:
- `src/components/idea-editor.tsx` - Upgraded Tiptap editor
- `src/lib/utils/error-handler.ts` - Centralized error handling
- `vercel.json` - Vercel deployment config
- `Dockerfile` - Worker service container
- `.env.example` - Environment variables template

## Design Philosophy: Comprehensive, Neutral Research

This tool provides complete information to help you make informed decisions, counteracting the natural optimism bias in both humans and LLMs.

### Guiding Principles

1. **Complete Picture**: Show the full landscape - existing solutions, market context, challenges, and opportunities
2. **Realistic Assessment**: Novelty scores based on actual existing solutions, not inflated by default
3. **No Emotional Language**: No "Great idea!" or "This won't work!" - just comprehensive facts
4. **Transparent Similarity**: Quantified feature overlap (e.g., "85% similarity") not vague statements
5. **Show Everything**: If 8 competitors exist, show all 8 with their features and status
6. **Learn from History**: Include failed attempts with post-mortem analysis
7. **Feature-Level Comparison**: Explicit side-by-side comparison of features
8. **Information, Not Recommendations**: Provide data for you to make decisions

### UX Implications

- **Organized by similarity** for easy scanning (90%+ overlap → 50%+ overlap)
- **Existing solutions prominently displayed** (not hidden or minimized)
- **Quantified metrics**: "85% feature overlap" not "very similar"
- **No bias indicators** - just organized, factual presentation
- **Direct links** to all sources for verification
- **Failed projects as learning** - understand why similar attempts didn't work

### AI Prompt Engineering for Neutrality

Example prompt structure:
```
You are a comprehensive research analyst. Provide a complete, neutral assessment
of this idea. Do NOT encourage or discourage the user - just provide facts.
Grade novelty realistically based on existing solutions found. Be thorough in
finding existing solutions.

Idea: [user's idea]

Task:
1. Novelty score (0-10, based on existing solutions - calibrate realistically)
2. List ALL existing solutions that do similar things
3. Feature comparison: what overlaps, what's different
4. Market landscape: who else is in this space, their traction
5. Historical context: similar projects that failed and why
6. Challenges: what makes this difficult (based on evidence)
7. Opportunities: where gaps might exist (if any, based on evidence)

Be complete, neutral, and factual. Help the user see the full picture.
```

## Key Technical Decisions

### Research Trigger Strategy
- **Debounced auto-save** (2-3 seconds) prevents excessive saves
- **Change detection** analyzes word count delta and title changes
- **Threshold**: 50+ words added or title change triggers research
- **Cooldown**: Don't re-research same content within 24 hours

### Real-time Updates
- **SSE (Server-Sent Events)** for one-way streaming from server to client
- More reliable than WebSocket for this use case
- Works well with Vercel's serverless architecture
- Fall back to polling if SSE not supported

### Cost Control
- **Cache AI responses** in Redis (24 hour TTL)
- **Rate limiting**: Max 10 research requests per user per day (free tier)
- **Smart triggers**: Only research on significant changes
- **Token limits**: Cap Claude API max_tokens to control costs
- **Batch processing**: Queue multiple requests, process in parallel

### Data Storage
- **Rich text**: Store as Tiptap JSON in `content` field
- **Plain text**: Maintain `contentText` field for search/AI analysis
- **Research results**: Store with metadata JSON for flexibility
- **Full-text search**: Use PostgreSQL `@@` operator with indexes

## Environment Variables Needed

```env
# Database
DATABASE_URL="postgresql://..."

# Redis (Upstash)
REDIS_URL="redis://..."

# Authentication (NextAuth.js)
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# AI & Research APIs
ANTHROPIC_API_KEY="sk-ant-..."
SERPAPI_API_KEY="..."
PRODUCT_HUNT_API_KEY="..."
CRUNCHBASE_API_KEY="..."
GITHUB_TOKEN="..."
```

## Success Metrics

### Primary Success Metric: Informed Decision-Making
- **Research completeness**: % of ideas with comprehensive research results
- **False negatives**: User discovers existing solutions we missed (BAD - minimize this)
- **Research accuracy**: Relevance of discovered existing solutions
- **Time to research completion**: <30 seconds from idea save

### Secondary Metrics
- Similar solution discovery rate: >80% when relevant solutions exist
- False positive rate: <10% (irrelevant results)
- User confidence: "This tool gives me complete information" survey score
- Retention: Users return within 7 days
- Zero data loss: 100% auto-save reliability
- User satisfaction with neutrality: "Results feel unbiased" score

### Anti-Metrics (What We DON'T Want)
- ❌ Inflated novelty scores (LLM optimism bias not corrected)
- ❌ Missing obvious existing solutions (incomplete research)
- ❌ Emotional or prescriptive language in results (not neutral)

## Future Enhancements (Post-MVP)

### Phase 2 Research Sources (Deeper Duplicate Detection)
- **Patent database searches** (USPTO API): Find patented similar ideas
- **Academic paper searches** (Semantic Scholar): Research that proves/disproves concept
- **App Store scraping**: iOS/Android apps doing the same thing
- **Chrome Web Store**: Browser extensions with similar features
- **Reddit/HN/Indie Hackers API**: Community discussions about similar ideas
- **LinkedIn scraping**: People building this professionally
- **Wayback Machine**: Dead products that tried this before

### Advanced Features (Post-MVP)
- **ML-based similarity scoring**: Train custom model on feature comparisons for better accuracy
- **Competitor monitoring alerts**: Auto-alert when new competitors launch (daily/weekly scans)
- **Market timing analysis**: AI analyzes why failed attempts didn't work then vs now
  - "This was tried in 2015 and failed, but market has changed because: [LLM adoption, remote work, etc.]"
- **Idea quality scorecard**: Multi-factor score combining novelty, market size, feasibility, timing
- **Quick validation experiments**: AI suggests cheap ways to validate before building
- **Regulatory/legal flagging**: Identify if idea hits regulated spaces (fintech, healthcare)

### Productivity Features
- Collaborative ideas (sharing, comments)
- Idea relationship mapping
- Weekly digest: "You had 3 ideas this week, 2 are duplicates, 1 might be worth pursuing"
- Browser extension for quick capture
- Mobile app (React Native)
- Export to Notion/Google Docs

## Risk Mitigation

**API Cost Overruns**:
- Implement strict rate limiting
- Cache aggressively
- Set usage alerts
- Offer user-provided API keys option

**Research Quality & Accuracy**:
- A/B test different prompts (optimize for duplicate detection)
- **Collect user feedback**: "Did we miss any existing solutions?"
- Track false negatives: User reports duplicates we missed
- Implement relevance scoring (prioritize exact matches)
- Allow manual refinement
- **Calibration dashboard**: Show duplicate detection accuracy over time
- **User reporting**: "I found a duplicate you missed" feature to improve system

**Performance**:
- Use background workers for heavy lifting
- Implement caching at all layers
- Optimize database queries
- Use CDN for static assets

**Scalability**:
- Horizontal scaling of workers
- Database read replicas if needed
- Redis cluster for job queue
- Edge caching with Vercel

---

## Next Steps After Approval

1. Initialize Next.js project with TypeScript
2. Set up Prisma and create initial schema
3. Configure authentication with NextAuth.js
4. Build basic idea CRUD functionality
5. Set up BullMQ and Redis
6. Integrate Claude API
7. Implement research workers
8. Build research results UI
9. Deploy to production

Estimated timeline: **8 weeks to MVP**
