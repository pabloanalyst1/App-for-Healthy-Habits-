const API_BASE_URL = '/api';

class MetricsService {
  getAuthHeaders() {
    const token = localStorage.getItem('token');

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = 'Request failed';

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = `Request failed with status ${response.status}`;
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Get habit categories
  async getCategories() {
    return this.request('/metrics/categories');
  }

  // Get user's habits
  async getHabits() {
    return this.request('/metrics/habits');
  }

  // Add a habit
  async addHabit(categoryId, customName, targetValue, isActive = true) {
    return this.request('/metrics/habits', {
      method: 'POST',
      body: JSON.stringify({ categoryId, customName, targetValue, isActive }),
    });
  }

  // Update a habit
  async updateHabit(habitId, updates) {
    return this.request(`/metrics/habits/${habitId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Delete a habit
  async deleteHabit(habitId) {
    return this.request(`/metrics/habits/${habitId}`, {
      method: 'DELETE',
    });
  }

  // Log habit completion
  async logHabit(habitId, date, completed, actualValue, notes) {
    return this.request(`/metrics/habits/${habitId}/log`, {
      method: 'POST',
      body: JSON.stringify({ date, completed, actualValue, notes }),
    });
  }

  // Get habit logs
  async getHabitLogs(habitId, startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    return this.request(`/metrics/habits/${habitId}/logs?${params}`);
  }

  // Add metric
  async addMetric(categoryId, date, value, unit, notes) {
    return this.request('/metrics/metrics', {
      method: 'POST',
      body: JSON.stringify({ categoryId, date, value, unit, notes }),
    });
  }

  // Get metrics
  async getMetrics(categoryId, startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    if (categoryId) params.append('categoryId', categoryId);

    return this.request(`/metrics/metrics?${params}`);
  }

  // Get dashboard data
  async getDashboard() {
    return this.request('/metrics/dashboard');
  }
}

export default new MetricsService();
