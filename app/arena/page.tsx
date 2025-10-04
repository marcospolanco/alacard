'use client'

import { useEffect } from 'react'

export default function Arena() {
  useEffect(() => {
    // Redirect to the new generator page since the arena functionality
    // has been replaced by the recipe-based system
    window.location.href = '/generator'
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Recipe Builder...</p>
      </div>
    </div>
  )
}