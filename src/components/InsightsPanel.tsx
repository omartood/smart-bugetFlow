import { BudgetSummary, Transaction, SpendingInsight } from '../types';
import { analyticsUtils } from '../utils/analyticsUtils';
import * as LucideIcons from 'lucide-react';
import { Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  budgetSummary: BudgetSummary;
  transactions: Transaction[];
}

export function InsightsPanel({ budgetSummary, transactions }: InsightsPanelProps) {
  const insights = analyticsUtils.getSpendingInsights(budgetSummary, transactions);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Info;
    return IconComponent;
  };

  const getInsightStyles = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/50',
          icon: 'text-amber-400',
          text: 'text-amber-300',
        };
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/50',
          icon: 'text-emerald-400',
          text: 'text-emerald-300',
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/50',
          icon: 'text-blue-400',
          text: 'text-blue-300',
        };
    }
  };

  if (insights.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center">
        <Lightbulb className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Insights Yet</h3>
        <p className="text-slate-400">
          Add more transactions to get personalized spending insights
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="w-6 h-6 text-amber-400" />
        <h3 className="text-xl font-semibold text-white">Spending Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const styles = getInsightStyles(insight.type);
          const Icon = getIcon(insight.icon);

          return (
            <div
              key={index}
              className={`${styles.bg} border ${styles.border} rounded-xl p-4 transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <div className={`${styles.icon} mt-0.5`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                  <p className={`text-sm ${styles.text}`}>{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
