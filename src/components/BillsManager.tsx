import { useState, useEffect } from 'react';
import { BillReminder, Category, BillFrequency } from '../types';
import { billService } from '../services/billService';
import { categoryService } from '../services/categoryService';
import { Calendar, Plus, Trash2, Check, X, Bell } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface BillsManagerProps {
  userId: string;
  onClose: () => void;
}

export function BillsManager({ userId, onClose }: BillsManagerProps) {
  const [bills, setBills] = useState<BillReminder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    dueDate: '',
    frequency: 'monthly' as BillFrequency,
    categoryId: '',
    reminderDays: '3',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsData, categoriesData] = await Promise.all([
        billService.getUserBills(userId),
        categoryService.getAllCategories(userId),
      ]);
      setBills(billsData);
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
      await billService.createBill(
        userId,
        formData.title,
        parseFloat(formData.amount),
        formData.dueDate,
        formData.frequency,
        formData.categoryId || undefined,
        parseInt(formData.reminderDays),
        formData.notes || undefined
      );
      await loadData();
      setShowForm(false);
      setFormData({
        title: '',
        amount: '',
        dueDate: '',
        frequency: 'monthly',
        categoryId: '',
        reminderDays: '3',
        notes: '',
      });
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('Failed to create bill reminder');
    }
  };

  const handleMarkPaid = async (billId: string, isPaid: boolean) => {
    try {
      await billService.markAsPaid(billId, !isPaid);
      await loadData();
    } catch (error) {
      console.error('Error updating bill:', error);
    }
  };

  const handleDelete = async (billId: string) => {
    if (!confirm('Delete this bill reminder?')) return;
    try {
      await billService.deleteBill(billId);
      await loadData();
    } catch (error) {
      console.error('Error deleting bill:', error);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Calendar;
    return IconComponent;
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = due.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-white">Bill Reminders</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mb-6 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-500/50 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Bill Reminder
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">New Bill Reminder</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Bill Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Electric Bill, Rent, etc."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as BillFrequency })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="once">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Remind Me (Days Before)</label>
                <input
                  type="number"
                  value={formData.reminderDays}
                  onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                  min="0"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category (Optional)</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={2}
                placeholder="Additional details..."
              />
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
              className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Create Reminder
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No bill reminders yet
          </div>
        ) : (
          bills.map((bill) => {
            const Icon = getIcon(bill.category?.icon || 'Calendar');
            const daysUntil = getDaysUntilDue(bill.due_date);
            const isOverdue = daysUntil < 0 && !bill.is_paid;
            const isDueSoon = daysUntil <= bill.reminder_days && daysUntil >= 0 && !bill.is_paid;

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-xl border transition-all ${
                  bill.is_paid
                    ? 'bg-slate-900/30 border-slate-800 opacity-60'
                    : isOverdue
                    ? 'bg-red-500/10 border-red-500/50'
                    : isDueSoon
                    ? 'bg-amber-500/10 border-amber-500/50'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: bill.category?.color
                        ? `${bill.category.color}20`
                        : 'rgba(251, 146, 60, 0.2)',
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: bill.category?.color || '#F59E0B' }}
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-white font-medium">{bill.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="text-slate-400">
                        {new Date(bill.due_date).toLocaleDateString()}
                      </span>
                      {!bill.is_paid && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span
                            className={
                              isOverdue
                                ? 'text-red-400 font-semibold'
                                : isDueSoon
                                ? 'text-amber-400 font-semibold'
                                : 'text-slate-400'
                            }
                          >
                            {isOverdue
                              ? `${Math.abs(daysUntil)} days overdue`
                              : daysUntil === 0
                              ? 'Due today'
                              : `${daysUntil} days left`}
                          </span>
                        </>
                      )}
                      {bill.is_paid && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-400 font-semibold">Paid</span>
                        </>
                      )}
                    </div>
                    <div className="text-emerald-400 font-semibold mt-1">
                      ${Number(bill.amount).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMarkPaid(bill.id, bill.is_paid)}
                      className={`p-2 rounded-lg transition-colors ${
                        bill.is_paid
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400'
                      }`}
                      title={bill.is_paid ? 'Mark as unpaid' : 'Mark as paid'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bill.id)}
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
