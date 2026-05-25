import { PrismaClient } from "@prisma/client";

/**
 * Prisma 7+ Configuration Layer
 * Centralized DB client configuration
 */

export const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export default prisma;
