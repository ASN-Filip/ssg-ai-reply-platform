"use client"

import React from 'react'
import { useUsersStore } from '@/stores/useUsersStore'

export default function AddUserButton() {
  const openEdit = useUsersStore(state => state.openEdit)
  return (
    <button
      aria-label="Add user"
      data-testid="add-user-button"
      onClick={() => openEdit({ name: '', email: '', role: 'user' })}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md flex items-center gap-2"
    >
      <span aria-hidden>➕</span>
      <span>Add new user</span>
    </button>
  )
}
