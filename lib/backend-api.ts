// Backend API client for Alacard - Updated for FastAPI integration

export interface ModelInfo {
  id: string;
  modelId: string;
  name: string;
  description: string;
  pipeline_tag: string;
  downloads: number;
  likes: number;
  tags: string[];
}

export interface TaskStatus {
  task_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  current_step?: string;
  message?: string;
  share_id?: string;
  error?: string;
  validation_summary?: {
    overall_status: string;
    cells_validated: number;
    syntax_errors: number;
    runtime_errors: number;
    model_loading_success: boolean;
  };
}

export interface NotebookResponse {
  id: string;
  created_at: string;
  share_id: string;
  hf_model_id: string;
  notebook_content: any;
  metadata: any;
  download_count: number;
}

export class BackendAPI {
  private static baseUrl = 'http://localhost:8000/api/v1'

  static async getPopularModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models/popular`)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to fetch popular models')
    } catch (error) {
      console.error('Error fetching popular models:', error)
      throw error
    }
  }

  static async searchModels(category?: string): Promise<ModelInfo[]> {
    try {
      const url = category
        ? `${this.baseUrl}/models/search?category=${encodeURIComponent(category)}`
        : `${this.baseUrl}/models/search`

      const response = await fetch(url)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to search models')
    } catch (error) {
      console.error('Error searching models:', error)
      throw error
    }
  }

  static async generateNotebook(modelId: string): Promise<{ task_id: string; estimated_time: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/notebooks/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hf_model_id: modelId }),
      })

      if (response.ok) {
        return await response.json()
      }
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Failed to generate notebook')
    } catch (error) {
      console.error('Error generating notebook:', error)
      throw error
    }
  }

  static async downloadNotebook(shareId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notebooks/${shareId}/download`)
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

  static async getNotebook(shareId: string): Promise<NotebookResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/notebooks/${shareId}`)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to get notebook')
    } catch (error) {
      console.error('Error getting notebook:', error)
      throw error
    }
  }

  static async getTaskStatus(taskId: string): Promise<TaskStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/notebooks/task/${taskId}`)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to get task status')
    } catch (error) {
      console.error('Error getting task status:', error)
      throw error
    }
  }

  static async getNotebookValidation(shareId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/notebooks/${shareId}/validation`)
      if (response.ok) {
        return await response.json()
      }
      throw new Error('Failed to get notebook validation')
    } catch (error) {
      console.error('Error getting notebook validation:', error)
      throw error
    }
  }

  // Poll for task completion
  static async pollTaskCompletion(
    taskId: string,
    onProgress?: (status: TaskStatus) => void,
    pollInterval: number = 2000
  ): Promise<TaskStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getTaskStatus(taskId)

          if (onProgress) {
            onProgress(status)
          }

          if (status.status === 'completed') {
            resolve(status)
          } else if (status.status === 'failed') {
            reject(new Error(status.error || 'Task failed'))
          } else {
            // Continue polling
            setTimeout(poll, pollInterval)
          }
        } catch (error) {
          reject(error)
        }
      }

      poll()
    })
  }

  // WebSocket connection for real-time progress
  static createWebSocketConnection(taskId: string): WebSocket {
    const wsUrl = `ws://localhost:8000/ws/progress/${taskId}`
    return new WebSocket(wsUrl)
  }
}

// Mock data types for the new UI (to be replaced with real data)
export interface MockModel {
  id: string;
  modelId: string;
  name: string;
  description: string;
  pipeline_tag: string;
  downloads?: number;
  likes?: number;
  tags?: string[];
}

export interface MockPrompt {
  id: string;
  name: string;
  description: string;
  prompts: string[];
}

export interface MockTopic {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface MockDifficulty {
  id: string;
  name: string;
  description: string;
}

export interface MockComponent {
  id: string;
  name: string;
  description: string;
  complexity: string;
}