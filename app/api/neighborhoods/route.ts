import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const borough = searchParams.get('borough');
    const explored = searchParams.get('explored');

    const neighborhoods = await prisma.neighborhood.findMany({
      where: {
        ...(borough && { borough }),
      },
      include: {
        userNeighborhoods: {
          where: {
            userId: session.user.id,
          },
          select: {
            id: true,
            explored: true,
            exploredAt: true,
            notes: true,
            photos: {
              select: {
                id: true,
                filename: true,
                path: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: [
        { borough: 'asc' },
        { name: 'asc' },
      ],
    });

    const formattedNeighborhoods = neighborhoods.map((n) => ({
      id: n.id,
      name: n.name,
      borough: n.borough,
      slug: n.slug,
      userNeighborhood: n.userNeighborhoods[0] || null,
    }));

    let filteredNeighborhoods = formattedNeighborhoods;

    if (explored === 'true') {
      filteredNeighborhoods = formattedNeighborhoods.filter(
        (n) => n.userNeighborhood?.explored
      );
    } else if (explored === 'false') {
      filteredNeighborhoods = formattedNeighborhoods.filter(
        (n) => !n.userNeighborhood?.explored
      );
    }

    const stats = {
      total: neighborhoods.length,
      explored: formattedNeighborhoods.filter((n) => n.userNeighborhood?.explored).length,
      unexplored: formattedNeighborhoods.filter((n) => !n.userNeighborhood?.explored).length,
    };

    return NextResponse.json({
      neighborhoods: filteredNeighborhoods,
      stats,
    });
  } catch (error) {
    console.error('Get neighborhoods error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
