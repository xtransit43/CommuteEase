import { PrismaClient } from '../src/generated/prisma';

const globalPrisma = global as unkown as { prisma: PrismaClient};

export const prisma =
	globalPrisma.prisma ||
	new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;