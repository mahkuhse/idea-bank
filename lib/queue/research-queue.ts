import { Queue, Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';

// Redis connection configuration
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Research queue for background jobs
export const researchQueue = new Queue('research', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

// Job types
export enum ResearchJobType {
  AI_ANALYSIS = 'ai-analysis',
  WEB_SEARCH = 'web-search',
  PRODUCT_HUNT = 'product-hunt',
  CRUNCHBASE = 'crunchbase',
  GITHUB = 'github',
  COMMUNITY_DISCOVERY = 'community-discovery',
  PRICING_INTELLIGENCE = 'pricing-intelligence',
  MOAT_ANALYSIS = 'moat-analysis',
  PEOPLE_DISCOVERY = 'people-discovery',
}

// Job data interfaces
export interface ResearchJobData {
  ideaId: string;
  ideaTitle: string;
  ideaContent: string;
  jobType: ResearchJobType;
  userId: string;
}

// Add a research job to the queue
export async function queueResearchJob(data: ResearchJobData) {
  return researchQueue.add(data.jobType, data, {
    jobId: `${data.ideaId}-${data.jobType}-${Date.now()}`,
  });
}

// Queue multiple research jobs in parallel
export async function queueAllResearch(
  ideaId: string,
  ideaTitle: string,
  ideaContent: string,
  userId: string
) {
  const jobs = [
    ResearchJobType.AI_ANALYSIS,
    // More job types will be added in Phase 3
    // ResearchJobType.WEB_SEARCH,
    // ResearchJobType.PRODUCT_HUNT,
    // etc.
  ];

  const promises = jobs.map((jobType) =>
    queueResearchJob({
      ideaId,
      ideaTitle,
      ideaContent,
      jobType,
      userId,
    })
  );

  return Promise.all(promises);
}

// Graceful shutdown
export async function closeQueue() {
  await researchQueue.close();
  await connection.quit();
}
