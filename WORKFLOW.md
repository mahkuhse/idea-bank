# Ideal User Workflow

## Overview
Idea Bank functions like a personal research lab - quick text capture, deep background research, and visual organization.

---

## Core User Journey

### 1. **Capture Phase** - Quick Text Entry
**Current behavior:** Google Doc with list of ideas
**Desired behavior:** Fast text capture similar to current workflow

- User has an idea → Opens Idea Bank
- Creates new idea with quick text entry
- Writes a blurb: description, questions, thoughts
- Can be as short as a sentence or as long as needed
- **No research triggers automatically** - just save the notes
- Each idea gets its own "space" (like a GitHub repo)

**UI/UX:**
- Fast, distraction-free text input
- Auto-save (like current implementation)
- Simple form: Title + Text area
- No friction, no forced fields

---

### 2. **Organization Phase** - Visual Space
**Metaphor:** Each idea = GitHub repo (self-contained workspace)

**Idea Space Contains:**
- Original notes (user's text)
- Attachments (multi-format):
  - Text files
  - Images
  - Videos
  - Links
  - PDFs
  - Research artifacts
- Research results (when available)
- Chat/conversation with research

**Visual Organization View:**
- Grid or board layout showing all ideas
- Each idea is a clickable card/tile
- Custom ranking system:
  - Top 3 ideas prominently displayed
  - User can drag/rank ideas by priority
  - Visual indicators: "Active," "Backburner," "Top Priority"
- Quick preview of idea status:
  - Has research been run?
  - Research in progress?
  - Number of research results

**Pain Point Solved:** Too many ideas → Visual prioritization + ranking system

---

### 3. **Research Phase** - Manual Trigger, Background Execution
**Key Change:** User explicitly clicks "Research" button

**Flow:**
1. User reviews their idea notes
2. Clicks **"Research"** button when ready
3. Research jobs queue up and start processing
4. **Background execution:**
   - Works even when app is not active focus
   - Continues when user tabs away (browser tab runs in background)
   - Could work even when browser closed (if using server-side workers)
5. User can:
   - Stay and watch progress in real-time
   - Leave and come back later
   - Get notification when complete

**Research Visibility (Claude Code-style):**
If user wants to watch:
```
🔍 Starting research for "AI-powered meal planner"...

✓ AI Analysis Worker
  → Analyzing novelty and market landscape...
  → Found 8 similar solutions
  → Novelty score: 4/10

🌐 Web Search Worker
  → Crawling Google for "AI meal planning apps"...
  → Found 23 relevant results
  → Analyzing pricing and features...

🔍 Product Hunt Worker
  → Searching Product Hunt database...
  → Found 5 related launches
  → Extracting user feedback...

📱 GitHub Worker
  → Searching repositories for "meal planning AI"...
  → Found 12 open-source projects
  → Analyzing code activity...

💬 Community Discovery Worker
  → Crawling Reddit r/SideProject, r/startups...
  → Crawling Hacker News "Show HN"...
  → Found 15 discussion threads

✓ Research complete! 67 results found.
```

**Technical Implementation:**
- BullMQ workers (already built)
- Server-Sent Events (SSE) for real-time updates
- Notification API when complete
- Each worker logs progress to database
- UI streams progress updates

---

### 4. **Results Phase** - Multi-Format Presentation

**How Results Are Displayed:**
Research results appear in their native format:

- **Links:** Clickable cards with preview (title, description, favicon)
- **Videos:** Embedded players or thumbnails
- **Images:** Gallery view
- **PDFs:** Viewer or download link
- **Forum Posts:** Quote blocks with context and link
- **Academic Papers:** Citation format with abstract
- **GitHub Repos:** Code preview, stars, activity
- **Pricing Data:** Comparison tables

**Organized by:**
- Source type (Web, Product Hunt, Reddit, etc.)
- Relevance score
- Similarity score (for competitors)
- Chronological (newest first)

---

### 5. **Interaction Phase** - Chat with Research

**Feature:** Ask questions about the research results

**Example Interaction:**
```
User: "What's the most common pricing model?"
AI: "Based on 23 competitors analyzed:
     - 65% use freemium (free tier + paid upgrades)
     - 22% use subscription-only ($9-29/month)
     - 13% use one-time purchase
     Sources: [Link to Pricing Intelligence results]"

User: "Show me the Reddit discussions about meal planning frustrations"
AI: [Displays filtered results from Community Discovery Worker]

User: "Which competitors have the highest user satisfaction?"
AI: [Analyzes Product Hunt reviews and Reddit sentiment]
```

**Technical Implementation:**
- Chat interface within each idea space
- Claude API with context: original idea + research results
- Citations link back to specific research results
- Can ask for clarification, deeper dives, or filtering

---

### 6. **Sharing Phase** (Future - Not Priority)

- Generate shareable link to research report
- Control what's included (original notes, research, chat)
- Public or password-protected
- Useful for pitching to co-founders, investors, collaborators

---

## Key Workflow Principles

### ✅ Do's
1. **Fast capture** - No friction when idea is fresh
2. **Manual research trigger** - User controls when research happens
3. **Transparency** - Show what research is doing (if watching)
4. **Background execution** - Don't block the user
5. **Native formats** - Present results as they naturally exist
6. **Interactive** - Chat with research, ask questions
7. **Visual organization** - Easy to see all ideas and prioritize
8. **Flexible storage** - Support any file type research surfaces

### ❌ Don'ts
1. **Don't auto-research** - User might not be ready
2. **Don't force structure** - Let capture be freeform
3. **Don't hide progress** - Show what's happening (optional)
4. **Don't limit file types** - Support everything
5. **Don't make organization rigid** - User controls priorities

---

## Comparison: Old vs New Design

| Aspect | Old Design (claude.md) | New Design (This Doc) |
|--------|------------------------|----------------------|
| Research Trigger | Automatic (>50 words, title change, 7+ days) | Manual "Research" button |
| Capture | Same (text-based) | Same (text-based) |
| Organization | List view | Visual board with ranking |
| File Support | Text only | Multi-format (images, PDFs, videos, links) |
| User Control | Passive (auto-trigger) | Active (user initiates) |
| Progress Visibility | None | Real-time streaming (optional) |
| Interaction | Static results | Chat interface with research |
| Background Work | Yes | Yes (enhanced) |

---

## Technical Architecture Changes Needed

### 1. **Database Schema Updates**
- Add `Attachment` model for multi-format files
- Add `IdeaRanking` or priority field to `Idea` model
- Add `ResearchProgress` model for streaming updates
- Add `ResearchConversation` model for chat history

### 2. **API Routes**
- `POST /api/ideas/[id]/research` - Manual research trigger
- `GET /api/ideas/[id]/research/progress` - SSE endpoint for live updates
- `POST /api/ideas/[id]/research/chat` - Ask questions about research
- `POST /api/ideas/[id]/attachments` - Upload files
- `PATCH /api/ideas/[id]/rank` - Update idea priority/ranking

### 3. **Background Workers** (Keep existing + enhance)
- AI Analysis Worker ✓ (already built)
- Web Search Worker (SerpAPI)
- Product Hunt Worker
- GitHub Worker
- Community Discovery Worker (Reddit/HN)
- Each worker logs progress to `ResearchProgress` table

### 4. **UI Components**
- Ideas board view (grid/kanban)
- Idea detail page (repo-like space)
- Research progress stream (Claude Code style)
- Multi-format attachment viewer
- Chat interface for research Q&A
- Ranking/priority controls

### 5. **Real-time Updates**
- Server-Sent Events (SSE) for progress streaming
- WebSocket alternative (if needed)
- Notification API for completion alerts

---

## Next Steps

1. **Review this workflow** - Does this match your vision?
2. **Prioritize features** - What's MVP vs. nice-to-have?
3. **Update database schema** - Add new models
4. **Build core flow** - Manual research trigger first
5. **Add visual organization** - Board view
6. **Implement file attachments** - Multi-format support
7. **Build progress streaming** - Real-time updates
8. **Add chat interface** - Interactive research

---

## Design Decisions

1. **File storage:** Database (for cross-platform access - phone + computer)
   - Attachments stored as database records
   - Files uploaded to cloud storage (S3/similar)
   - URLs/references stored in database
   - Accessible from any device via user account

2. **Research depth:** Thorough until results stop being relevant
   - No artificial time limits
   - Workers continue until relevance drops off
   - Prioritize quality over speed
   - Can tune per-worker if costs become issue

3. **Notifications:** Email only
   - Send email when research completes
   - Include summary of findings
   - Link back to idea space
   - No browser notifications

4. **Ranking system:** Fully customizable by user
   - User controls top N (typically 3-5)
   - Collapsible "Shelved" section for rest (like archiving)
   - Drag-and-drop ranking
   - User defines their own organization system

5. **Research re-run:** Yes, consistent and reproducible
   - User can trigger research again anytime
   - Always fetches fresh data (catch new competitors, updated info)
   - **Consistency principle:** Same input at same time → Consistent results
   - NOT strictly deterministic (data sources update over time)
   - BUT: No AI randomness - results driven by actual data, not LLM whims
   - Solves frustration: "Why did I get different results asking the same question?"
   - Implementation: Low/zero temperature on AI, structured search queries, fact-based analysis

6. **Cost control:** Backend controls initially
   - Hard limits in code to prevent runaway costs
   - Future: User-configurable token limits per research run
   - Track and display estimated costs
   - Warn before expensive operations

7. **Attachment limits:** None - capture everything
   - Any file type allowed
   - No size restrictions (within reason for cloud storage)
   - If can't embed/preview: link to external location
   - Research can surface and store anything it finds

---

Last Updated: 2026-01-05
