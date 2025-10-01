import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Budget, BudgetSummary, Transaction } from '../types';
import { budgetService } from '../services/budgetService';
import { transactionService } from '../services/transactionService';
import { BudgetCard } from './BudgetCard';
import { TransactionList } from './TransactionList';
import { BudgetSetup } from './BudgetSetup';
import { AddTransaction } from './AddTransaction';
import { Wallet, LogOut, Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react';

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const loadBudgetData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const budget = await budgetService.getBudgetByMonth(user.id, currentMonth);
      setCurrentBudget(budget);

      if (budget) {
        const summary = await budgetService.getBudgetSummary(budget.id);
        setBudgetSummary(summary);

        const transactions = await transactionService.getTransactionsByBudget(budget.id);
        setRecentTransactions(transactions.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgetData();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your budget...</p>
        </div>
      </div>
    );
  }

  if (!currentBudget) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">BudgetFlow</h1>
                  <p className="text-sm text-slate-400">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mb-6 shadow-xl shadow-emerald-500/50">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Set Up Your Budget for {formatMonth(currentMonth)}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Start your financial journey with the proven 50/30/20 budgeting method.
              Enter your monthly income and we'll automatically calculate your budget allocations.
            </p>
          </div>

          <BudgetSetup
            userId={user!.id}
            month={currentMonth}
            onComplete={loadBudgetData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BudgetFlow</h1>
                <p className="text-sm text-slate-400">{profile?.full_name || profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddTransaction(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {formatMonth(currentMonth)}
              </h2>
              <p className="text-slate-400">
                Track your spending with the 50/30/20 budgeting rule
              </p>
            </div>
            <button
              onClick={() => setShowBudgetSetup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            >
              <Calendar className="w-4 h-4" />
              <span>Update Budget</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400 text-sm font-medium">Total Income</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(currentBudget.total_income)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span className="text-slate-400 text-sm font-medium">Total Spent</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {budgetSummary && formatCurrency(budgetSummary.total.spent)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span className="text-slate-400 text-sm font-medium">Remaining</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {budgetSummary && formatCurrency(budgetSummary.total.remaining)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <span className="text-slate-400 text-sm font-medium">Budget Used</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {budgetSummary && `${((budgetSummary.total.spent / budgetSummary.total.budget) * 100).toFixed(1)}%`}
              </div>
            </div>
          </div>
        </div>

        {budgetSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <BudgetCard
              type="needs"
              title="Needs"
              percentage={budgetSummary.needs.percentage}
              budget={budgetSummary.needs.budget}
              spent={budgetSummary.needs.spent}
              remaining={budgetSummary.needs.remaining}
              color="emerald"
            />
            <BudgetCard
              type="wants"
              title="Wants"
              percentage={budgetSummary.wants.percentage}
              budget={budgetSummary.wants.budget}
              spent={budgetSummary.wants.spent}
              remaining={budgetSummary.wants.remaining}
              color="blue"
            />
            <BudgetCard
              type="savings"
              title="Savings"
              percentage={budgetSummary.savings.percentage}
              budget={budgetSummary.savings.budget}
              spent={budgetSummary.savings.spent}
              remaining={budgetSummary.savings.remaining}
              color="amber"
            />
          </div>
        )}

        <TransactionList
          transactions={recentTransactions}
          onRefresh={loadBudgetData}
        />
      </main>

      {showBudgetSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <BudgetSetup
              userId={user!.id}
              month={currentMonth}
              existingBudget={currentBudget}
              onComplete={() => {
                loadBudgetData();
                setShowBudgetSetup(false);
              }}
              onCancel={() => setShowBudgetSetup(false)}
            />
          </div>
        </div>
      )}

      {showAddTransaction && currentBudget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <AddTransaction
              userId={user!.id}
              budgetId={currentBudget.id}
              onComplete={() => {
                loadBudgetData();
                setShowAddTransaction(false);
              }}
              onCancel={() => setShowAddTransaction(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
