import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import type { Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function isAdminSession(session: Session | null) {
  return !!session && session.user?.role === 'admin'
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const resolvedParams = await params as { id: string }
  const { id } = resolvedParams
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, image: true } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const resolvedParams = await params as { id: string }
  const { id } = resolvedParams
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.email !== undefined) data.email = body.email
  if (body.role !== undefined) {
    // prevent demoting last admin
    if (body.role !== 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } })
      const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
      if (target?.role === 'admin' && adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot demote the last admin' }, { status: 400 })
      }
    }
    data.role = body.role
  }
  if (body.image !== undefined) data.image = body.image
  if (body.password) data.password = await bcrypt.hash(body.password, 10)

  const updated = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, image: true } })
  return NextResponse.json({ user: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerSession(authOptions as unknown as Record<string, unknown>) as Session | null
  if (!isAdminSession(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const resolvedParams = await params as { id: string }
  const { id } = resolvedParams
  // prevent deleting last admin
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } })
  if (target?.role === 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    if (adminCount <= 1) {
      return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 })
    }
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
