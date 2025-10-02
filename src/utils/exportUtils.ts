import { Transaction, Budget, BudgetSummary } from '../types';

export const exportUtils = {
  exportToCSV(transactions: Transaction[], budget: Budget): string {
    const headers = [
      'Date',
      'Description',
      'Category',
      'Type',
      'Amount',
      'Created At'
    ];

    const rows = transactions.map((t) => [
      t.transaction_date,
      `"${t.description}"`,
      `"${t.category?.name || 'Uncategorized'}"`,
      t.category?.type || 'needs',
      t.amount.toString(),
      new Date(t.created_at).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  },

  downloadCSV(transactions: Transaction[], budget: Budget, filename?: string): void {
    const csvContent = exportUtils.exportToCSV(transactions, budget);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename || `budget-${budget.month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportBudgetSummaryToCSV(budgetSummary: BudgetSummary, month: string): string {
    const headers = ['Category', 'Budget', 'Spent', 'Remaining', 'Percentage'];

    const rows = [
      [
        'Needs',
        budgetSummary.needs.budget.toString(),
        budgetSummary.needs.spent.toString(),
        budgetSummary.needs.remaining.toString(),
        budgetSummary.needs.percentage.toString() + '%'
      ],
      [
        'Wants',
        budgetSummary.wants.budget.toString(),
        budgetSummary.wants.spent.toString(),
        budgetSummary.wants.remaining.toString(),
        budgetSummary.wants.percentage.toString() + '%'
      ],
      [
        'Savings',
        budgetSummary.savings.budget.toString(),
        budgetSummary.savings.spent.toString(),
        budgetSummary.savings.remaining.toString(),
        budgetSummary.savings.percentage.toString() + '%'
      ],
      [
        'Total',
        budgetSummary.total.budget.toString(),
        budgetSummary.total.spent.toString(),
        budgetSummary.total.remaining.toString(),
        ''
      ],
    ];

    const csvContent = [
      `Budget Summary for ${month}`,
      '',
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csvContent;
  },

  downloadBudgetSummary(budgetSummary: BudgetSummary, month: string): void {
    const csvContent = exportUtils.exportBudgetSummaryToCSV(budgetSummary, month);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `budget-summary-${month}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  formatMonth(monthStr: string): string {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  },
};
