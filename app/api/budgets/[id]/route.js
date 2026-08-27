import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const budget = await prisma.budget.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
    }

    await prisma.budget.delete({ where: { id } });

    return NextResponse.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/budgets/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 });
  }
}
