import { prisma } from '@/lib/db';
import { queueAllResearch } from '@/lib/queue/research-queue';

// Trigger research for an idea (called when user clicks "Research" button)
export async function triggerResearch(
  ideaId: string,
  title: string,
  content: string,
  userId: string
): Promise<void> {
  try {
    // Create progress records for each worker type
    const workerTypes = ['ai-analysis', 'web-search'];

    await prisma.researchProgress.createMany({
      data: workerTypes.map((workerType) => ({
        ideaId,
        workerType,
        status: 'PENDING',
        message: getInitialMessage(workerType),
      })),
    });

    // Update idea status
    await prisma.idea.update({
      where: { id: ideaId },
      data: {
        status: 'RESEARCHING',
        lastResearchedAt: new Date(),
      },
    });

    // Queue all research jobs
    await queueAllResearch(ideaId, title, content, userId);

    console.log(`Research triggered for idea: ${ideaId}`);
  } catch (error) {
    console.error('Error triggering research:', error);
    throw error;
  }
}

// Get initial message for each worker type
function getInitialMessage(workerType: string): string {
  switch (workerType) {
    case 'ai-analysis':
      return 'Waiting to analyze idea...';
    case 'web-search':
      return 'Waiting to search the web...';
    case 'product-hunt':
      return 'Waiting to search Product Hunt...';
    case 'github':
      return 'Waiting to search GitHub...';
    case 'reddit':
      return 'Waiting to search Reddit...';
    default:
      return 'Waiting to start...';
  }
}

// Update progress for a specific worker
export async function updateResearchProgress(
  ideaId: string,
  workerType: string,
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED',
  message?: string,
  resultsCount?: number,
  error?: string
): Promise<void> {
  try {
    await prisma.researchProgress.updateMany({
      where: {
        ideaId,
        workerType,
      },
      data: {
        status,
        ...(message && { message }),
        ...(resultsCount !== undefined && { resultsCount }),
        ...(error && { error }),
        ...(status === 'COMPLETED' || status === 'FAILED' ? { completedAt: new Date() } : {}),
      },
    });
  } catch (error) {
    console.error('Error updating research progress:', error);
  }
}

// Check if all research is complete for an idea
export async function checkResearchComplete(ideaId: string): Promise<boolean> {
  const progress = await prisma.researchProgress.findMany({
    where: { ideaId },
  });

  const allComplete = progress.every(
    (p) => p.status === 'COMPLETED' || p.status === 'FAILED'
  );

  if (allComplete) {
    // Update idea status back to ACTIVE
    await prisma.idea.update({
      where: { id: ideaId },
      data: { status: 'ACTIVE' },
    });
  }

  return allComplete;
}
