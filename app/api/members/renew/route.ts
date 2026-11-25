import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import CashTransaction from '@/models/CashTransaction';
import { getMemberStatus } from '@/lib/memberStatus';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { memberId, planName, extensionMonths, totalFee, feesPaid, paymentDate, paymentMode, cashAmount, upiAmount, remark, membershipEndDate } = await req.json();

    const member = await Member.findById(memberId);
    if (!member) {
      return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });
    }

    const parsedTotalFee = Number(totalFee || 0);
    const parsedSubmittedFee = Number(feesPaid || 0);
    const parsedCashAmount = Number(cashAmount || 0);
    const parsedUpiAmount = Number(upiAmount || 0);

    let parsedFeesPaid = parsedSubmittedFee;

    if (paymentMode === 'Cash') {
      parsedFeesPaid = parsedCashAmount > 0 ? parsedCashAmount : parsedSubmittedFee;
    } else if (paymentMode === 'UPI') {
      parsedFeesPaid = parsedUpiAmount > 0 ? parsedUpiAmount : parsedSubmittedFee;
    } else if (paymentMode === 'Both (Cash & UPI)') {
      parsedFeesPaid = Number((parsedCashAmount + parsedUpiAmount).toFixed(2));

      if (parsedSubmittedFee > 0 && parsedFeesPaid === 0) {
        parsedFeesPaid = parsedSubmittedFee;
      }
    }

    parsedFeesPaid = Number(parsedFeesPaid.toFixed(2));

    if (!Number.isFinite(parsedFeesPaid) || parsedFeesPaid < 0 || parsedFeesPaid > parsedTotalFee) {
      return NextResponse.json({
        success: false,
        error: `Invalid renewal payment amount. Expected between ₹0 and ₹${parsedTotalFee}.`,
      }, { status: 400 });
    }

    const baseDate = membershipEndDate ? new Date(membershipEndDate) : (new Date(member.expiryDate) > new Date() ? new Date(member.expiryDate) : new Date());
    const newExpiryDate = new Date(baseDate);

    if (!membershipEndDate) {
      newExpiryDate.setMonth(newExpiryDate.getMonth() + Number(extensionMonths || 1));
    }

    // Update member record
    member.planName = planName || member.planName;
    member.expiryDate = newExpiryDate;
    member.status = getMemberStatus(newExpiryDate);
    member.totalFee += parsedTotalFee;
    member.feesPaid += parsedFeesPaid;
    member.dueAmount += Math.max(0, parsedTotalFee - parsedFeesPaid);

    // Push to payment history only when a payment was actually collected.
    const transactionDate = paymentDate ? new Date(paymentDate) : new Date();
    if (parsedFeesPaid > 0) {
      member.paymentHistory.push({
        amount: parsedFeesPaid,
        date: transactionDate,
        paymentDate: transactionDate,
        mode: paymentMode,
        cashAmount: parsedCashAmount,
        upiAmount: parsedUpiAmount,
        remark: remark || `Membership renewed for ${extensionMonths || 1} month(s)`
      });
    }

    await member.save();

    // If cash was collected, log it to the Cash Drawer module automatically!
    const cashCollected = paymentMode === 'Cash' ? parsedFeesPaid : (paymentMode === 'Both (Cash & UPI)' ? parsedCashAmount : 0);
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