interface LoadingSpinnerProps {
  message?: string
}

export default function LoadingSpinner({ message = "Generating notebook..." }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-sm text-gray-500 mt-2">This may take a few seconds...</p>
    </div>
  )
}