import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Library from '@/models/Library';
import { getSessionUser } from '@/lib/auth';

export async function PUT(req: Request) {
  try {
    await connectDB();
    const user = await getSessionUser();

    if (!user || user.role !== 'library_owner') {
      return NextResponse.json({ success: false, error: 'Unauthorized. Owner access required.' }, { status: 401 });
    }

    const { seatSections } = await req.json();

    if (!seatSections || !Array.isArray(seatSections) || seatSections.length === 0) {
      return NextResponse.json({ success: false, error: 'At least one seat section is required.' }, { status: 400 });
    }

    // Automatically calculate total seats from all sections combined
    const totalSeats = seatSections.reduce((acc: number, curr: any) => acc + Number(curr.count || 0), 0);

    const updatedLibrary = await Library.findByIdAndUpdate(
      user.libraryId,
      { 
        totalSeats,
        seatSections: seatSections.map(s => ({
          prefix: s.prefix.toUpperCase(),
          count: Number(s.count)
        }))
      },
      { new: true, runValidators: true }
    );

    if (!updatedLibrary) {
      return NextResponse.json({ success: false, error: 'Library branch not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Multi-section seat layout updated successfully!',
      data: updatedLibrary,
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}