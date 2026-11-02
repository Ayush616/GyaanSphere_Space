import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Plan from '@/models/Plan';
import { getSessionUser } from '@/lib/auth';

// GET: Fetch all plans for the logged-in library
export async function GET(req: Request) {
  try {
    await connectDB();
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const plans = await Plan.find({ libraryId: user.libraryId });
    return NextResponse.json({ success: true, data: plans }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new plan
export async function POST(req: Request) {
  try {
    await connectDB();
    const user = await getSessionUser();
    if (!user || user.role !== 'library_owner') {
      return NextResponse.json({ success: false, error: 'Owner access required' }, { status: 403 });
    }

    const { name, durationMonths, price, description } = await req.json();

    const newPlan = await Plan.create({
      libraryId: user.libraryId,
      name,
      durationMonths: Number(durationMonths),
      price: Number(price),
      description,
      isActive: true,
    });

    return NextResponse.json({ success: true, message: 'Plan created successfully!', data: newPlan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}