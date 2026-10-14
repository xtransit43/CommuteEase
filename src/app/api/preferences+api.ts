import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        vehicleType: true,
        vehicleMake: true,
        vehicleModel: true,
      },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching preferences:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, vehicleType, vehicleMake, vehicleModel } = body;

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(vehicleType && { vehicleType }),
        ...(vehicleMake !== undefined && { vehicleMake }),
        ...(vehicleModel !== undefined && { vehicleModel }),
      },
      select: {
        id: true,
        vehicleType: true,
        vehicleMake: true,
        vehicleModel: true,
      },
    });

    return Response.json(
      { message: 'Preferences updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}