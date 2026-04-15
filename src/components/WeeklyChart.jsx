import { memo } from 'react';

/**
 * Componente de gráfico semanal dinâmico
 * Renderiza dados reais de agendamentos vs cancelamentos
 */
const WeeklyChart = memo(({ chartData, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-60 bg-surface-container/30 animate-pulse rounded-lg flex items-end justify-between p-4">
        {[40, 60, 35, 80, 45, 70, 55].map((height, i) => (
          <div
            key={i}
            className="bg-surface-container/50 animate-pulse rounded-t"
            style={{ 
              height: `${height}%`, 
              width: '12%',
              animationDelay: `${i * 100}ms`
            }}
          ></div>
        ))}
      </div>
    );
  }

  if (!chartData || !chartData.appointments) {
    return (
      <div className="w-full h-60 flex items-center justify-center bg-surface-container/20 rounded-lg">
        <div className="text-center text-secondary">
          <span className="material-symbols-outlined text-4xl mb-2">trending_up</span>
          <p className="text-sm">Dados do gráfico indisponíveis</p>
        </div>
      </div>
    );
  }

  // Calcular pontos do gráfico baseado nos dados reais
  const maxValue = Math.max(...chartData.appointments, ...chartData.cancellations, 1);
  const chartHeight = 240;
  const chartWidth = 600;
  
  // Gerar pontos para a linha principal (agendamentos)
  const appointmentPoints = chartData.appointments.map((value, index) => {
    const x = (index * chartWidth) / (chartData.appointments.length - 1);
    const y = chartHeight - ((value / maxValue) * (chartHeight * 0.8)) - 40;
    return `${x},${y}`;
  }).join(' ');

  // Gerar pontos para a linha secundária (cancelamentos)
  const cancellationPoints = chartData.cancellations.map((value, index) => {
    const x = (index * chartWidth) / (chartData.cancellations.length - 1);
    const y = chartHeight - ((value / maxValue) * (chartHeight * 0.8)) - 40;
    return `${x},${y}`;
  }).join(' ');

  // Gerar polígono para área preenchida
  const appointmentArea = appointmentPoints + ` ${chartWidth},${chartHeight} 0,${chartHeight}`;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-[100%] h-[auto]">
      {/* Grid lines */}
      {[0, 60, 120, 180, 240].map((y) => (
        <line key={y} x1="0" y1={y} x2={chartWidth} y2={y} stroke="#e9e1dd" strokeWidth="0.5" />
      ))}

      {/* Gradient definition */}
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#775841" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#775841" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill gradient area */}
      <polygon
        points={appointmentArea}
        fill="url(#chartGrad)"
      />

      {/* Main line (appointments) */}
      <polyline
        points={appointmentPoints}
        fill="none"
        stroke="#775841"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Secondary line (cancellations) */}
      <polyline
        points={cancellationPoints}
        fill="none"
        stroke="#48626c"
        strokeWidth="1.5"
        strokeDasharray="4,4"
        strokeLinecap="round"
      />

      {/* Data points for appointments */}
      {chartData.appointments.map((value, index) => {
        const x = (index * chartWidth) / (chartData.appointments.length - 1);
        const y = chartHeight - ((value / maxValue) * (chartHeight * 0.8)) - 40;
        return (
          <circle
            key={`appt-${index}`}
            cx={x}
            cy={y}
            r="3"
            fill="#775841"
            className="opacity-0 hover:opacity-100 transition-opacity"
          >
            <title>{`${chartData.labels[index]}: ${value} agendamentos`}</title>
          </circle>
        );
      })}

      {/* Data points for cancellations */}
      {chartData.cancellations.map((value, index) => {
        const x = (index * chartWidth) / (chartData.cancellations.length - 1);
        const y = chartHeight - ((value / maxValue) * (chartHeight * 0.8)) - 40;
        return (
          <circle
            key={`canc-${index}`}
            cx={x}
            cy={y}
            r="2"
            fill="#48626c"
            className="opacity-0 hover:opacity-100 transition-opacity"
          >
            <title>{`${chartData.labels[index]}: ${value} cancelamentos`}</title>
          </circle>
        );
      })}

      {/* Day labels */}
      {chartData.labels.map((label, index) => {
        const x = (index * chartWidth) / (chartData.labels.length - 1);
        return (
          <text
            key={label}
            x={x}
            y={chartHeight - 2}
            className="text-[10px] fill-outline"
            textAnchor="middle"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
});

WeeklyChart.displayName = 'WeeklyChart';

export default WeeklyChart;