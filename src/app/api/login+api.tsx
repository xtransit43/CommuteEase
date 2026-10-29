import { prisma } from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate request inputs
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in the database by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password match using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Optional 2FA check if enabled in your schema
    if (user.isTwoFactorEnabled) {
      return Response.json(
        { 
          requires2FA: true, 
          message: '2FA verification required' 
        },
        { status: 200 }
      );
    }

    // Successful login response returning user metadata and ID for local storage session
    return Response.json(
      { 
        message: 'Logged in successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          vehicleType: user.vehicleType,
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}
