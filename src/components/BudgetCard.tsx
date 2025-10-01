import { CategoryType } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BudgetCardProps {
  type: CategoryType;
  title: string;
  percentage: number;
  budget: number;
  spent: number;
  remaining: number;
  color: string;
}

export function BudgetCard({ type, title, percentage, budget, spent, remaining, color }: BudgetCardProps) {
  const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;
  const isOverBudget = spent > budget;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getColorClasses = (baseColor: string) => {
    const colors: Record<string, { bg: string; progress: string; text: string; glow: string }> = {
      emerald: {
        bg: 'bg-emerald-500/20',
        progress: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/50',
      },
      blue: {
        bg: 'bg-blue-500/20',
        progress: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        text: 'text-blue-400',
        glow: 'shadow-blue-500/50',
      },
      amber: {
        bg: 'bg-amber-500/20',
        progress: 'bg-gradient-to-r from-amber-500 to-orange-500',
        text: 'text-amber-400',
        glow: 'shadow-amber-500/50',
      },
    };
    return colors[baseColor];
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
          <div className={`text-3xl font-bold ${colorClasses.text}`}>
            {percentage}%
          </div>
        </div>
        <div className={`px-3 py-1.5 ${colorClasses.bg} rounded-lg`}>
          <span className={`text-sm font-semibold ${colorClasses.text}`}>
            {formatCurrency(budget)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 ${colorClasses.progress} rounded-full transition-all duration-500 ${colorClasses.glow} shadow-lg`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Spent:</span>
            <span className={`font-semibold ${isOverBudget ? 'text-red-400' : 'text-white'}`}>
              {formatCurrency(spent)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {isOverBudget ? (
              <TrendingUp className="w-4 h-4 text-red-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-400" />
            )}
            <span className={`font-semibold ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{spentPercentage.toFixed(1)}% of budget used</span>
            {isOverBudget && (
              <span className="text-red-400 font-medium">Over Budget</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
