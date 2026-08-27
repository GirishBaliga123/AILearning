import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.recurringExpense.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Recurring expense not found' }, { status: 404 });
    }

    if (body.toggleActive !== undefined) {
      const updated = await prisma.recurringExpense.update({
        where: { id },
        data: { isActive: !existing.isActive },
        include: { category: true },
      });

      return NextResponse.json({
        message: updated.isActive ? 'Recurring expense activated' : 'Recurring expense paused',
        recurring: { ...updated, amount: parseFloat(updated.amount) },
      });
    }

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

    const updated = await prisma.recurringExpense.update({
      where: { id },
      data: {
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        description: description.trim(),
        dayOfMonth: parseInt(dayOfMonth),
      },
      include: { category: true },
    });

    return NextResponse.json({
      message: 'Recurring expense updated',
      recurring: { ...updated, amount: parseFloat(updated.amount) },
    });
  } catch (error) {
    console.error('PUT /api/recurring/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update recurring expense' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.recurringExpense.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Recurring expense not found' }, { status: 404 });
    }

    await prisma.recurringExpense.delete({ where: { id } });

    return NextResponse.json({ message: 'Recurring expense deleted' });
  } catch (error) {
    console.error('DELETE /api/recurring/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete recurring expense' }, { status: 500 });
  }
}
