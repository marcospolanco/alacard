import { useEffect, useRef, useState } from 'react'
import { TaskStatus } from '@/types'
import { BackendAPI } from '@/lib/backend-api'

export function useWebSocketProgress(taskId: string | null) {
  const [progress, setProgress] = useState<TaskStatus | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [usePolling, setUsePolling] = useState(false)

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    setUsePolling(true)
    pollingIntervalRef.current = setInterval(async () => {
      if (taskId) {
        try {
          const status = await BackendAPI.getTaskStatus(taskId)
          setProgress(status)

          if (status.status === 'completed' || status.status === 'failed') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
            }
          }
        } catch (err) {
          console.error('Polling error:', err)
          setError('Failed to get task status')
        }
      }
    }, 2000) // Poll every 2 seconds
  }

  useEffect(() => {
    if (!taskId) return

    const connectWebSocket = () => {
      try {
        const ws = BackendAPI.createWebSocketConnection(taskId)
        wsRef.current = ws

        ws.onopen = () => {
          setIsConnected(true)
          setError(null)
          setUsePolling(false)

          // Clear any existing polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === 'progress') {
              setProgress(data.data)

              // Close connection if task is complete
              if (data.data.status === 'completed' || data.data.status === 'failed') {
                ws.close()
              }
            }
          } catch (err) {
            console.error('WebSocket message error:', err)
          }
        }

        ws.onclose = () => {
          setIsConnected(false)

          // If we lose connection and task isn't complete, start polling
          if (progress && progress.status !== 'completed' && progress.status !== 'failed') {
            startPolling()
          }
        }

        ws.onerror = () => {
          setIsConnected(false)
          setError('WebSocket connection failed')

          // Fall back to polling
          if (progress && progress.status !== 'completed' && progress.status !== 'failed') {
            startPolling()
          }
        }

      } catch (err) {
        console.error('WebSocket connection error:', err)
        setError('Failed to connect to WebSocket')
        startPolling() // Fall back to polling immediately
      }
    }

    connectWebSocket()

    return () => {
      // Cleanup
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [taskId])

  return {
    progress,
    isConnected,
    error,
    usePolling
  }
}