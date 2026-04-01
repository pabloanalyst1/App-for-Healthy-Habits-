import { useState, useEffect } from 'react';
import metricsService from '../services/metricsService';

export default function MetricsChart({ habitId, categoryId, title }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [habitId, categoryId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let data;
      if (habitId) {
        data = await metricsService.getHabitLogs(habitId, startDate, endDate);
      } else if (categoryId) {
        data = await metricsService.getMetrics(categoryId, startDate, endDate);
      }

      setMetrics(data || []);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading metrics...</div>;
  }

  if (metrics.length === 0) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No data available</div>;
  }

  // Simple bar chart visualization
  const maxValue = Math.max(...metrics.map(m => habitId ? (m.completed ? 1 : 0) : parseFloat(m.value)));
  const chartHeight = 200;

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>{title}</h3>

      <div style={{
        display: 'flex',
        alignItems: 'end',
        height: `${chartHeight}px`,
        gap: '4px',
        padding: '20px 0',
        borderBottom: '1px solid #e5e7eb',
        borderLeft: '1px solid #e5e7eb'
      }}>
        {metrics.slice(-14).map((metric, index) => {
          const value = habitId ? (metric.completed ? 1 : 0) : parseFloat(metric.value);
          const height = maxValue > 0 ? (value / maxValue) * chartHeight : 0;
          const date = new Date(metric.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '30px',
                  height: `${height}px`,
                  background: value > 0 ? '#22c55e' : '#e5e7eb',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                title={`${date}: ${value}`}
              />
              <span style={{
                fontSize: '10px',
                color: '#64748b',
                marginTop: '8px',
                transform: 'rotate(-45deg)',
                transformOrigin: 'center',
                whiteSpace: 'nowrap'
              }}>
                {date}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
        Last 14 days • Max: {maxValue}
      </div>
    </div>
  );
}