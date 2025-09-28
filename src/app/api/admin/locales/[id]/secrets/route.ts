import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/crypto'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Admin-only access
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: 'Locale ID required' }, { status: 400 })
    }

    // Find the locale with encrypted secrets
    const locale = await prisma.locale.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        displayName: true,
        bazaarVoiceApiKey: true,
        bvResponseApiKey: true,
        bvClientSecret: true,
        bvClientId: true,
        bazaarVoiceClient: true,
      }
    })

    if (!locale) {
      return NextResponse.json({ error: 'Locale not found' }, { status: 404 })
    }

    // Decrypt the sensitive fields
    const decryptedSecrets = {
      id: locale.id,
      code: locale.code,
      displayName: locale.displayName,
      bazaarVoiceApiKey: locale.bazaarVoiceApiKey ? decrypt(locale.bazaarVoiceApiKey) : null,
      bvResponseApiKey: locale.bvResponseApiKey ? decrypt(locale.bvResponseApiKey) : null,
      bvClientSecret: locale.bvClientSecret ? decrypt(locale.bvClientSecret) : null,
      bvClientId: locale.bvClientId,
      bazaarVoiceClient: locale.bazaarVoiceClient,
    }

    // Audit log the secret access
    const userEmail = session.user.email || 'unknown'
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      action: 'DECRYPT_LOCALE_SECRETS',
      adminUser: userEmail,
      localeId: id,
      localeCode: locale.code,
      userAgent: request.headers.get('user-agent') || 'unknown',
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    }

    // Log to console in dev, would log to audit system in production
    if (process.env.NODE_ENV !== 'production') {
      console.log('[AUDIT] Secret access:', JSON.stringify(logEntry, null, 2))
    }

    // In production, you'd want to store this in a dedicated audit log table:
    // await prisma.auditLog.create({ data: logEntry })

    return NextResponse.json({ 
      secrets: decryptedSecrets,
      auditId: `${timestamp}-${id}` // Return audit ID for tracking
    })

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ERROR] Failed to decrypt locale secrets:', error)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}