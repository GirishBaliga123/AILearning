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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    const where = {
      userId: session.user.id,
    };

    if (search) {
      where.description = { contains: search };
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (type && (type === 'EXPENSE' || type === 'INCOME')) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        ...t,
        amount: parseFloat(t.amount),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description, categoryId, date, type } = body;

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

    if (!date) {
      errors.date = 'Date is required';
    }

    if (!type || !['EXPENSE', 'INCOME'].includes(type)) {
      errors.type = 'Type must be EXPENSE or INCOME';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        description: description.trim(),
        date: new Date(date),
        type,
      },
      include: { category: true },
    });

    return NextResponse.json(
      { message: 'Transaction created successfully', transaction: { ...transaction, amount: parseFloat(transaction.amount) } },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
