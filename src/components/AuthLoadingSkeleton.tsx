"use client"
import React from 'react'

export default function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded shadow text-center">
        <div className="h-8 w-24 bg-gray-200 rounded mx-auto mb-6" aria-hidden />
        <div className="flex items-center justify-center mb-4">
          <svg className="animate-spin h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        </div>
        <p className="text-sm text-gray-600">Checking authentication…</p>
      </div>
    </div>
  )
}
