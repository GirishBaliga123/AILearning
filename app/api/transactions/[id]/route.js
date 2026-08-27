import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
      include: { category: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transaction: { ...transaction, amount: parseFloat(transaction.amount) },
    });
  } catch (error) {
    console.error('GET /api/transactions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, description, categoryId, date, type } = body;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

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

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        description: description.trim(),
        date: new Date(date),
        type,
      },
      include: { category: true },
    });

    return NextResponse.json({
      message: 'Transaction updated successfully',
      transaction: { ...transaction, amount: parseFloat(transaction.amount) },
    });
  } catch (error) {
    console.error('PUT /api/transactions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/transactions/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
