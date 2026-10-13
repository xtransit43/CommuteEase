import { prisma } from '@/lib/prisma';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Generate a secret for TOTP
    const secret = speakeasy.generateSecret({
      name: 'CommuteEase',
    });

    // Save the base32 secret to the user's database record (keeping 2FA disabled until verified)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    // Generate a QR code Data URL for frontend rendering
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

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