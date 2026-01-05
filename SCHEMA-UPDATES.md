# Database Schema Updates

## Date: 2026-01-05

This document summarizes the database schema changes made to support the new workflow.

---

## New Features Supported

1. **Visual Organization & Ranking**
   - Custom user ranking (Top 1, 2, 3, etc.)
   - Shelved/archived ideas

2. **Multi-format Attachments**
   - Images, PDFs, videos, links
   - User uploads + research findings

3. **Real-time Progress Streaming**
   - Track worker progress
   - Display live updates

4. **Interactive Chat with Research**
   - Q&A about research results
   - Citations to research findings

---

## Schema Changes

### Modified: `Idea` Model

**Added Fields:**
```prisma
rank            Int?    // User-defined ranking (1, 2, 3, etc.)
isShelved       Boolean @default(false) // Archived/shelved ideas
```

**Added Relationships:**
```prisma
attachments      Attachment[]
researchProgress ResearchProgress[]
chatMessages     ChatMessage[]
```

**Added Index:**
```prisma
@@index([userId, rank])
```

---

### New Model: `Attachment`

Stores multi-format files attached to ideas.

```prisma
model Attachment {
  id     String @id @default(cuid())
  ideaId String
  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)

  fileName     String
  fileType     String  // MIME type
  fileSize     Int     // bytes
  storageUrl   String  // S3/cloud storage URL
  thumbnailUrl String? // For images/videos

  uploadedBy String // userId
  source     AttachmentSource @default(USER_UPLOAD)

  metadata  Json?    // Flexible storage for file-specific data
  createdAt DateTime @default(now())

  @@index([ideaId, createdAt])
}

enum AttachmentSource {
  USER_UPLOAD
  RESEARCH_FINDING // From research workers
  CHAT_UPLOAD
}
```

**Use Cases:**
- User uploads: Screenshots, PDFs, images
- Research findings: Downloaded articles, competitor screenshots
- Chat attachments: Files shared during Q&A

---

### New Model: `ResearchProgress`

Tracks real-time progress of research workers for SSE streaming.

```prisma
model ResearchProgress {
  id     String @id @default(cuid())
  ideaId String
  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)

  workerType String // "ai-analysis", "web-search", "product-hunt", etc.
  status     ProgressStatus @default(PENDING)
  message    String? @db.Text // Current progress message

  resultsCount Int       @default(0) // Number of results found so far
  startedAt    DateTime  @default(now())
  completedAt  DateTime?
  error        String?   @db.Text

  @@index([ideaId, workerType])
}

enum ProgressStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

**Use Cases:**
- Display "Crawling Reddit for meal planning discussions..." messages
- Show progress bars (e.g., "Found 12 results so far")
- Track which workers are done vs. still running
- SSE endpoint streams updates from this table

**Example Flow:**
1. User clicks "Research" button
2. API creates `ResearchProgress` records: `{workerType: "ai-analysis", status: "PENDING"}`
3. Workers update progress: `{status: "RUNNING", message: "Analyzing novelty...", resultsCount: 3}`
4. SSE endpoint streams these updates to frontend
5. When done: `{status: "COMPLETED", completedAt: now()}`

---

### New Model: `ChatMessage`

Stores conversation history for interactive research Q&A.

```prisma
model ChatMessage {
  id     String @id @default(cuid())
  ideaId String
  idea   Idea   @relation(fields: [ideaId], references: [id], onDelete: Cascade)

  role    ChatRole
  content String   @db.Text

  // Citations to research results
  citedResults Json? // Array of ResearchResult IDs

  createdAt DateTime @default(now())

  @@index([ideaId, createdAt])
}

enum ChatRole {
  USER
  ASSISTANT
  SYSTEM
}
```

**Use Cases:**
- User asks: "What's the most common pricing model?"
- AI responds with answer + citations to `ResearchResult` records
- Chat history persists per idea
- Citations link back to specific research findings

**Example Data:**
```json
{
  "role": "USER",
  "content": "What's the most common pricing model?",
  "citedResults": null
}

{
  "role": "ASSISTANT",
  "content": "Based on 23 competitors analyzed, 65% use freemium...",
  "citedResults": ["res_abc123", "res_def456"] // Links to ResearchResult IDs
}
```

---

## Migration Instructions

Once you have a database set up:

```bash
# 1. Generate Prisma Client (already done)
npm run db:generate

# 2. Push schema to database
npm run db:push

# OR create a migration (for production)
npm run db:migrate
```

---

## Next Steps

With the schema updated, we can now build:

1. ✅ Database schema - **COMPLETE**
2. Manual "Research" button API endpoint
3. SSE endpoint for progress streaming
4. Visual board view UI
5. Results display with multi-format support
6. Chat interface for research Q&A
7. File upload/attachment system

---

## Notes

- **Prisma Client**: Already generated, ready to use
- **Backwards Compatible**: Existing data won't be affected (only adding fields)
- **Storage**: Attachments use cloud storage URLs (S3/similar), not database BLOBs
- **Indexes**: Added for common query patterns (ranking, progress tracking)
- **JSON Fields**: Used for flexible data (citations, metadata)

---

Last Updated: 2026-01-05
