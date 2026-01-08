import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { slug } = await params;

    const neighborhood = await prisma.neighborhood.findUnique({
      where: { slug },
      include: {
        userNeighborhoods: {
          where: {
            userId: session.user.id,
          },
          include: {
            photos: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    if (!neighborhood) {
      return NextResponse.json(
        { error: 'Neighborhood not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: neighborhood.id,
      name: neighborhood.name,
      borough: neighborhood.borough,
      slug: neighborhood.slug,
      userNeighborhood: neighborhood.userNeighborhoods[0] || null,
    });
  } catch (error) {
    console.error('Get neighborhood error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { explored, notes } = body;

    const neighborhood = await prisma.neighborhood.findUnique({
      where: { slug },
    });

    if (!neighborhood) {
      return NextResponse.json(
        { error: 'Neighborhood not found' },
        { status: 404 }
      );
    }

    const userNeighborhood = await prisma.userNeighborhood.upsert({
      where: {
        userId_neighborhoodId: {
          userId: session.user.id,
          neighborhoodId: neighborhood.id,
        },
      },
      update: {
        ...(typeof explored === 'boolean' && {
          explored,
          exploredAt: explored ? new Date() : null,
        }),
        ...(notes !== undefined && { notes }),
      },
      create: {
        userId: session.user.id,
        neighborhoodId: neighborhood.id,
        explored: explored ?? false,
        exploredAt: explored ? new Date() : null,
        notes: notes ?? null,
      },
      include: {
        photos: true,
      },
    });

    return NextResponse.json({ userNeighborhood });
  } catch (error) {
    console.error('Update neighborhood error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
