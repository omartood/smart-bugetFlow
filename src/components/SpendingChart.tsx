import { Transaction } from '../types';
import { analyticsUtils } from '../utils/analyticsUtils';
import { exportUtils } from '../utils/exportUtils';

interface SpendingChartProps {
  transactions: Transaction[];
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  const spendingByType = analyticsUtils.getSpendingByType(transactions);
  const topCategories = analyticsUtils.getTopCategories(transactions, 5);
  const trendData = analyticsUtils.getTrendData(transactions, 30);

  const total = Object.values(spendingByType).reduce((sum, val) => sum + val, 0);

  const typeData = [
    { name: 'Needs', value: spendingByType.needs || 0, color: '#10B981', percentage: 50 },
    { name: 'Wants', value: spendingByType.wants || 0, color: '#3B82F6', percentage: 30 },
    { name: 'Savings', value: spendingByType.savings || 0, color: '#F59E0B', percentage: 20 },
  ];

  const maxTrend = Math.max(...trendData.map(d => d.amount), 1);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-6">Spending by Category Type</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {typeData.map((item) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={item.name} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-sm font-medium">{item.name}</span>
                  <span className="text-white font-semibold">
                    {exportUtils.formatCurrency(item.value)}
                  </span>
                </div>
                <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="text-slate-500">Target: {item.percentage}%</span>
                  <span
                    className={`font-medium ${
                      percentage > item.percentage + 5 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
          {typeData.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const leftOffset = typeData
              .slice(0, index)
              .reduce((sum, prev) => sum + (total > 0 ? (prev.value / total) * 100 : 0), 0);

            return (
              <div
                key={item.name}
                className="absolute inset-y-0 transition-all duration-500"
                style={{
                  left: `${leftOffset}%`,
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">Top Categories</h3>
          <div className="space-y-4">
            {topCategories.map((category, index) => {
              const maxAmount = topCategories[0]?.amount || 1;
              const percentage = (category.amount / maxAmount) * 100;

              return (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-white font-medium">{category.name}</span>
                    </div>
                    <span className="text-slate-300">
                      {exportUtils.formatCurrency(category.amount)}
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold text-white mb-6">30-Day Trend</h3>
          <div className="flex items-end justify-between h-48 gap-1">
            {trendData.slice(-30).map((day, index) => {
              const heightPercentage = (day.amount / maxTrend) * 100;
              const date = new Date(day.date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center justify-end group relative"
                >
                  <div
                    className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${heightPercentage}%`,
                      backgroundColor: isWeekend ? '#6366F1' : '#10B981',
                      minHeight: day.amount > 0 ? '4px' : '0',
                    }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10 shadow-lg border border-slate-700">
                    <div className="font-semibold">{exportUtils.formatCurrency(day.amount)}</div>
                    <div className="text-slate-400">{exportUtils.formatDate(day.date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-slate-500">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
