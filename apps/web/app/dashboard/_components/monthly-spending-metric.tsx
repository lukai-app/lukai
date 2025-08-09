'use client';

import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceDot,
  Label,
} from 'recharts';

import { cn } from '@/lib/utils';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import DayjsSingleton from '@/lib/helpers/Dayjs';

type InputPoint = {
  date: string; // ISO date
  amount?: number; // daily spend amount (non-cumulative)
  cumulativeSpend?: number; // optional if already cumulative
};

interface MonthlySpendingMetricProps {
  title?: string;
  data: InputPoint[]; // actual spend per day (amount) or cumulative
  projectedData?: InputPoint[]; // optional dashed projection
  budget: number; // total budget for the month
  currency: string;
  locale: string;
  transactionsHref?: string; // optional link URL for the header action
  className?: string;
}

export const MonthlySpendingMetric: React.FC<MonthlySpendingMetricProps> = (
  props
) => {
  const {
    title = 'gastos mensuales',
    data,
    projectedData,
    budget,
    currency,
    locale,
    transactionsHref,
    className,
  } = props;

  const dayjs = DayjsSingleton.getInstance(locale);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);

  // Helper to build a cumulative series. If both amount and cumulative exist,
  // prefer computing from amount to avoid accidental resets from zero values
  // in raw cumulative inputs.
  const buildCumulative = React.useCallback((points: InputPoint[]) => {
    let running = 0;
    return points
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => {
        let value: number;
        if (typeof p.amount === 'number') {
          running += p.amount;
          value = running;
        } else if (typeof p.cumulativeSpend === 'number') {
          // trust provided cumulative and sync running to it
          running = p.cumulativeSpend;
          value = running;
        } else {
          // no data for this day, carry forward running total
          value = running;
        }
        return { date: p.date, cumulativeSpend: Math.max(0, value) };
      });
  }, []);

  // Convert to cumulative series for actual and projected
  const actualSeries = React.useMemo(
    () => buildCumulative(data),
    [buildCumulative, data]
  );

  const projectionSeries = React.useMemo(() => {
    if (!projectedData || projectedData.length === 0) return undefined;
    // Seed the projection with the last actual cumulative value
    const seeded = [
      {
        date: actualSeries.length
          ? actualSeries[actualSeries.length - 1].date
          : '',
        cumulativeSpend: actualSeries.length
          ? actualSeries[actualSeries.length - 1].cumulativeSpend
          : 0,
      },
      ...projectedData,
    ];
    const series = buildCumulative(seeded);
    // Drop the seeded first element if we added one that wasn't an actual projected point
    return series.slice(1);
  }, [projectedData, actualSeries, buildCumulative]);

  const current = actualSeries.length
    ? actualSeries[actualSeries.length - 1].cumulativeSpend
    : 0;
  const overUnder = current - budget;
  const isOver = overUnder > 0;

  const chartConfig = {
    actual: {
      label: 'Actual',
      color: '#2EB88A',
    },
    projected: {
      label: 'Projected',
      color: '#94A3B8', // slate-400
    },
  } satisfies ChartConfig;

  const lastPoint = actualSeries[actualSeries.length - 1];

  return (
    <div
      className={cn(
        'rounded-2xl p-6 border relative border-[#2A2A2A]',
        className
      )}
    >
      {/* Header */}
      <div className="mb-6 flex justify-between">
        <h3 className="text-base font-medium text-slate-300">{title}</h3>
        {transactionsHref ? (
          <a
            href={transactionsHref}
            className="text-xs uppercase tracking-wide text-slate-400 hover:text-slate-200"
          >
            Transacciones ↗
          </a>
        ) : null}
      </div>
      <div className="mb-4 absolute top-4 right-6">
        <div className="mb-1 text-xl font-bold">
          {formatCurrency(Math.abs(overUnder))} {isOver ? 'extra' : 'restante'}
        </div>
        <div className="text-slate-400">
          {formatCurrency(budget)} presupuestado
        </div>
      </div>

      {/* Metric */}

      {/* Chart */}
      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <LineChart
          accessibilityLayer
          data={actualSeries}
          margin={{ left: 12, right: 12, top: 8, bottom: 0 }}
        >
          {/* Gradient from green → orange → red along the X axis */}
          <defs>
            <linearGradient
              id="monthly-spend-gradient"
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0%" stopColor="#2EB88A" />
              <stop offset="70%" stopColor="#2EB88A" />
              <stop offset="90%" stopColor="#F37212" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickMargin={8}
            tickFormatter={(value) => ''}
            tickLine={false}
            axisLine={false}
          />

          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) => dayjs(value).format('MMM D')}
                formatter={(val) => [
                  formatCurrency(val as number),
                  ' gastados',
                ]}
              />
            }
          />

          {/* Projected dashed path */}
          {projectionSeries && projectionSeries.length > 0 ? (
            <Line
              data={projectionSeries}
              dataKey="cumulativeSpend"
              type="monotone"
              stroke="#94A3B8"
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
          ) : null}

          {/* Actual line with gradient */}
          <Line
            dataKey="cumulativeSpend"
            type="monotone"
            stroke="url(#monthly-spend-gradient)"
            strokeWidth={3}
            dot={false}
          />

          {/* Endpoint marker and over/left badge */}
          {lastPoint ? (
            <ReferenceDot
              x={lastPoint.date}
              y={lastPoint.cumulativeSpend}
              r={5}
              fill={isOver ? '#EF4444' : '#2EB88A'}
            >
              <Label
                position="right"
                offset={12}
                content={(props) => {
                  const { x = 0, y = 0 } = props as { x?: number; y?: number };
                  const text = `${formatCurrency(Math.abs(overUnder))} ${
                    isOver ? 'over' : 'left'
                  }`;
                  // Render a small SVG pill
                  const bg = isOver ? '#EF4444' : '#2EB88A';
                  const padX = 8;
                  const padY = 4;
                  return (
                    <g transform={`translate(${x}, ${y - 20})`}>
                      <rect
                        x={0}
                        y={-14}
                        rx={6}
                        ry={6}
                        height={22}
                        width={text.length * 7 + padX * 2}
                        fill={bg}
                      />
                      <text
                        x={padX}
                        y={-14 + 15}
                        fill="#0B0F1A"
                        fontSize={12}
                        fontWeight={600}
                      >
                        {text}
                      </text>
                    </g>
                  );
                }}
              />
            </ReferenceDot>
          ) : null}
        </LineChart>
      </ChartContainer>
    </div>
  );
};

export default MonthlySpendingMetric;
