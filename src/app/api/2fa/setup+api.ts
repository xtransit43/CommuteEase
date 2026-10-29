import { prisma } from '../../../../lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user details to label the authenticator entry
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate secret with issuer and account name label
    const secret = speakeasy.generateSecret({
      issuer: 'CommuteEase',
      name: `CommuteEase (${user.email})`,
    });

    // Save temporary base32 secret to user's record
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate otpauth URL');
    }

    // Generate QR Code Data URL for frontend display
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return Response.json(
      {
        message: '2FA setup initialized',
        secret: secret.base32,
        qrCodeUrl,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('2FA setup error:', error);
    return Response.json({ error: 'Internal server error during 2FA setup' }, { status: 500 });
  }
}
