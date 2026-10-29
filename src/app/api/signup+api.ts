import { prisma } from '../../../lib/prisma'; 
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 1. Check for missing required fields
    if (!username || !email || !password) {
      return Response.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Normalize inputs
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return Response.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // 3. Username length check
    if (cleanUsername.length < 2) {
      return Response.json(
        { error: 'Username must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // 4. Password length check
    if (password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // 5. Pre-check for existing account
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername }
        ],
      },
    });

    if (existingUser) {
      const fieldTaken = existingUser.email === cleanEmail ? 'email' : 'username';
      return Response.json(
        { error: `An account with this ${fieldTaken} already exists` },
        { status: 409 }
      );
    }

    // 6. Hash password and save new user
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        username: cleanUsername,
      },
      select: {
        id: true,
        username: true,
        email: true,
        vehicleType: true,
        createdAt: true,
      },
    });

    return Response.json(
      { message: 'Account has been created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating new account:', error);

    // Fallback race condition check
    if (error.code === 'P2002') {
      return Response.json(
        { error: 'Username or email has already been taken' },
        { status: 409 }
      );
    }

    return Response.json(
      { error: 'Invalid JSON payload or server error' },
      { status: 500 }
    );
  }
}
