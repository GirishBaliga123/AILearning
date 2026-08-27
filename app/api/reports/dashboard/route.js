import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || (now.getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || now.getFullYear().toString());

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const userId = session.user.id;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    let totalExpenses = 0;
    let totalIncome = 0;

    transactions.forEach((t) => {
      const amount = parseFloat(t.amount);
      if (t.type === 'EXPENSE') {
        totalExpenses += amount;
      } else {
        totalIncome += amount;
      }
    });

    const netBalance = totalIncome - totalExpenses;
    const transactionCount = transactions.length;

    const categorySpending = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const catId = t.categoryId;
        if (!categorySpending[catId]) {
          categorySpending[catId] = {
            categoryId: catId,
            name: t.category.name,
            icon: t.category.icon,
            color: t.category.color,
            total: 0,
          };
        }
        categorySpending[catId].total += parseFloat(t.amount);
      });

    const topCategories = Object.values(categorySpending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const recentTransactions = transactions.slice(0, 5).map((t) => ({
      id: t.id,
      description: t.description,
      amount: parseFloat(t.amount),
      type: t.type,
      date: t.date,
      category: t.category,
      isRecurring: t.isRecurring,
    }));

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    });

    const budgetWarnings = budgets
      .map((b) => {
        const spent = categorySpending[b.categoryId]?.total || 0;
        const limit = parseFloat(b.amountLimit);
        const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

        return {
          categoryId: b.categoryId,
          categoryName: b.category.name,
          categoryIcon: b.category.icon,
          spent,
          limit,
          percentage,
        };
      })
      .filter((b) => b.percentage >= 80)
      .sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({
      summary: {
        totalExpenses,
        totalIncome,
        netBalance,
        transactionCount,
      },
      topCategories,
      recentTransactions,
      budgetWarnings,
      month,
      year,
    });
  } catch (error) {
    console.error('GET /api/reports/dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
