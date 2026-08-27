import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: { userId, isActive: true },
    });

    if (recurringExpenses.length === 0) {
      return NextResponse.json({ message: 'No active recurring expenses', created: 0 });
    }

    let created = 0;

    for (const rec of recurringExpenses) {
      const transactionDate = new Date(currentYear, currentMonth - 1, rec.dayOfMonth);

      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

      const existing = await prisma.transaction.findFirst({
        where: {
          userId,
          categoryId: rec.categoryId,
          amount: rec.amount,
          description: rec.description,
          isRecurring: true,
          date: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      if (!existing) {
        await prisma.transaction.create({
          data: {
            userId,
            categoryId: rec.categoryId,
            amount: rec.amount,
            description: rec.description,
            date: transactionDate,
            type: 'EXPENSE',
            isRecurring: true,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      message: `Processed recurring expenses. ${created} new transaction(s) created.`,
      created,
    });
  } catch (error) {
    console.error('POST /api/recurring/process error:', error);
    return NextResponse.json({ error: 'Failed to process recurring expenses' }, { status: 500 });
  }
}
