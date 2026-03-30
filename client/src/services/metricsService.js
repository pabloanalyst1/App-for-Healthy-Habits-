const API_BASE_URL = '/api';

class MetricsService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Get habit categories
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/metrics/categories`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return response.json();
  }

  // Get user's habits
  async getHabits() {
    const response = await fetch(`${API_BASE_URL}/metrics/habits`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch habits');
    }

    return response.json();
  }

  // Add a habit
  async addHabit(categoryId, customName, targetValue) {
    const response = await fetch(`${API_BASE_URL}/metrics/habits`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ categoryId, customName, targetValue })
    });

    if (!response.ok) {
      throw new Error('Failed to add habit');
    }

    return response.json();
  }

  // Log habit completion
  async logHabit(habitId, date, completed, actualValue, notes) {
    const response = await fetch(`${API_BASE_URL}/metrics/habits/${habitId}/log`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ date, completed, actualValue, notes })
    });

    if (!response.ok) {
      throw new Error('Failed to log habit');
    }

    return response.json();
  }

  // Get habit logs
  async getHabitLogs(habitId, startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`${API_BASE_URL}/metrics/habits/${habitId}/logs?${params}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch habit logs');
    }

    return response.json();
  }

  // Add metric
  async addMetric(categoryId, date, value, unit, notes) {
    const response = await fetch(`${API_BASE_URL}/metrics/metrics`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ categoryId, date, value, unit, notes })
    });

    if (!response.ok) {
      throw new Error('Failed to add metric');
    }

    return response.json();
  }

  // Get metrics
  async getMetrics(categoryId, startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    if (categoryId) params.append('categoryId', categoryId);

    const response = await fetch(`${API_BASE_URL}/metrics/metrics?${params}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }

    return response.json();
  }

  // Get dashboard data
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/metrics/dashboard`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    return response.json();
  }
}

export default new MetricsService();