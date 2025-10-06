import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Category, CategoryType } from '../types';
import { categoryService } from '../services/categoryService';
import { transactionService } from '../services/transactionService';
import { X, Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface AddTransactionProps {
  userId: string;
  budgetId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export function AddTransaction({ userId, budgetId, onComplete, onCancel }: AddTransactionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedType, setSelectedType] = useState<CategoryType>('needs');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories(userId);
      setCategories(data);

      const needsCategories = data.filter((c) => c.type === 'needs');
      if (needsCategories.length > 0) {
        setSelectedCategoryId(needsCategories[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  useEffect(() => {
    if (filteredCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(filteredCategories[0].id);
    }
  }, [selectedType, filteredCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !amount || !description) return;

    setLoading(true);
    try {
      await transactionService.createTransaction(
        userId,
        budgetId,
        selectedCategoryId,
        parseFloat(amount),
        description,
        transactionDate
      );
      onComplete();
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return IconComponent;
  };

  const typeColors = {
    needs: 'emerald',
    wants: 'blue',
    savings: 'amber',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Add Transaction</h2>
          <p className="text-slate-400 text-sm mt-1">Record a new expense or saving</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Category Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['needs', 'wants', 'savings'] as CategoryType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === type
                    ? `border-${typeColors[type]}-500 bg-${typeColors[type]}-500/10`
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold text-white capitalize mb-1">
                    {type}
                  </div>
                  <div className={`text-xs text-slate-400`}>
                    {type === 'needs' && '50%'}
                    {type === 'wants' && '30%'}
                    {type === 'savings' && '20%'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredCategories.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    selectedCategoryId === category.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <span className="text-sm text-white font-medium text-center">
                      {category.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="What was this for?"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !selectedCategoryId || !amount || !description}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
