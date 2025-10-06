import { Transaction } from '../types';
import { Trash2, Calendar, Edit } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { EditTransaction } from './EditTransaction';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh: () => void;
  userId?: string;
}

export function TransactionList({ transactions, onRefresh, userId }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;
    return IconComponent;
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    setDeletingId(transactionId);
    try {
      await transactionService.deleteTransaction(transactionId);
      toast.success('Transaction deleted successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700/50 rounded-full mb-4">
          <Calendar className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h3>
        <p className="text-slate-400">
          Start tracking your expenses by adding your first transaction
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
          <p className="text-slate-400 text-sm mt-1">Your latest spending activity</p>
        </div>

        <div className="divide-y divide-slate-700/50">
        {transactions.map((transaction) => {
          const Icon = getIcon(transaction.category?.icon || 'Circle');

          return (
            <div
              key={transaction.id}
              className="p-4 hover:bg-slate-700/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${transaction.category?.color}20` }}
                >
                  <Icon
                    className="w-6 h-6"
                    style={{ color: transaction.category?.color }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {transaction.description}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${transaction.category?.color}20`,
                            color: transaction.category?.color,
                          }}
                        >
                          {transaction.category?.name}
                        </span>
                        <span className="text-slate-500 text-sm">
                          {formatDate(transaction.transaction_date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold text-lg">
                        {formatCurrency(Number(transaction.amount))}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {userId && (
                          <button
                            onClick={() => setEditingTransaction(transaction)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-all"
                            title="Edit transaction"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          disabled={deletingId === transaction.id}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all disabled:opacity-50"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {editingTransaction && userId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <EditTransaction
              userId={userId}
              transaction={editingTransaction}
              onComplete={() => {
                setEditingTransaction(null);
                onRefresh();
              }}
              onCancel={() => setEditingTransaction(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
