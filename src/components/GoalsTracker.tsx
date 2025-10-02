import { useState, useEffect } from 'react';
import { SavingsGoal, Category } from '../types';
import { goalsService } from '../services/goalsService';
import { categoryService } from '../services/categoryService';
import { Target, Plus, Trash2, TrendingUp, X, DollarSign } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface GoalsTrackerProps {
  userId: string;
  onClose: () => void;
}

export function GoalsTracker({ userId, onClose }: GoalsTrackerProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [goalsData, categoriesData] = await Promise.all([
        goalsService.getUserGoals(userId),
        categoryService.getCategoriesByType('savings', userId),
      ]);
      setGoals(goalsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await goalsService.createGoal(
        userId,
        formData.title,
        parseFloat(formData.targetAmount),
        formData.deadline || undefined,
        formData.categoryId || undefined
      );
      await loadData();
      setShowForm(false);
      setFormData({ title: '', targetAmount: '', deadline: '', categoryId: '' });
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal');
    }
  };

  const handleAddProgress = async (goalId: string) => {
    const amount = prompt('Enter amount to add to this goal:');
    if (!amount || isNaN(parseFloat(amount))) return;

    try {
      await goalsService.updateProgress(goalId, parseFloat(amount));
      await loadData();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await goalsService.deleteGoal(goalId);
      await loadData();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Target;
    return IconComponent;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Savings Goals</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Goal
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">New Savings Goal</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Goal Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Emergency Fund, Vacation, etc."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Amount</label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="5000.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category (Optional)</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
            >
              Create Goal
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-slate-400">Loading...</div>
        ) : goals.length === 0 ? (
          <div className="col-span-full text-center py-8 text-slate-400">
            No savings goals yet
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const Icon = getIcon(goal.category?.icon || 'Target');
            const daysLeft = goal.deadline
              ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={goal.id}
                className={`p-6 rounded-xl border transition-all ${
                  goal.is_completed
                    ? 'bg-emerald-500/10 border-emerald-500/50'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: goal.category?.color
                          ? `${goal.category.color}20`
                          : 'rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: goal.category?.color || '#10B981' }}
                      />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{goal.title}</h4>
                      {daysLeft !== null && !goal.is_completed && (
                        <p className="text-sm text-slate-400">
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-semibold">{progress.toFixed(1)}%</span>
                  </div>

                  <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      ${goal.current_amount.toFixed(2)}
                    </span>
                    <span className="text-white font-semibold">
                      ${goal.target_amount.toFixed(2)}
                    </span>
                  </div>

                  {!goal.is_completed && (
                    <button
                      onClick={() => handleAddProgress(goal.id)}
                      className="w-full mt-4 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      Add Progress
                    </button>
                  )}

                  {goal.is_completed && (
                    <div className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-center flex items-center justify-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Goal Completed!
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
