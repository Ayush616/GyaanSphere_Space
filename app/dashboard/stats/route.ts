import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Library from '@/models/Library';
import Member from '@/models/Member';
import { getSessionUser } from '@/lib/auth';

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

    // Calculate dynamic analytics
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === 'Active').length;
    const totalRevenue = members.reduce((acc, curr) => acc + (curr.feesPaid || 0), 0);
    const totalDue = members.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0);
    const occupiedSeatsCount = members.filter(m => m.status === 'Active').length;
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
        members,
      },
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}