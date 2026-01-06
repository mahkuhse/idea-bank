import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { triggerResearch } from '@/lib/research/trigger';

// POST /api/ideas/[id]/research - Manually trigger research for an idea
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the idea
    const idea = await prisma.idea.findUnique({
      where: { id },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check if idea has enough content
    const wordCount = idea.contentText.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount < 5) {
      return NextResponse.json(
        { error: 'Please add more content to your idea before researching (at least 5 words)' },
        { status: 400 }
      );
    }

    // Check if research is already in progress
    if (idea.status === 'RESEARCHING') {
      return NextResponse.json(
        { error: 'Research is already in progress for this idea' },
        { status: 409 }
      );
    }

    // Clear previous research progress for this idea
    await prisma.researchProgress.deleteMany({
      where: { ideaId: id },
    });

    // Trigger the research
    await triggerResearch(id, idea.title, idea.contentText, idea.userId);

    return NextResponse.json({
      success: true,
      message: 'Research started',
      ideaId: id,
    });
  } catch (error) {
    console.error('Error starting research:', error);
    return NextResponse.json(
      { error: 'Failed to start research' },
      { status: 500 }
    );
  }
}

// GET /api/ideas/[id]/research - Get research progress for an idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const progress = await prisma.researchProgress.findMany({
      where: { ideaId: id },
      orderBy: { startedAt: 'asc' },
    });

    const idea = await prisma.idea.findUnique({
      where: { id },
      select: {
        status: true,
        lastResearchedAt: true,
        _count: {
          select: {
            researchResults: true,
            aiInsights: true,
          },
        },
      },
    });

    return NextResponse.json({
      progress,
      status: idea?.status,
      lastResearchedAt: idea?.lastResearchedAt,
      resultCount: idea?._count.researchResults || 0,
      insightCount: idea?._count.aiInsights || 0,
    });
  } catch (error) {
    console.error('Error fetching research progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research progress' },
      { status: 500 }
    );
  }
}
