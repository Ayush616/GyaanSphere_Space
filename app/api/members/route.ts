import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import CashTransaction from '@/models/CashTransaction';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      libraryId,
      name,
      aadhaarId,
      mobile,
      email,
      planName,
      seatNumber,
      startDate,
      expiryDate,
      totalFee,
      feesPaid,
      dueAmount,
      discount = 0,
      paymentMode,
      cashAmount = 0,
      upiAmount = 0,
      paymentDate,
      remark = ''
    } = body;

    // Check seat occupancy
    const existingOccupant = await Member.findOne({ libraryId, seatNumber, status: 'Active' });
    if (existingOccupant) {
      return NextResponse.json({
        success: false,
        error: `Seat #${seatNumber} is already occupied by ${existingOccupant.name}.`
      }, { status: 400 });
    }

    const newMember = await Member.create({
      libraryId,
      name,
      aadhaarId: aadhaarId ? `[Aadhaar Redacted]` : '[Aadhaar Redacted]',
      mobile,
      email,
      planName,
      seatNumber,
      startDate: new Date(startDate),
      expiryDate: new Date(expiryDate),
      status: 'Active',
      totalFee: Number(totalFee),
      feesPaid: Number(feesPaid),
      dueAmount: Number(dueAmount),
      discount: Number(discount),
      paymentMode: paymentMode,
      paymentHistory: [
        {
          amount: Number(feesPaid),
          date: paymentDate ? new Date(paymentDate) : new Date(),
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          mode: paymentMode,
          cashAmount: Number(cashAmount),
          upiAmount: Number(upiAmount),
          remark: remark || 'Initial registration payment'
        }
      ]
    });


    // If cash was involved in the registration payment, log it to the cash drawer
    const cashCollected = body.paymentMode === 'Cash' ? Number(body.feesPaid) : (body.paymentMode === 'Both (Cash & UPI)' ? Number(body.cashAmount || 0) : 0);

    if (cashCollected > 0) {
      await CashTransaction.create({
        libraryId,
        type: 'INFLOW',
        category: 'Student Fee (Cash)',
        amount: cashCollected,
        paymentDate: body.paymentDate ? new Date(body.paymentDate) : new Date(),
        memberName: newMember._id,
        personName: body.name,
        remark: `Registration fee (Cash portion) for Seat #${body.seatNumber}`,
        recordedBy: 'Staff',
      });
    }
    return NextResponse.json({
      success: true,
      message: 'Member registered successfully with payment record!',
      data: newMember
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}