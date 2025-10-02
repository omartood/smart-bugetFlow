import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Budget, BudgetSummary, Transaction } from '../types';
import { budgetService } from '../services/budgetService';
import { transactionService } from '../services/transactionService';
import { billService } from '../services/billService';
import { goalsService } from '../services/goalsService';
import { BudgetCard } from './BudgetCard';
import { TransactionList } from './TransactionList';
import { BudgetSetup } from './BudgetSetup';
import { AddTransaction } from './AddTransaction';
import { SpendingChart } from './SpendingChart';
import { InsightsPanel } from './InsightsPanel';
import { RecurringManager } from './RecurringManager';
import { GoalsTracker } from './GoalsTracker';
import { BillsManager } from './BillsManager';
import { exportUtils } from '../utils/exportUtils';
import {
  Wallet,
  LogOut,
  Plus,
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  BarChart3,
  Repeat,
  Target,
  Bell,
  Settings,
  Menu,
  X,
} from 'lucide-react';

export function EnhancedDashboard() {
  const { user, profile, signOut } = useAuth();
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [showBudgetSetup, setShowBudgetSetup] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showBills, setShowBills] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'transactions'>('overview');
  const [upcomingBillsCount, setUpcomingBillsCount] = useState(0);
  const [activeGoalsCount, setActiveGoalsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const loadBudgetData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [budget, upcomingBills, activeGoals] = await Promise.all([
        budgetService.getBudgetByMonth(user.id, currentMonth),
        billService.getUpcomingBills(user.id, 7),
        goalsService.getActiveGoals(user.id),
      ]);

      setCurrentBudget(budget);
      setUpcomingBillsCount(upcomingBills.length);
      setActiveGoalsCount(activeGoals.length);

      if (budget) {
        const [summary, transactions] = await Promise.all([
          budgetService.getBudgetSummary(budget.id),
          transactionService.getTransactionsByBudget(budget.id),
        ]);

        setBudgetSummary(summary);
        setAllTransactions(transactions);
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

  const handleExport = () => {
    if (currentBudget && budgetSummary) {
      exportUtils.downloadCSV(allTransactions, currentBudget);
      exportUtils.downloadBudgetSummary(budgetSummary, currentMonth);
    }
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
              Set Up Your Budget for {exportUtils.formatMonth(currentMonth)}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Start your financial journey with the proven 50/30/20 budgeting method.
              Enter your monthly income and we'll automatically calculate your budget allocations.
            </p>
          </div>

          <BudgetSetup userId={user!.id} month={currentMonth} onComplete={loadBudgetData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-20">
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

            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setShowAddTransaction(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>

          {showMobileMenu && (
            <div className="lg:hidden mt-4 space-y-2 pb-4 border-t border-slate-700/50 pt-4">
              <button
                onClick={() => {
                  setShowAddTransaction(true);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
              </button>
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-300 rounded-lg"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800 text-slate-300 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {exportUtils.formatMonth(currentMonth)}
              </h2>
              <p className="text-slate-400">Track your spending with the 50/30/20 budgeting rule</p>
            </div>
            <button
              onClick={() => setShowBudgetSetup(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
            >
              <Settings className="w-4 h-4" />
              <span>Update Budget</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span className="text-slate-400 text-sm font-medium">Total Income</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {exportUtils.formatCurrency(currentBudget.total_income)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span className="text-slate-400 text-sm font-medium">Total Spent</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {budgetSummary && exportUtils.formatCurrency(budgetSummary.total.spent)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span className="text-slate-400 text-sm font-medium">Remaining</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {budgetSummary && exportUtils.formatCurrency(budgetSummary.total.remaining)}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-teal-400" />
                <span className="text-slate-400 text-sm font-medium">Budget Used</span>
              </div>
              <div className="text-3xl font-bold text-white">
                {budgetSummary &&
                  `${((budgetSummary.total.spent / budgetSummary.total.budget) * 100).toFixed(1)}%`}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => setShowRecurring(true)}
              className="p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700 transition-all text-left"
            >
              <Repeat className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-white font-semibold text-sm">Recurring</div>
              <div className="text-slate-400 text-xs">Manage</div>
            </button>

            <button
              onClick={() => setShowGoals(true)}
              className="p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700 transition-all text-left"
            >
              <Target className="w-5 h-5 text-amber-400 mb-2" />
              <div className="text-white font-semibold text-sm">Goals</div>
              <div className="text-slate-400 text-xs">{activeGoalsCount} Active</div>
            </button>

            <button
              onClick={() => setShowBills(true)}
              className="p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700 transition-all text-left"
            >
              <Bell className="w-5 h-5 text-blue-400 mb-2" />
              <div className="text-white font-semibold text-sm">Bills</div>
              <div className="text-slate-400 text-xs">{upcomingBillsCount} Upcoming</div>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className="p-4 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl border border-slate-700 transition-all text-left"
            >
              <BarChart3 className="w-5 h-5 text-teal-400 mb-2" />
              <div className="text-white font-semibold text-sm">Analytics</div>
              <div className="text-slate-400 text-xs">View</div>
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'transactions'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Transactions
          </button>
        </div>

        {activeTab === 'overview' && budgetSummary && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <InsightsPanel budgetSummary={budgetSummary} transactions={allTransactions} />

            <TransactionList transactions={recentTransactions} onRefresh={loadBudgetData} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <SpendingChart transactions={allTransactions} />
            {budgetSummary && (
              <InsightsPanel budgetSummary={budgetSummary} transactions={allTransactions} />
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionList transactions={allTransactions} onRefresh={loadBudgetData} />
        )}
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

      {showRecurring && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <RecurringManager
              userId={user!.id}
              onClose={() => {
                loadBudgetData();
                setShowRecurring(false);
              }}
            />
          </div>
        </div>
      )}

      {showGoals && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <GoalsTracker
              userId={user!.id}
              onClose={() => {
                loadBudgetData();
                setShowGoals(false);
              }}
            />
          </div>
        </div>
      )}

      {showBills && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <BillsManager
              userId={user!.id}
              onClose={() => {
                loadBudgetData();
                setShowBills(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
