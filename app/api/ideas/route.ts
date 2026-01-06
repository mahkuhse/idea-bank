import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/ideas - List all ideas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const shelved = searchParams.get('shelved');

    const ideas = await prisma.idea.findMany({
      where: {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { contentText: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(status && { status: status as any }),
        ...(shelved !== null && { isShelved: shelved === 'true' }),
      },
      orderBy: [
        { rank: { sort: 'asc', nulls: 'last' } },
        { updatedAt: 'desc' },
      ],
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            researchResults: true,
            aiInsights: true,
          },
        },
      },
    });

    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, contentText, userId } = body;

    if (!title || !userId) {
      return NextResponse.json(
        { error: 'Title and userId are required' },
        { status: 400 }
      );
    }

    // Ensure the user exists (create temp user if needed)
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@temp.local`,
        name: 'Temporary User',
      },
    });

    const idea = await prisma.idea.create({
      data: {
        title,
        content: content || '',
        contentText: contentText || '',
        userId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}
