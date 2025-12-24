# Idea Bank

An intelligent idea bank that replaces traditional notes apps with passive background research. Automatically researches your ideas as you write, surfacing competitive analysis, market insights, and validation data.

## Core Philosophy

**Neutral, Complete Research** - No sugar-coating, no false encouragement. Just comprehensive facts to help you make informed decisions.

## Features

- 🎯 **Freeform Idea Capture** - Notes-app feel with rich text editing
- 🔬 **Passive Background Research** - Automatic research triggers on significant changes
- 🗺️ **Competitive Landscape Map** - Visual positioning of competitors
- 💬 **Community Discovery** - Find real user discussions and pain points
- 🏰 **Moat Analysis** - Defensibility assessment for your ideas
- 💰 **Pricing Intelligence** - Competitor pricing models and trends
- 👥 **People of Interest** - Domain experts, founders, and investors
- 📊 **Neutral AI Assessment** - Realistic novelty scores without optimism bias

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Background Jobs**: BullMQ + Redis
- **AI**: Anthropic Claude API
- **Research APIs**: SerpAPI, Product Hunt, Crunchbase, GitHub

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (for background jobs)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/idea-bank.git
cd idea-bank
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database URL and API keys
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Development

### Database

```bash
# Generate Prisma client
npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio
npx prisma studio
```

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── ideas/             # Ideas pages
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utility libraries
│   ├── ai/               # AI integration
│   ├── queue/            # Background job queue
│   └── research/         # Research logic
├── prisma/               # Database schema
└── workers/              # Background workers
```

## Implementation Plan

See [IMPLEMENTATION.md](./IMPLEMENTATION.md) for the complete implementation plan with detailed phases, features, and technical decisions.

## License

MIT

## Contributing

Contributions are welcome! Please read the implementation plan first to understand the architecture and design philosophy.
