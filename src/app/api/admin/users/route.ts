import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const DEFAULT_LIMIT = 20

function isAdminSession(session: Session | null) {
  return !!session && session.user?.role === 'admin'
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(req.url)
  const limitRaw = url.searchParams.get('limit')
  const cursor = url.searchParams.get('cursor') // cursor = last seen id
  const q = url.searchParams.get('q') || undefined

  const limit = Math.min(Number(limitRaw || DEFAULT_LIMIT) || DEFAULT_LIMIT, 100)

  const where: Record<string, unknown> = {}
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  }

  // typed to Prisma.UserFindManyArgs for correct typing
  // avoid importing Prisma client types in runtime code paths
  const findArgs: {
    where?: Record<string, unknown>
    take?: number
    orderBy?: { id: 'asc' }
    select?: { id: true, name: true, email: true, role: true, image: true }
    cursor?: { id: string }
    skip?: number
  } = {
    where,
    take: limit + 1,
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true, role: true, image: true }
  }

  if (cursor) {
    findArgs.cursor = { id: cursor }
    findArgs.skip = 1
  }

  const users = await prisma.user.findMany(findArgs)

  let nextCursor: string | null = null
  if (users.length > limit) {
    const next = users.pop()
    nextCursor = next?.id ?? null
  }

  return NextResponse.json({ users, nextCursor })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (!body || !body.email || !body.password) {
    return NextResponse.json({ error: 'Invalid body: email and password are required' }, { status: 400 })
  }

  const { name, email, role = 'user', password } = body

  // ensure unique email
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)

  const created = await prisma.user.create({
    data: {
      name: name ?? null,
      email,
      role,
      password: hashed,
    },
    select: { id: true, name: true, email: true, role: true, image: true }
  })

  return NextResponse.json({ user: created }, { status: 201 })
}
