import { useState } from 'react';
import { Budget } from '../types';
import { budgetService } from '../services/budgetService';
import { DollarSign, TrendingUp, Home, ShoppingBag, PiggyBank } from 'lucide-react';

interface BudgetSetupProps {
  userId: string;
  month: string;
  existingBudget?: Budget | null;
  onComplete: () => void;
  onCancel?: () => void;
}

export function BudgetSetup({ userId, month, existingBudget, onComplete, onCancel }: BudgetSetupProps) {
  const [totalIncome, setTotalIncome] = useState(
    existingBudget ? existingBudget.total_income.toString() : ''
  );
  const [loading, setLoading] = useState(false);

  const incomeValue = parseFloat(totalIncome) || 0;
  const needsBudget = incomeValue * 0.5;
  const wantsBudget = incomeValue * 0.3;
  const savingsBudget = incomeValue * 0.2;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalIncome || incomeValue <= 0) return;

    setLoading(true);
    try {
      if (existingBudget) {
        await budgetService.updateBudget(existingBudget.id, incomeValue);
      } else {
        await budgetService.createBudget(userId, month, incomeValue);
      }
      onComplete();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={existingBudget ? 'p-6' : ''}>
      {existingBudget && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Update Budget</h2>
          <p className="text-slate-400">Adjust your monthly income and budget allocation</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Monthly Income
          </label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400" />
            <input
              type="number"
              value={totalIncome}
              onChange={(e) => setTotalIncome(e.target.value)}
              step="0.01"
              min="0"
              className="w-full pl-14 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-lg text-white text-2xl font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="5000.00"
              required
            />
          </div>
          <p className="text-slate-400 text-sm mt-2">
            Enter your total monthly income after taxes
          </p>
        </div>

        {incomeValue > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Budget Breakdown
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <Home className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">Needs</h4>
                      <p className="text-slate-400 text-sm">Essential expenses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-400">50%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-emerald-500/30">
                  <span className="text-slate-400">Monthly Budget</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(needsBudget)}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-3">
                  Housing, utilities, groceries, transportation, insurance, healthcare
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">Wants</h4>
                      <p className="text-slate-400 text-sm">Lifestyle & entertainment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-400">30%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-blue-500/30">
                  <span className="text-slate-400">Monthly Budget</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(wantsBudget)}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-3">
                  Dining out, entertainment, shopping, hobbies, subscriptions, travel
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">Savings</h4>
                      <p className="text-slate-400 text-sm">Future & goals</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-amber-400">20%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-amber-500/30">
                  <span className="text-slate-400">Monthly Budget</span>
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(savingsBudget)}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-3">
                  Emergency fund, retirement, investments, debt repayment, future goals
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !totalIncome || incomeValue <= 0}
            className={`${onCancel ? 'flex-1' : 'w-full'} px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200`}
          >
            {loading ? 'Saving...' : existingBudget ? 'Update Budget' : 'Create Budget'}
          </button>
        </div>
      </form>
    </div>
  );
}
