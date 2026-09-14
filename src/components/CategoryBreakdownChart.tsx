import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';
import { PieChart as PieIcon } from 'lucide-react';

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface CategoryBreakdownChartProps {
  data: CategoryData[];
  currency: CurrencyCode;
  totalMonthly: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment': '#EF4444',
  'Software & SaaS': '#3B82F6',
  'Cloud & Hosting': '#F97316',
  'Health & Fitness': '#10B981',
  'Productivity': '#8B5CF6',
  'Utilities & Bills': '#64748B',
  'Gaming': '#EC4899',
  'Food & Delivery': '#F59E0B',
  'Finance & Security': '#06B6D4',
  'Other': '#94A3B8',
};

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({
  data,
  currency,
  totalMonthly,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0 || totalMonthly === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center flex flex-col items-center justify-center h-80 shadow-xs">
        <PieIcon className="w-10 h-10 text-slate-300 mb-2" />
        <p className="text-sm font-semibold text-slate-700">No active subscription data to visualize.</p>
        <p className="text-xs text-slate-400 mt-1">Add your subscriptions to see spending by category.</p>
      </div>
    );
  }

  return (
    <div id="chart-category-breakdown" className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Category Spend Breakdown</h3>
          <p className="text-xs text-slate-500">Monthly allocation across expense categories</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {data.length} Categories
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Recharts Donut Pie */}
        <div className="lg:col-span-5 h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[...data]}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={82}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => {
                  const color = CATEGORY_COLORS[entry.name] || '#3B82F6';
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      className="cursor-pointer transition-opacity"
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                itemSorter={() => 0}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategoryData;
                    return (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-xs text-slate-900">
                        <div className="font-bold text-sm flex items-center space-x-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#3B82F6' }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <div className="mt-1 text-slate-600">
                          Monthly: <strong className="text-slate-900">{formatCurrency(item.value, currency)}</strong>
                        </div>
                        <div className="text-slate-400 mt-0.5">{item.percentage}% of total monthly spend</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-medium text-slate-400">Total / mo</span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(totalMonthly, currency, true)}
            </span>
          </div>
        </div>

        {/* Legend / Category List with Progress Bars */}
        <div className="lg:col-span-7 space-y-2.5">
          {[...data]
            .sort((a, b) => b.value - a.value)
            .map((cat, idx) => {
              const color = CATEGORY_COLORS[cat.name] || '#3B82F6';
              const isHovered = activeIndex === idx;

              return (
                <div
                  key={cat.name}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{formatCurrency(cat.value, currency)}</span>
                      <span className="text-slate-400 ml-1 font-normal">({cat.percentage}%)</span>
                    </div>
                  </div>

                  {/* Progress bar matching Clean Minimalism styling */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
