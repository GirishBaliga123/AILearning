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

    const budgets = await prisma.budget.findMany({
      where: { userId: session.user.id, month, year },
      include: { category: true },
      orderBy: { category: { name: 'asc' } },
    });

    return NextResponse.json({
      budgets: budgets.map((b) => ({
        ...b,
        amountLimit: parseFloat(b.amountLimit),
      })),
      month,
      year,
    });
  } catch (error) {
    console.error('GET /api/budgets error:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { categoryId, amountLimit, month, year } = body;

    const errors = {};

    if (!categoryId) {
      errors.categoryId = 'Category is required';
    }

    if (!amountLimit || parseFloat(amountLimit) <= 0) {
      errors.amountLimit = 'Budget limit must be greater than 0';
    }

    if (!month || month < 1 || month > 12) {
      errors.month = 'Invalid month';
    }

    if (!year || year < 2020) {
      errors.year = 'Invalid year';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.user.id,
          categoryId: parseInt(categoryId),
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      update: {
        amountLimit: parseFloat(amountLimit),
      },
      create: {
        userId: session.user.id,
        categoryId: parseInt(categoryId),
        amountLimit: parseFloat(amountLimit),
        month: parseInt(month),
        year: parseInt(year),
      },
      include: { category: true },
    });

    return NextResponse.json(
      { message: 'Budget saved successfully', budget: { ...budget, amountLimit: parseFloat(budget.amountLimit) } },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/budgets error:', error);
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 });
  }
}
