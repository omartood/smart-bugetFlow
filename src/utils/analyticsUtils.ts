import { Transaction, Category, SpendingInsight, BudgetSummary } from '../types';

export const analyticsUtils = {
  getSpendingByCategory(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Uncategorized';
      acc[categoryName] = (acc[categoryName] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
  },

  getSpendingByType(transactions: Transaction[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const type = transaction.category?.type || 'needs';
      acc[type] = (acc[type] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);
  },

  getTrendData(
    transactions: Transaction[],
    days: number = 30
  ): { date: string; amount: number }[] {
    const today = new Date();
    const dateMap: Record<string, number> = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = 0;
    }

    transactions.forEach((transaction) => {
      const dateStr = transaction.transaction_date;
      if (dateMap.hasOwnProperty(dateStr)) {
        dateMap[dateStr] += Number(transaction.amount);
      }
    });

    return Object.entries(dateMap).map(([date, amount]) => ({
      date,
      amount,
    }));
  },

  getTopCategories(transactions: Transaction[], limit: number = 5): { name: string; amount: number; color: string }[] {
    const categoryMap = transactions.reduce((acc, transaction) => {
      const name = transaction.category?.name || 'Uncategorized';
      const color = transaction.category?.color || '#6B7280';
      if (!acc[name]) {
        acc[name] = { name, amount: 0, color };
      }
      acc[name].amount += Number(transaction.amount);
      return acc;
    }, {} as Record<string, { name: string; amount: number; color: string }>);

    return Object.values(categoryMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  },

  getSpendingInsights(
    budgetSummary: BudgetSummary,
    transactions: Transaction[]
  ): SpendingInsight[] {
    const insights: SpendingInsight[] = [];

    if (budgetSummary.needs.spent > budgetSummary.needs.budget) {
      insights.push({
        type: 'warning',
        title: 'Over Budget on Needs',
        message: `You've exceeded your needs budget by $${(budgetSummary.needs.spent - budgetSummary.needs.budget).toFixed(2)}`,
        icon: 'AlertTriangle',
      });
    }

    if (budgetSummary.wants.spent > budgetSummary.wants.budget) {
      insights.push({
        type: 'warning',
        title: 'Over Budget on Wants',
        message: `You've exceeded your wants budget by $${(budgetSummary.wants.spent - budgetSummary.wants.budget).toFixed(2)}`,
        icon: 'AlertTriangle',
      });
    }

    const needsPercentage = (budgetSummary.needs.spent / budgetSummary.needs.budget) * 100;
    if (needsPercentage < 50 && budgetSummary.needs.budget > 0) {
      insights.push({
        type: 'success',
        title: 'Great Job on Essentials!',
        message: `You're only using ${needsPercentage.toFixed(1)}% of your needs budget`,
        icon: 'TrendingDown',
      });
    }

    if (budgetSummary.savings.spent >= budgetSummary.savings.budget * 0.9) {
      insights.push({
        type: 'success',
        title: 'Savings Goal Nearly Met!',
        message: `You're at ${((budgetSummary.savings.spent / budgetSummary.savings.budget) * 100).toFixed(1)}% of your savings goal`,
        icon: 'Target',
      });
    }

    const topCategory = analyticsUtils.getTopCategories(transactions, 1)[0];
    if (topCategory && topCategory.amount > budgetSummary.total.budget * 0.25) {
      insights.push({
        type: 'info',
        title: 'Top Spending Category',
        message: `${topCategory.name} accounts for ${((topCategory.amount / budgetSummary.total.spent) * 100).toFixed(1)}% of your spending`,
        icon: 'Info',
      });
    }

    const remainingPercentage = (budgetSummary.total.remaining / budgetSummary.total.budget) * 100;
    if (remainingPercentage < 10 && remainingPercentage > 0) {
      insights.push({
        type: 'warning',
        title: 'Low Budget Remaining',
        message: `Only ${remainingPercentage.toFixed(1)}% of your monthly budget remains`,
        icon: 'AlertCircle',
      });
    }

    return insights;
  },

  getMonthlyComparison(
    currentMonth: BudgetSummary,
    previousMonth: BudgetSummary | null
  ): { type: string; change: number; percentage: number }[] {
    if (!previousMonth) return [];

    const comparisons = [
      {
        type: 'Needs',
        current: currentMonth.needs.spent,
        previous: previousMonth.needs.spent,
      },
      {
        type: 'Wants',
        current: currentMonth.wants.spent,
        previous: previousMonth.wants.spent,
      },
      {
        type: 'Savings',
        current: currentMonth.savings.spent,
        previous: previousMonth.savings.spent,
      },
    ];

    return comparisons.map((comp) => {
      const change = comp.current - comp.previous;
      const percentage = comp.previous > 0 ? (change / comp.previous) * 100 : 0;
      return {
        type: comp.type,
        change,
        percentage,
      };
    });
  },
};
