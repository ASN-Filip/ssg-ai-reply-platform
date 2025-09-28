"use client"

import React from 'react'

export default function AdminCategoriesHeader() {
  function handleAdd() {
    try {
      window.dispatchEvent(new CustomEvent('admin:add-category'))
    } catch {}
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add category
      </button>
    </div>
  )
}
