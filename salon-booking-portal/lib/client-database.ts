class DatabaseService {
  private baseUrl = '/api/database'

  async init(): Promise<void> {
    // Database is initialized on the server side
    await this.post('run', { query: 'SELECT 1' })
  }

  async all(query: string, params: any[] = []): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}?operation=all&query=${encodeURIComponent(query)}&params=${encodeURIComponent(JSON.stringify(params))}`)
    const result = await response.json()
    return Array.isArray(result) ? result : []
  }

  async get(query: string, params: any[] = []): Promise<any> {
    const response = await fetch(`${this.baseUrl}?operation=get&query=${encodeURIComponent(query)}&params=${encodeURIComponent(JSON.stringify(params))}`)
    return response.json()
  }

  async run(query: string, params: any[] = []): Promise<any> {
    return this.post('run', { query, params })
  }

  private async post(operation: string, data: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        ...data
      }),
    })
    return response.json()
  }
}

export const db = new DatabaseService()
