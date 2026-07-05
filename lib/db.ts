import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/** Raw SQL: return first row or null */
export async function getOne<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const result: any = await prisma.$queryRawUnsafe(query, ...params)
  return (result as any[])?.[0] ?? null
}

/** Raw SQL: return all rows */
export async function getAll<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const result: any = await prisma.$queryRawUnsafe(query, ...params)
  return (result as any[]) ?? []
}

/** Raw SQL: execute (INSERT/UPDATE/DELETE), returns row count */
export async function execute(
  query: string,
  params: any[] = []
): Promise<number> {
  const result: any = await prisma.$executeRawUnsafe(query, ...params)
  return result as number
}