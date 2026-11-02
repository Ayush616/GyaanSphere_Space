import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  
  // Clear the session cookie
  response.cookies.set({
    name: 'gs_session',
    value: '',
    maxAge: 0,
    path: '/',
  });

  return response;
}