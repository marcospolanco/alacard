import { ModelCard, Notebook, TaskStatus } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alacard.onrender.com'

export class BackendAPI {
  private static baseUrl = `${API_BASE_URL}/api/v1`

  static async getPopularModels(): Promise<ModelCard[]> {
    const response = await fetch(`${this.baseUrl}/models/popular`)
    if (!response.ok) {
      throw new Error('Failed to fetch popular models')
    }
    const models = await response.json()
    return models.map((model: any) => ({
      id: model.id,
      modelId: model.modelId,
      name: model.name,
      description: model.description,
      pipeline_tag: model.pipeline_tag,
      downloads: model.downloads,
      likes: model.likes,
      tags: model.tags
    }))
  }

  static async searchModels(category?: string): Promise<ModelCard[]> {
    const url = new URL(`${this.baseUrl}/models/search`)
    if (category) {
      url.searchParams.append('category', category)
    }

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error('Failed to search models')
    }
    const models = await response.json()
    return models.map((model: any) => ({
      id: model.id,
      modelId: model.modelId,
      name: model.name,
      description: model.description,
      pipeline_tag: model.pipeline_tag,
      downloads: model.downloads,
      likes: model.likes,
      tags: model.tags
    }))
  }

  static async generateNotebook(modelId: string): Promise<{ task_id: string; estimated_time: number }> {
    const response = await fetch(`${this.baseUrl}/notebooks/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hf_model_id: modelId }),
    })

    if (!response.ok) {
      throw new Error('Failed to start notebook generation')
    }

    return response.json()
  }

  static async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const response = await fetch(`${this.baseUrl}/notebooks/task/${taskId}`)
    if (!response.ok) {
      throw new Error('Failed to get task status')
    }
    return response.json()
  }

  static async getNotebook(shareId: string): Promise<Notebook> {
    const response = await fetch(`${this.baseUrl}/notebooks/${shareId}`)
    if (!response.ok) {
      throw new Error('Failed to get notebook')
    }
    return response.json()
  }

  static createWebSocketConnection(taskId: string): WebSocket {
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/ws/progress/${taskId}`
    return new WebSocket(wsUrl)
  }

  static async downloadNotebook(shareId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/notebooks/${shareId}/download`)
    if (!response.ok) {
      throw new Error('Failed to download notebook')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    // Extract filename from headers or create a default one
    const contentDisposition = response.headers.get('content-disposition')
    let filename = 'notebook.ipynb'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }

    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}