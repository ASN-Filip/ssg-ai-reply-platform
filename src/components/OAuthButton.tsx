"use client"
import React from 'react'
import { signIn } from 'next-auth/react'

export default function OAuthButton({ provider, children }: { provider: string; children: React.ReactNode }) {
  return (
    <button onClick={() => signIn(provider)} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded px-3 py-2 hover:bg-gray-50 bg-white">
      {children}
    </button>
  )
}
