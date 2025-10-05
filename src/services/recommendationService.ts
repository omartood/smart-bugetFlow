import { supabase } from '../lib/supabase';
import { Transaction, Budget, Category } from '../types';

export interface Recommendation {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  category: string;
  title: string;
  message: string;
  actionable: boolean;
  priority: number;
  createdAt: Date;
}

export interface SpendingInsight {
  averageDaily: number;
  averageWeekly: number;
  averageMonthly: number;
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
  trends: {
    increasing: string[];
    decreasing: string[];
    stable: string[];
  };
  comparison: {
    vsLastMonth: number;
    vsAverage: number;
  };
}

class RecommendationService {
  async generateRecommendations(
    userId: string,
    budget: Budget,
    transactions: Transaction[],
    categories: Category[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const insights = await this.analyzeSpending(transactions, categories);

    recommendations.push(...this.checkBudgetHealth(budget, transactions, categories));
    recommendations.push(...this.analyzeCategorySpending(transactions, categories, budget));
    recommendations.push(...this.detectUnusualSpending(transactions, insights));
    recommendations.push(...this.suggestSavingsOpportunities(transactions, categories, budget));
    recommendations.push(...this.checkGoalProgress(userId, budget));

    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  private async analyzeSpending(
    transactions: Transaction[],
    categories: Category[]
  ): Promise<SpendingInsight> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const last30Days = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
    const previous30Days = transactions.filter(
      t => new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo
    );

    const totalLast30 = last30Days.reduce((sum, t) => sum + t.amount, 0);
    const totalPrevious30 = previous30Days.reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals = categories.map(cat => {
      const catTransactions = last30Days.filter(t => t.categoryId === cat.id);
      const amount = catTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        name: cat.name,
        amount,
        percentage: totalLast30 > 0 ? (amount / totalLast30) * 100 : 0
      };
    }).sort((a, b) => b.amount - a.amount);

    const vsLastMonth = totalPrevious30 > 0
      ? ((totalLast30 - totalPrevious30) / totalPrevious30) * 100
      : 0;

    return {
      averageDaily: totalLast30 / 30,
      averageWeekly: totalLast30 / 4.3,
      averageMonthly: totalLast30,
      topCategories: categoryTotals.slice(0, 5),
      trends: this.calculateTrends(last30Days, previous30Days, categories),
      comparison: {
        vsLastMonth,
        vsAverage: 0
      }
    };
  }

  private calculateTrends(
    recent: Transaction[],
    previous: Transaction[],
    categories: Category[]
  ) {
    const trends = { increasing: [] as string[], decreasing: [] as string[], stable: [] as string[] };

    categories.forEach(cat => {
      const recentTotal = recent
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const previousTotal = previous
        .filter(t => t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);

      if (previousTotal === 0) return;

      const change = ((recentTotal - previousTotal) / previousTotal) * 100;

      if (change > 15) trends.increasing.push(cat.name);
      else if (change < -15) trends.decreasing.push(cat.name);
      else trends.stable.push(cat.name);
    });

    return trends;
  }

  private checkBudgetHealth(
    budget: Budget,
    transactions: Transaction[],
    categories: Category[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalBudget = budget.needs + budget.wants + budget.savings;
    const percentageUsed = (totalSpent / totalBudget) * 100;

    if (percentageUsed > 90) {
      recommendations.push({
        id: `budget-warning-${Date.now()}`,
        type: 'warning',
        category: 'Budget',
        title: 'Budget Alert',
        message: `You've used ${percentageUsed.toFixed(1)}% of your monthly budget. Consider reducing discretionary spending.`,
        actionable: true,
        priority: 10,
        createdAt: new Date()
      });
    } else if (percentageUsed < 70) {
      recommendations.push({
        id: `budget-success-${Date.now()}`,
        type: 'success',
        category: 'Budget',
        title: 'Great Job!',
        message: `You're doing well! Only ${percentageUsed.toFixed(1)}% of your budget used. Consider increasing savings this month.`,
        actionable: true,
        priority: 5,
        createdAt: new Date()
      });
    }

    const needsSpent = this.getCategoryTypeTotal(transactions, categories, 'needs');
    const wantsSpent = this.getCategoryTypeTotal(transactions, categories, 'wants');

    if (needsSpent > budget.needs) {
      recommendations.push({
        id: `needs-overspent-${Date.now()}`,
        type: 'warning',
        category: 'Needs',
        title: 'Needs Budget Exceeded',
        message: `You've exceeded your needs budget by $${(needsSpent - budget.needs).toFixed(2)}. Review essential expenses.`,
        actionable: true,
        priority: 9,
        createdAt: new Date()
      });
    }

    if (wantsSpent > budget.wants) {
      recommendations.push({
        id: `wants-overspent-${Date.now()}`,
        type: 'warning',
        category: 'Wants',
        title: 'Wants Budget Exceeded',
        message: `You've exceeded your wants budget by $${(wantsSpent - budget.wants).toFixed(2)}. Consider cutting back on discretionary spending.`,
        actionable: true,
        priority: 8,
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private analyzeCategorySpending(
    transactions: Transaction[],
    categories: Category[],
    budget: Budget
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const categorySpending = new Map<string, number>();

    transactions.forEach(t => {
      const current = categorySpending.get(t.categoryId) || 0;
      categorySpending.set(t.categoryId, current + t.amount);
    });

    categories.forEach(cat => {
      const spent = categorySpending.get(cat.id) || 0;
      const budgetLimit = cat.type === 'needs' ? budget.needs :
                         cat.type === 'wants' ? budget.wants : budget.savings;

      const categoryTransactions = transactions.filter(t => t.categoryId === cat.id);
      const avgPerTransaction = categoryTransactions.length > 0
        ? spent / categoryTransactions.length
        : 0;

      if (spent > budgetLimit * 0.3) {
        recommendations.push({
          id: `category-high-${cat.id}-${Date.now()}`,
          type: 'info',
          category: cat.name,
          title: `High ${cat.name} Spending`,
          message: `${cat.name} represents a large portion of your ${cat.type} budget ($${spent.toFixed(2)}). Look for ways to optimize.`,
          actionable: true,
          priority: 6,
          createdAt: new Date()
        });
      }

      if (categoryTransactions.length > 20) {
        recommendations.push({
          id: `category-frequent-${cat.id}-${Date.now()}`,
          type: 'tip',
          category: cat.name,
          title: `Frequent ${cat.name} Purchases`,
          message: `You've made ${categoryTransactions.length} ${cat.name} transactions (avg $${avgPerTransaction.toFixed(2)}). Consider bulk buying or subscription services.`,
          actionable: true,
          priority: 4,
          createdAt: new Date()
        });
      }
    });

    return recommendations;
  }

  private detectUnusualSpending(
    transactions: Transaction[],
    insights: SpendingInsight
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (Math.abs(insights.comparison.vsLastMonth) > 30) {
      const direction = insights.comparison.vsLastMonth > 0 ? 'increased' : 'decreased';
      const change = Math.abs(insights.comparison.vsLastMonth).toFixed(1);

      recommendations.push({
        id: `spending-change-${Date.now()}`,
        type: insights.comparison.vsLastMonth > 0 ? 'warning' : 'success',
        category: 'Spending Pattern',
        title: 'Significant Spending Change',
        message: `Your spending has ${direction} by ${change}% compared to last month. ${
          insights.comparison.vsLastMonth > 0
            ? 'Review recent purchases to identify the cause.'
            : 'Great job reducing expenses!'
        }`,
        actionable: true,
        priority: 7,
        createdAt: new Date()
      });
    }

    if (insights.trends.increasing.length > 0) {
      recommendations.push({
        id: `trend-increasing-${Date.now()}`,
        type: 'info',
        category: 'Trends',
        title: 'Rising Expenses Detected',
        message: `Spending is increasing in: ${insights.trends.increasing.join(', ')}. Monitor these categories closely.`,
        actionable: true,
        priority: 6,
        createdAt: new Date()
      });
    }

    if (insights.trends.decreasing.length > 0) {
      recommendations.push({
        id: `trend-decreasing-${Date.now()}`,
        type: 'success',
        category: 'Trends',
        title: 'Expenses Decreasing',
        message: `Great work! Spending is down in: ${insights.trends.decreasing.join(', ')}.`,
        actionable: false,
        priority: 3,
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private suggestSavingsOpportunities(
    transactions: Transaction[],
    categories: Category[],
    budget: Budget
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const wantsSpent = this.getCategoryTypeTotal(transactions, categories, 'wants');
    const potentialSavings = budget.wants - wantsSpent;

    if (potentialSavings > 0) {
      recommendations.push({
        id: `savings-opportunity-${Date.now()}`,
        type: 'tip',
        category: 'Savings',
        title: 'Savings Opportunity',
        message: `You have $${potentialSavings.toFixed(2)} remaining in your wants budget. Consider moving it to savings!`,
        actionable: true,
        priority: 5,
        createdAt: new Date()
      });
    }

    const subscriptionCategories = categories.filter(c =>
      c.name.toLowerCase().includes('subscription') ||
      c.name.toLowerCase().includes('streaming')
    );

    if (subscriptionCategories.length > 0) {
      const subscriptionTotal = subscriptionCategories.reduce((sum, cat) => {
        return sum + transactions
          .filter(t => t.categoryId === cat.id)
          .reduce((s, t) => s + t.amount, 0);
      }, 0);

      if (subscriptionTotal > 100) {
        recommendations.push({
          id: `subscription-review-${Date.now()}`,
          type: 'tip',
          category: 'Subscriptions',
          title: 'Review Subscriptions',
          message: `You're spending $${subscriptionTotal.toFixed(2)} on subscriptions. Cancel unused services to save money.`,
          actionable: true,
          priority: 7,
          createdAt: new Date()
        });
      }
    }

    return recommendations;
  }

  private async checkGoalProgress(userId: string, budget: Budget): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    try {
      const { data: goals } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', false);

      if (!goals || goals.length === 0) {
        recommendations.push({
          id: `no-goals-${Date.now()}`,
          type: 'tip',
          category: 'Goals',
          title: 'Set Savings Goals',
          message: 'Create savings goals to stay motivated and track your financial progress.',
          actionable: true,
          priority: 4,
          createdAt: new Date()
        });
      } else {
        goals.forEach(goal => {
          const progress = (goal.current_amount / goal.target_amount) * 100;

          if (progress > 80) {
            recommendations.push({
              id: `goal-almost-${goal.id}`,
              type: 'success',
              category: 'Goals',
              title: 'Goal Almost Reached!',
              message: `You're ${progress.toFixed(0)}% towards "${goal.name}". Just $${(goal.target_amount - goal.current_amount).toFixed(2)} to go!`,
              actionable: false,
              priority: 8,
              createdAt: new Date()
            });
          }

          if (goal.target_date) {
            const daysLeft = Math.ceil(
              (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            const remaining = goal.target_amount - goal.current_amount;
            const neededPerMonth = daysLeft > 0 ? (remaining / (daysLeft / 30)) : 0;

            if (daysLeft > 0 && daysLeft < 30 && remaining > budget.savings) {
              recommendations.push({
                id: `goal-deadline-${goal.id}`,
                type: 'warning',
                category: 'Goals',
                title: 'Goal Deadline Approaching',
                message: `"${goal.name}" is due in ${daysLeft} days. You need to save $${neededPerMonth.toFixed(2)}/month to reach it.`,
                actionable: true,
                priority: 9,
                createdAt: new Date()
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Error checking goals:', error);
    }

    return recommendations;
  }

  private getCategoryTypeTotal(
    transactions: Transaction[],
    categories: Category[],
    type: 'needs' | 'wants' | 'savings'
  ): number {
    const categoryIds = categories.filter(c => c.type === type).map(c => c.id);
    return transactions
      .filter(t => categoryIds.includes(t.categoryId))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  async getSpendingInsights(
    transactions: Transaction[],
    categories: Category[]
  ): Promise<SpendingInsight> {
    return this.analyzeSpending(transactions, categories);
  }
}

export const recommendationService = new RecommendationService();
