
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Member from '@/models/Member';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Next.js 15+ / 16: unwrap params
    const { id } = await params;

    const body = await req.json();

    const {
      name,
      aadhaarId,
      mobile,
      planName,
      seatNumber,
      startDate,
      expiryDate,
      status,
      totalFee,
      feesPaid,
      dueAmount,
      discount,
      paymentMode,
      remark,
    } = body;

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      {
        name,
        aadhaarId: aadhaarId
          ? `****-****-${aadhaarId.slice(-4)}`
          : undefined,
        mobile,
        planName,
        seatNumber,
        startDate: startDate ? new Date(startDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        status,
        totalFee,
        feesPaid,
        dueAmount,
        discount,
        paymentMode,
        remark,
      },
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, error: 'Member not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Booking successfully updated!',
        data: updatedMember,
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
  
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }>  }) {
  try {
    await connectDB();
    const { id } = await params;

    const deletedMember = await Member.findByIdAndDelete(id);

    if (!deletedMember) {
      return NextResponse.json({ success: false, error: 'Member not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Member successfully removed and seat released!',
      data: deletedMember,
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}