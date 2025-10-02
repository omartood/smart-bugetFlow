import { useState, useEffect } from 'react';
import { RecurringTransaction, Category, RecurringFrequency } from '../types';
import { recurringService } from '../services/recurringService';
import { categoryService } from '../services/categoryService';
import { Repeat, Plus, Trash2, Play, Pause, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface RecurringManagerProps {
  userId: string;
  onClose: () => void;
}

export function RecurringManager({ userId, onClose }: RecurringManagerProps) {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    description: '',
    frequency: 'monthly' as RecurringFrequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    autoCreate: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recurringData, categoriesData] = await Promise.all([
        recurringService.getUserRecurringTransactions(userId),
        categoryService.getAllCategories(userId),
      ]);
      setRecurring(recurringData);
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recurringService.createRecurring(
        userId,
        formData.categoryId,
        parseFloat(formData.amount),
        formData.description,
        formData.frequency,
        formData.startDate,
        formData.endDate || undefined,
        formData.autoCreate
      );
      await loadData();
      setShowForm(false);
      setFormData({
        categoryId: categories[0]?.id || '',
        amount: '',
        description: '',
        frequency: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        autoCreate: false,
      });
    } catch (error) {
      console.error('Error creating recurring transaction:', error);
      alert('Failed to create recurring transaction');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await recurringService.toggleActive(id, !isActive);
      await loadData();
    } catch (error) {
      console.error('Error toggling recurring transaction:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recurring transaction?')) return;
    try {
      await recurringService.deleteRecurring(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return IconComponent;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Repeat className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Recurring Transactions</h2>
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
          Add Recurring Transaction
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">New Recurring Transaction</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                step="0.01"
                min="0"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Monthly subscription"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurringFrequency })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoCreate}
                  onChange={(e) => setFormData({ ...formData, autoCreate: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm text-slate-300">Automatically create transactions</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
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
              Create
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : recurring.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No recurring transactions yet
          </div>
        ) : (
          recurring.map((item) => {
            const Icon = getIcon(item.category?.icon || 'Circle');
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.is_active
                    ? 'bg-slate-800/50 border-slate-700'
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${item.category?.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.category?.color }} />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-white font-medium">{item.description}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                      <span>{item.category?.name}</span>
                      <span>•</span>
                      <span className="capitalize">{item.frequency}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold">
                        ${Number(item.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(item.id, item.is_active)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      title={item.is_active ? 'Pause' : 'Resume'}
                    >
                      {item.is_active ? (
                        <Pause className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Play className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
