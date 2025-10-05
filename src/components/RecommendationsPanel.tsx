import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, Lightbulb, TrendingUp, X } from 'lucide-react';
import { recommendationService, Recommendation, SpendingInsight } from '../services/recommendationService';
import { Budget, Transaction, Category } from '../types';

interface RecommendationsPanelProps {
  budget: Budget;
  transactions: Transaction[];
  categories: Category[];
  userId: string;
}

export default function RecommendationsPanel({
  budget,
  transactions,
  categories,
  userId
}: RecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<SpendingInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, [budget, transactions, categories, userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const [recs, spendingInsights] = await Promise.all([
        recommendationService.generateRecommendations(userId, budget, transactions, categories),
        recommendationService.getSpendingInsights(transactions, categories)
      ]);

      setRecommendations(recs.filter(r => !dismissedIds.has(r.id)));
      setInsights(spendingInsights);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissRecommendation = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-orange-400" />;
      default:
        return <Info className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/15';
      case 'success':
        return 'bg-green-500/10 border-green-500/20 hover:bg-green-500/15';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15';
      case 'tip':
        return 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15';
      default:
        return 'bg-slate-500/10 border-slate-500/20 hover:bg-slate-500/15';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Smart Recommendations</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-700/50 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Smart Recommendations</h3>
          <span className="ml-auto px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
            {recommendations.length} insights
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-slate-300 font-medium">You're doing great!</p>
            <p className="text-slate-400 text-sm mt-1">No urgent recommendations at this time.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map(rec => (
              <div
                key={rec.id}
                className={`border rounded-lg p-4 transition-all ${getTypeStyles(rec.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(rec.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{rec.title}</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{rec.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-slate-400">{rec.category}</span>
                          {rec.priority >= 8 && (
                            <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">
                              High Priority
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => dismissRecommendation(rec.id)}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {insights && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Spending Insights</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Daily Average</p>
              <p className="text-2xl font-bold text-white">
                ${insights.averageDaily.toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">Weekly Average</p>
              <p className="text-2xl font-bold text-white">
                ${insights.averageWeekly.toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-1">vs Last Month</p>
              <p className={`text-2xl font-bold ${
                insights.comparison.vsLastMonth > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {insights.comparison.vsLastMonth > 0 ? '+' : ''}
                {insights.comparison.vsLastMonth.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-white font-semibold mb-3">Top Spending Categories</h4>
              <div className="space-y-2">
                {insights.topCategories.slice(0, 5).map((cat, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm">{cat.name}</span>
                        <span className="text-slate-400 text-sm">
                          ${cat.amount.toFixed(2)} ({cat.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                          style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {insights.trends.increasing.length > 0 && (
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  Increasing Expenses
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insights.trends.increasing.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {insights.trends.decreasing.length > 0 && (
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />
                  Decreasing Expenses
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insights.trends.decreasing.map((cat, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
