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

    const userId = session.user.id;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
    });

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
    });

    const budgetMap = {};
    budgets.forEach((b) => {
      budgetMap[b.categoryId] = parseFloat(b.amountLimit);
    });

    const spendingMap = {};
    transactions.forEach((t) => {
      if (!spendingMap[t.categoryId]) {
        spendingMap[t.categoryId] = 0;
      }
      spendingMap[t.categoryId] += parseFloat(t.amount);
    });

    const totalExpenses = Object.values(spendingMap).reduce((sum, v) => sum + v, 0);

    const categoryBreakdown = categories.map((cat) => {
      const spent = spendingMap[cat.id] || 0;
      const limit = budgetMap[cat.id] || 0;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      const shareOfTotal = totalExpenses > 0 ? Math.round((spent / totalExpenses) * 100) : 0;

      return {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        spent,
        limit,
        percentage,
        remaining: limit > 0 ? Math.max(limit - spent, 0) : 0,
        shareOfTotal,
      };
    });

    const chartData = categoryBreakdown
      .filter((c) => c.spent > 0)
      .sort((a, b) => b.spent - a.spent);

    return NextResponse.json({
      categoryBreakdown,
      chartData,
      totalExpenses,
      month,
      year,
    });
  } catch (error) {
    console.error('GET /api/reports/categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category data' },
      { status: 500 }
    );
  }
}
