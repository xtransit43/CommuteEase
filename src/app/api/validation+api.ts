import { prisma } from '@/lib/prisma'; 
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return Response.json(
        { error: 'Username and Email and password are required' },
        { status: 400 }
      );
    }

    if(password.length < 8){
      return Response.json(
        { error: 'Password must be 8 characters long' },
        { status: 400 }
      );
    }

    if(username.length < 2){
      return Response.json(
        { error: 'Username must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ],
      },
    });



    if(existingUser){
      const fieldTaken = existingUser.email === email ? 'email' : 'username';
      return Response.json(
        { error: `An account with this ${fieldTaken} already exists` },
        { status: 409 }
      );
    }
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        username,
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
    if(error.code === 'P2002'){
      return Response.json(
        { error: 'Username or email has already been taken'},
        { status: 409},
      );
    }
    console.error('Account creation error:', error);
    return Response.json(
      { error: 'Invalid JSON Payload or server error' },
      { status: 500 }
    );
  }
}