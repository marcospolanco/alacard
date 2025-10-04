// Backend API client for Alacard

export class BackendAPI {
  private static baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'

  static async getPopularModels(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/models/popular`)
      if (response.ok) {
        const data = await response.json()
        return data.models
      }
      throw new Error('Failed to fetch popular models')
    } catch (error) {
      console.error('Error fetching popular models:', error)
      throw error
    }
  }

  static async searchModels(category: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/models/search?category=${category}`)
      if (response.ok) {
        const data = await response.json()
        return data.models
      }
      throw new Error('Failed to search models')
    } catch (error) {
      console.error('Error searching models:', error)
      throw error
    }
  }

  static async generateNotebook(modelId: string): Promise<{ task_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notebook/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hf_model_id: modelId }),
      })

      if (response.ok) {
        const data = await response.json()
        return { task_id: data.share_id }
      }
      throw new Error('Failed to generate notebook')
    } catch (error) {
      console.error('Error generating notebook:', error)
      throw error
    }
  }

  static async downloadNotebook(shareId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notebook/download/${shareId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'notebook.ipynb'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading notebook:', error)
      throw error
    }
  }

  static async getNotebook(shareId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/notebook/${shareId}`)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to get notebook')
    } catch (error) {
      console.error('Error getting notebook:', error)
      throw error
    }
  }

  static async getTaskStatus(taskId: string): Promise<{ status: string; progress?: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/task/${taskId}/status`)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to get task status')
    } catch (error) {
      console.error('Error getting task status:', error)
      throw error
    }
  }

  static createWebSocketConnection(taskId: string): WebSocket {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws') + `/api/task/${taskId}/ws`
    return new WebSocket(wsUrl)
  }
}