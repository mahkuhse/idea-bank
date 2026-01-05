import { prisma } from '@/lib/db';
import { queueAllResearch } from '@/lib/queue/research-queue';

// Change detection thresholds
const SIGNIFICANT_WORD_COUNT_CHANGE = 50; // Words added
const MIN_CONTENT_LENGTH = 20; // Minimum words to trigger research
const RESEARCH_COOLDOWN_HOURS = 24; // Don't re-research within 24 hours

// Count words in text
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Check if research should be triggered
export async function shouldTriggerResearch(
  ideaId: string,
  newTitle: string,
  newContent: string
): Promise<boolean> {
  try {
    // Get the idea from database
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return false;
    }

    // Check if this is the first save
    const isFirstSave = !idea.lastResearchedAt;

    // Check content length
    const wordCount = countWords(newContent);
    if (wordCount < MIN_CONTENT_LENGTH) {
      return false; // Too short to research
    }

    // Check if title changed
    const titleChanged = idea.title !== newTitle;

    // Check word count change
    const oldWordCount = countWords(idea.contentText || '');
    const newWordCount = wordCount;
    const wordsAdded = newWordCount - oldWordCount;
    const significantContentChange = wordsAdded >= SIGNIFICANT_WORD_COUNT_CHANGE;

    // Check cooldown period
    const withinCooldown = idea.lastResearchedAt
      ? Date.now() - idea.lastResearchedAt.getTime() < RESEARCH_COOLDOWN_HOURS * 60 * 60 * 1000
      : false;

    // Trigger conditions
    const shouldTrigger =
      isFirstSave ||
      (titleChanged && !withinCooldown) ||
      (significantContentChange && !withinCooldown);

    return shouldTrigger;
  } catch (error) {
    console.error('Error checking research trigger:', error);
    return false;
  }
}

// Trigger research for an idea
export async function triggerResearch(
  ideaId: string,
  title: string,
  content: string,
  userId: string
): Promise<void> {
  try {
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

// Main function to check and trigger research if needed
export async function checkAndTriggerResearch(
  ideaId: string,
  newTitle: string,
  newContent: string,
  userId: string
): Promise<boolean> {
  const should = await shouldTriggerResearch(ideaId, newTitle, newContent);

  if (should) {
    await triggerResearch(ideaId, newTitle, newContent, userId);
    return true;
  }

  return false;
}
