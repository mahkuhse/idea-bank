import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { prisma } from '@/lib/db';
import { analyzeIdea } from '@/lib/ai/claude';
import { ResearchJobData, ResearchJobType } from '@/lib/queue/research-queue';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Process AI analysis jobs
async function processAiAnalysis(job: Job<ResearchJobData>) {
  const { ideaId, ideaTitle, ideaContent, userId } = job.data;

  console.log(`Processing AI analysis for idea: ${ideaId}`);

  try {
    // Analyze idea with Claude
    const analysis = await analyzeIdea(ideaTitle, ideaContent);

    // Save AI insights to database
    await prisma.$transaction(async (tx) => {
      // Save novelty assessment
      await tx.aiInsight.create({
        data: {
          ideaId,
          type: 'NOVELTY_ASSESSMENT',
          content: JSON.stringify({
            score: analysis.noveltyScore,
            existingSolutions: analysis.existingSolutions,
          }),
          confidence: 0.8,
        },
      });

      // Save category
      await tx.aiInsight.create({
        data: {
          ideaId,
          type: 'CATEGORY',
          content: analysis.category,
          confidence: 0.9,
        },
      });

      // Save key concepts
      await tx.aiInsight.create({
        data: {
          ideaId,
          type: 'KEY_CONCEPTS',
          content: JSON.stringify(analysis.keyConcepts),
          confidence: 0.85,
        },
      });

      // Save challenges
      await tx.aiInsight.create({
        data: {
          ideaId,
          type: 'CHALLENGES',
          content: JSON.stringify(analysis.challenges),
          confidence: 0.75,
        },
      });

      // Save opportunities
      await tx.aiInsight.create({
        data: {
          ideaId,
          type: 'OPPORTUNITIES',
          content: JSON.stringify(analysis.opportunities),
          confidence: 0.75,
        },
      });

      // Save market landscape as research result
      await tx.researchResult.create({
        data: {
          ideaId,
          type: 'WEB_SEARCH',
          source: 'ai-analysis',
          title: 'Market Landscape Overview',
          description: analysis.marketLandscape,
          relevanceScore: 1.0,
          similarityScore: 0,
        },
      });

      // Update idea status
      await tx.idea.update({
        where: { id: ideaId },
        data: {
          status: 'ACTIVE',
        },
      });
    });

    console.log(`AI analysis completed for idea: ${ideaId}`);
    return { success: true, analysis };
  } catch (error) {
    console.error(`Error in AI analysis worker:`, error);
    throw error;
  }
}

// Create and export the worker
export const aiAnalysisWorker = new Worker(
  'research',
  async (job: Job<ResearchJobData>) => {
    if (job.data.jobType === ResearchJobType.AI_ANALYSIS) {
      return processAiAnalysis(job);
    }
  },
  {
    connection,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

// Worker event handlers
aiAnalysisWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

aiAnalysisWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

aiAnalysisWorker.on('error', (err) => {
  console.error('Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing worker...');
  await aiAnalysisWorker.close();
  await connection.quit();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing worker...');
  await aiAnalysisWorker.close();
  await connection.quit();
  process.exit(0);
});
