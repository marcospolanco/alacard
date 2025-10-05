'use client'

import { MODEL_CATEGORIES } from '@/lib/presets'

interface CategoryFilterProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-colors
          ${selectedCategory === null
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
        `}
      >
        All Models
      </button>

      {MODEL_CATEGORIES.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${selectedCategory === category.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}