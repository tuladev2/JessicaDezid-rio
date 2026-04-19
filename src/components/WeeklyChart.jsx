import { memo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Tooltip customizado no estilo do site
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-outline-variant/20 rounded-xl px-4 py-3 shadow-lg text-xs">
      <p className="font-semibold text-on-surface mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const WeeklyChart = memo(({ chartData, loading }) => {
  // Skeleton
  if (loading) {
    return (
      <div className="w-full h-56 bg-surface-container/30 animate-pulse rounded-lg flex items-end justify-between p-4 gap-2">
        {[40, 60, 35, 80, 45, 70, 55].map((h, i) => (
          <div
            key={i}
            className="bg-surface-container/60 rounded-t flex-1"
            style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    );
  }

  // Sem dados
  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-56 flex items-center justify-center bg-surface-container/20 rounded-lg">
        <div className="text-center text-secondary">
          <span className="material-symbols-outlined text-4xl mb-2 block">bar_chart</span>
          <p className="text-sm">Sem dados para exibir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          barCategoryGap="30%"
          barGap={2}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e9e1dd" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#82756d' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: '#82756d' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(119,88,65,0.05)' }} />
          <Bar
            dataKey="agendamentos"
            name="Agendamentos"
            fill="#775841"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="cancelados"
            name="Cancelados"
            fill="#48626c"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

WeeklyChart.displayName = 'WeeklyChart';
export default WeeklyChart;
