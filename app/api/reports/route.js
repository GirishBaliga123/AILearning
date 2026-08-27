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

    // Monthly Trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      let m = month - i;
      let y = year;
      while (m <= 0) { m += 12; y--; }

      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: start, lte: end },
        },
      });

      let expenses = 0;
      let income = 0;
      transactions.forEach((t) => {
        const amt = parseFloat(t.amount);
        if (t.type === 'EXPENSE') expenses += amt;
        else income += amt;
      });

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthlyTrend.push({
        label: `${monthNames[m - 1]} ${y}`,
        month: m,
        year: y,
        expenses,
        income,
      });
    }

    // Daily Spending (current selected month)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(year, month, 0).getDate();

    const monthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
      include: { category: true },
    });

    const dailySpending = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      amount: 0,
    }));

    let totalExpenses = 0;
    let highestDay = { day: 0, amount: 0 };

    monthTransactions.forEach((t) => {
      const amt = parseFloat(t.amount);
      const day = new Date(t.date).getDate();
      dailySpending[day - 1].amount += amt;
      totalExpenses += amt;
    });

    dailySpending.forEach((d) => {
      if (d.amount > highestDay.amount) {
        highestDay = { day: d.day, amount: d.amount };
      }
    });

    // Category breakdown for pie chart
    const categoryMap = {};
    monthTransactions.forEach((t) => {
      const catId = t.categoryId;
      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          total: 0,
        };
      }
      categoryMap[catId].total += parseFloat(t.amount);
    });

    const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.total - a.total);

    // Month-over-month comparison
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStart = new Date(prevYear, prevMonth - 1, 1);
    const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

    const prevTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: prevStart, lte: prevEnd },
      },
    });

    const prevTotalExpenses = prevTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const monthChange = prevTotalExpenses > 0
      ? Math.round(((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100)
      : totalExpenses > 0 ? 100 : 0;

    const transactionCount = monthTransactions.length;
    const averagePerDay = daysInMonth > 0 ? totalExpenses / daysInMonth : 0;
    const averagePerTransaction = transactionCount > 0 ? totalExpenses / transactionCount : 0;

    return NextResponse.json({
      monthlyTrend,
      dailySpending,
      categoryBreakdown,
      summary: {
        totalExpenses,
        transactionCount,
        averagePerDay,
        averagePerTransaction,
        highestDay,
        monthChange,
        prevTotalExpenses,
      },
      month,
      year,
    });
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report data' },
      { status: 500 }
    );
  }
}
