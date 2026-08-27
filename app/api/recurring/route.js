import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const recurring = await prisma.recurringExpense.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      recurring: recurring.map((r) => ({
        ...r,
        amount: parseFloat(r.amount),
      })),
    });
  } catch (error) {
    console.error('GET /api/recurring error:', error);
    return NextResponse.json({ error: 'Failed to fetch recurring expenses' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description, categoryId, dayOfMonth } = body;

    const errors = {};

    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!description || description.trim().length === 0) {
      errors.description = 'Description is required';
    }

    if (!categoryId) {
      errors.categoryId = 'Category is required';
    }

    if (!dayOfMonth || parseInt(dayOfMonth) < 1 || parseInt(dayOfMonth) > 28) {
      errors.dayOfMonth = 'Day must be between 1 and 28';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const recurring = await prisma.recurringExpense.create({
      data: {
        userId: session.user.id,
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        description: description.trim(),
        dayOfMonth: parseInt(dayOfMonth),
      },
      include: { category: true },
    });

    return NextResponse.json(
      { message: 'Recurring expense created', recurring: { ...recurring, amount: parseFloat(recurring.amount) } },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/recurring error:', error);
    return NextResponse.json({ error: 'Failed to create recurring expense' }, { status: 500 });
  }
}
