import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import metricsService from '../services/metricsService';

export default function MetricsChart({ habitId, categoryId, title }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, [habitId, categoryId]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let rawData = [];
      if (habitId) {
        rawData = await metricsService.getHabitLogs(habitId, startDate, endDate);
      } else {
        const dashboard = await metricsService.getDashboard();
        rawData = dashboard.weeklyStats || [];
      }

      const formatted = rawData.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        completed: item.completed ? 1 : 0,
        value: parseFloat(item.value || 0)
      }));

      setChartData(formatted);
    } catch (err) {
      console.error('Chart load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Chart...</div>;

  // If no data, show a simple message so Recharts doesn't crash trying to calculate width
  if (chartData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
        <h4 style={{ color: '#0f172a', marginBottom: '15px' }}>{title}</h4>
        <p>No activity logged this week yet.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '250px' }}>
      <h4 style={{ color: '#0f172a', marginBottom: '15px' }}>{title}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#22c55e"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}