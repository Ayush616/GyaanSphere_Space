import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Library from '@/models/Library';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const { ownerName, email, mobile, libraryName, address, city, totalSeats } = body;

    // Validate required fields
    if (!ownerName || !email || !libraryName || !city) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    // Generate a unique URL slug from the library name
    const slug = libraryName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    // Check if slug already exists
    const existingLibrary = await Library.findOne({ slug });
    if (existingLibrary) {
      return NextResponse.json(
        { success: false, error: 'A library with this name already exists. Please choose a unique name.' },
        { status: 400 }
      );
    }

    // Create the library branch in MongoDB
    const newLibrary = await Library.create({
      name: libraryName,
      slug,
      ownerName,
      ownerEmail: email,
      mobile,
      address,
      city,
      totalSeats: Number(totalSeats) || 30,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Library registered successfully!', 
        data: newLibrary 
      },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}