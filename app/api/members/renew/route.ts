import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import CashTransaction from '@/models/CashTransaction';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { memberId, planName, extensionMonths, totalFee, feesPaid, paymentDate, paymentMode, cashAmount, upiAmount, remark } = await req.json();

    const member = await Member.findById(memberId);
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });
    }

    // Calculate new expiry date (extend from current expiry date if active, or from today if expired)
    const baseDate = new Date(member.expiryDate) > new Date() ? new Date(member.expiryDate) : new Date();
    const newExpiryDate = new Date(baseDate);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + Number(extensionMonths || 1));

    // Update member record
    member.planName = planName || member.planName;
    member.expiryDate = newExpiryDate;
    member.status = 'Active';
    member.totalFee += Number(totalFee);
    member.feesPaid += Number(feesPaid);
    member.dueAmount += (Number(totalFee) - Number(feesPaid));

    // Push to payment history log
    const transactionDate = paymentDate ? new Date(paymentDate) : new Date();
    member.paymentHistory.push({
      amount: Number(feesPaid),
      paymentDate: transactionDate,
      mode: paymentMode,
      cashAmount: Number(cashAmount || 0),
      upiAmount: Number(upiAmount || 0),
      remark: remark || `Membership renewed for ${extensionMonths} month(s)`
    });

    await member.save();

    // If cash was collected, log it to the Cash Drawer module automatically!
    const cashCollected = paymentMode === 'Cash' ? Number(feesPaid) : (paymentMode === 'Both (Cash & UPI)' ? Number(cashAmount || 0) : 0);
    if (cashCollected > 0) {
      await CashTransaction.create({
        libraryId: member.libraryId,
        type: 'INFLOW',
        category: 'Student Fee (Cash)',
        amount: cashCollected,
        paymentDate: transactionDate,
        memberName: member._id,
        personName: member.name,
        remark: `Renewal fee (Cash portion) for Seat #${member.seatNumber}`,
        recordedBy: 'Staff',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Membership renewed successfully!',
      data: member,
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}