import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkAndTriggerResearch } from '@/lib/research/trigger';

// GET /api/ideas/[id] - Get a single idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        researchResults: {
          where: { dismissed: false },
          orderBy: { similarityScore: 'desc' },
        },
        aiInsights: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            researchResults: true,
            aiInsights: true,
          },
        },
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error fetching idea:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    );
  }
}

// PATCH /api/ideas/[id] - Update an idea
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, contentText, status, userId } = body;

    const idea = await prisma.idea.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(contentText !== undefined && { contentText }),
        ...(status !== undefined && { status }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Check if research should be triggered
    if (title !== undefined || contentText !== undefined) {
      const finalTitle = title !== undefined ? title : idea.title;
      const finalContent = contentText !== undefined ? contentText : idea.contentText;
      const finalUserId = userId || idea.userId;

      // Trigger research asynchronously (don't wait)
      checkAndTriggerResearch(id, finalTitle, finalContent, finalUserId).catch((error) => {
        console.error('Error triggering research:', error);
      });
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error updating idea:', error);
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id] - Delete an idea
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.idea.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
