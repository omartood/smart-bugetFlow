import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Transaction, Category, CategoryType } from '../types';
import { categoryService } from '../services/categoryService';
import { transactionService } from '../services/transactionService';
import { X, Save } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface EditTransactionProps {
  userId: string;
  transaction: Transaction;
  onComplete: () => void;
  onCancel: () => void;
}

export function EditTransaction({ userId, transaction, onComplete, onCancel }: EditTransactionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedType, setSelectedType] = useState<CategoryType>(
    transaction.category?.type || 'needs'
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(transaction.category_id);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [description, setDescription] = useState(transaction.description);
  const [transactionDate, setTransactionDate] = useState(
    transaction.transaction_date.split('T')[0]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories(userId);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  useEffect(() => {
    if (filteredCategories.length > 0) {
      const currentCategoryInType = filteredCategories.find(c => c.id === selectedCategoryId);
      if (!currentCategoryInType) {
        setSelectedCategoryId(filteredCategories[0].id);
      }
    }
  }, [selectedType, filteredCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategoryId || !amount || !description) {
      toast.error('Please fill in all fields');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      await transactionService.updateTransaction(
        transaction.id,
        selectedCategoryId,
        parsedAmount,
        description.trim(),
        transactionDate
      );

      toast.success('Transaction updated successfully!');
      onComplete();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.DollarSign;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Edit Transaction</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2 p-1 bg-slate-700/50 rounded-lg">
          <button
            type="button"
            onClick={() => setSelectedType('needs')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
              selectedType === 'needs'
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-600'
            }`}
          >
            Needs
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('wants')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
              selectedType === 'wants'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-600'
            }`}
          >
            Wants
          </button>
          <button
            type="button"
            onClick={() => setSelectedType('savings')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
              selectedType === 'savings'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'text-slate-300 hover:bg-slate-600'
            }`}
          >
            Savings
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredCategories.map((cat) => {
              const Icon = getIconComponent(cat.icon);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedCategoryId === cat.id
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: cat.color }} />
                  <p className="text-xs text-slate-300 text-center">{cat.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you spend on?"
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Transaction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
