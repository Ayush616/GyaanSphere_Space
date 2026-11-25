import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Library from '@/models/Library';
import Member from '@/models/Member';
import { getSessionUser } from '@/lib/auth';
import { getMemberStatus } from '@/lib/memberStatus';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    // 🔐 Extract libraryId securely from session cookie
    const user = await getSessionUser();
    if (!user || !user.libraryId) {
      return NextResponse.json({ success: false, error: 'Unauthorized session.' }, { status: 401 });
    }

    const libraryId = user.libraryId;

    // Fetch library details
    const library = await Library.findById(libraryId);
    if (!library) {
      return NextResponse.json({ success: false, error: 'Library branch not found.' }, { status: 404 });
    }

    // Fetch all members for this library branch
    const members = await Member.find({ libraryId }).sort({ startDate: -1 });

    const getPaidTotal = (member: any) => {
      const historyTotal = Array.isArray(member?.paymentHistory)
        ? member.paymentHistory.reduce((sum: number, entry: any) => sum + Number(entry?.amount || 0), 0)
        : 0;

      return historyTotal > 0 ? historyTotal : Number(member?.feesPaid || 0);
    };

    // Derive status from expiry date instead of trusting a stale stored status.
    const membersWithLiveStatus = members.map((member) => {
      const status = getMemberStatus(member.expiryDate);
      return { ...member.toObject(), status };
    });

    // Calculate dynamic analytics
    const totalMembers = membersWithLiveStatus.length;
    const activeMembers = membersWithLiveStatus.filter(m => m.status === 'Active').length;
    const totalRevenue = membersWithLiveStatus.reduce((acc, curr) => acc + getPaidTotal(curr), 0);
    const totalDue = membersWithLiveStatus.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0);
    const occupiedSeatsCount = activeMembers;
    const availableSeats = Math.max(0, library.totalSeats - occupiedSeatsCount);

    return NextResponse.json({
      success: true,
      data: {
        libraryId: library._id.toString(),
        libraryName: library.name,
        totalSeats: library.totalSeats,
        seatSections: library.seatSections || [],
        availableSeats,
        activeMembers,
        totalRevenue,
        totalDue,
        members: membersWithLiveStatus,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}