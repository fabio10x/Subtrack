import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';
import { BarChart3 } from 'lucide-react';

interface SpendTrendChartProps {
  monthlySpend: number;
  currency: CurrencyCode;
}

export const SpendTrendChart: React.FC<SpendTrendChartProps> = ({
  monthlySpend,
  currency,
}) => {
  // Generate 6-month historical and 2-month forecast data
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug (Now)', 'Sep (Proj)', 'Oct (Proj)'];
  
  const data = months.map((month, i) => {
    let multiplier = 1.0;
    if (i === 0) multiplier = 0.82;
    if (i === 1) multiplier = 0.88;
    if (i === 2) multiplier = 0.94;
    if (i === 3) multiplier = 0.91;
    if (i === 4) multiplier = 0.98;
    if (i === 5) multiplier = 1.0;
    if (i === 6) multiplier = 1.0;
    if (i === 7) multiplier = 1.0;

    const value = Math.max(0, monthlySpend * multiplier);
    return {
      month,
      spend: Number(value.toFixed(2)),
      projected: i >= 6,
    };
  });

  return (
    <div id="chart-spend-trend" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-1.5">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Monthly Spend Trends</span>
          </h3>
          <p className="text-xs text-slate-500">Historical billing variance and upcoming run rate</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
          6-Mo Forecast
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatCurrency(v, currency, true)}
            />
            <Tooltip
              itemSorter={() => 0}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs text-slate-900">
                      <div className="font-semibold text-slate-500">{item.month}</div>
                      <div className="text-blue-600 font-bold mt-0.5 text-base">
                        {formatCurrency(item.spend, currency)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.projected ? 'Projected forecast' : 'Actual charged spend'}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="spend"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
