import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';
import CashTransaction from '@/models/CashTransaction';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { memberId, paymentAmount, paymentDate, paymentMode, cashAmount, upiAmount, remark } = await req.json();

        const member = await Member.findById(memberId);
        if (!member) {
            return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });
        }

        const amountToAdd = Number(paymentAmount);
        if (amountToAdd > member.dueAmount) {
            return NextResponse.json({ success: false, error: `Payment amount cannot exceed due balance of ₹${member.dueAmount}.` }, { status: 400 });
        }

        // Update financial trackers
        member.feesPaid += amountToAdd;
        member.dueAmount -= amountToAdd;

        // Push new installment record with its own payment date
        const paymentDateValue = paymentDate ? new Date(paymentDate) : new Date();

        member.paymentHistory.push({
            amount: amountToAdd,
            date: paymentDateValue,
            paymentDate: paymentDateValue,
            mode: paymentMode || 'Cash',
            cashAmount: Number(cashAmount || 0),
            upiAmount: Number(upiAmount || 0),
            remark: remark || 'Due balance installment payment'
        });

        await member.save();

        // If cash was involved in the registration payment, log it to the cash drawer
        const cashCollected = paymentMode === 'Cash' ? Number(cashAmount) : (paymentMode === 'Both (Cash & UPI)' ? Number(cashAmount || 0) : 0);

        if (cashCollected > 0) {
            await CashTransaction.create({
                libraryId: member.libraryId,
                type: 'INFLOW',
                category: 'Student Fee (Cash)',
                amount: cashCollected,
                paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
                memberName: member._id,
                personName: member.name,
                remark: `Due balance installment payment (Cash portion) for Seat #${member.seatNumber}`,
                recordedBy: 'Staff',
            });
        }

        return NextResponse.json({
            success: true,
            message: `Recorded payment of ₹${amountToAdd} successfully.`,
            data: member
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}