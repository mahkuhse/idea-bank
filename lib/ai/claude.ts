import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Neutral assessment prompt - no encouragement or discouragement
const ANALYSIS_PROMPT = `You are a comprehensive research analyst. Provide a complete, neutral assessment of this idea.

CRITICAL RULES:
- Do NOT encourage or discourage the user
- Do NOT say "Great idea!", "This could work!", or similar positive phrases
- Do NOT say "This won't work", "Give up", or similar negative phrases
- Grade novelty realistically based on existing solutions
- Be thorough in finding existing solutions
- Provide ONLY facts and evidence-based analysis

Your job is to help the user see the FULL PICTURE - good, bad, and in-between.`;

export interface IdeaAnalysis {
  noveltyScore: number; // 0-10, calibrated realistically
  category: string;
  keyConcepts: string[];
  existingSolutions: string[];
  marketLandscape: string;
  challenges: string[];
  opportunities: string[];
  searchQueries: string[];
}

// Analyze an idea with Claude API
export async function analyzeIdea(
  title: string,
  content: string
): Promise<IdeaAnalysis> {
  const prompt = `${ANALYSIS_PROMPT}

Idea Title: ${title}

Idea Content:
${content}

Provide a JSON response with the following structure:
{
  "noveltyScore": <number 0-10, be realistic - most ideas are 2-4>,
  "category": "<type of idea: product, service, content, research, etc>",
  "keyConcepts": ["<concept 1>", "<concept 2>", ...],
  "existingSolutions": ["<specific product/service 1>", "<specific product/service 2>", ...],
  "marketLandscape": "<who else is in this space, their traction>",
  "challenges": ["<challenge 1 with evidence>", "<challenge 2 with evidence>", ...],
  "opportunities": ["<opportunity 1 with evidence>", "<opportunity 2 with evidence>", ...],
  "searchQueries": ["<query 1>", "<query 2>", "<query 3>"]
}

Be complete, neutral, and factual. List ALL existing solutions you know about.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse JSON from the response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const analysis: IdeaAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Error analyzing idea with Claude:', error);
    throw error;
  }
}

// Calculate similarity between idea and existing solution
export async function calculateSimilarity(
  ideaContent: string,
  competitorDescription: string
): Promise<number> {
  const prompt = `Compare these two products/ideas and provide a similarity score from 0-100 based on feature overlap.

Idea:
${ideaContent}

Competitor:
${competitorDescription}

Respond with ONLY a number from 0-100 representing percentage of feature overlap.
0 = completely different
100 = identical features

Be objective and precise.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const score = parseInt(content.text.trim(), 10);
    return isNaN(score) ? 0 : Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return 0;
  }
}
