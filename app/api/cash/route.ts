import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CashTransaction from '@/models/CashTransaction';
import { getSessionUser } from '@/lib/auth';

// GET: Fetch all cash transactions and compute current drawer balance
export async function GET(req: Request) {
  try {
    await connectDB();
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const transactions = await CashTransaction.find({ libraryId: user.libraryId })
      .sort({ paymentDate: -1, createdAt: -1 });

    // Calculate live drawer balance
    let totalInflow = 0;
    let totalOutflow = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'INFLOW') totalInflow += tx.amount;
      if (tx.type === 'OUTFLOW') totalOutflow += tx.amount;
    });

    const drawerBalance = totalInflow - totalOutflow;

    return NextResponse.json({
      success: true,
      data: {
        drawerBalance,
        totalInflow,
        totalOutflow,
        transactions,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Record a manual cash outflow (e.g. paying AC repair guy, expenses) or cash adjustment
export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const { type, category, amount, paymentDate, personName, remark } = await req.json();

    if (!amount || !remark) {
      return NextResponse.json({ success: false, error: 'Amount and remark are required.' }, { status: 400 });
    }

    const newTx = await CashTransaction.create({
      libraryId: user.libraryId,
      type: type || 'OUTFLOW', // Default to outflow for expenses
      category: category || 'Expense',
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      personName: personName || '',
      remark,
      recordedBy: user.name || 'Staff',
    });

    return NextResponse.json({
      success: true,
      message: 'Cash transaction recorded successfully!',
      data: newTx,
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}