import { prisma } from '@/lib/prisma';
import speakeasy from 'speakeasy';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, token } = body;

    if (!userId || !token) {
      return Response.json({ error: 'User ID and token are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.twoFactorSecret) {
      return Response.json({ error: 'User or 2FA secret not found' }, { status: 404 });
    }

    // Verify the submitted 6-digit code against the user's secret
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1, // Allow a slight time drift window (30 seconds before/after)
    });

    if (!verified) {
      return Response.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Enable 2FA permanently for this user upon successful verification
    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });

    return Response.json(
      { message: '2FA verified and enabled successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('2FA verification error:', error);
    return Response.json({ error: 'Internal server error during 2FA verification' }, { status: 500 });
  }
}