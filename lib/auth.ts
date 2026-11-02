import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export interface SessionUser {
    userId: string;
    libraryId: string;
    name: string;
    role: 'library_owner' | 'library_staff';
}

export async function getSessionUser(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('gs_session');

        if (!sessionCookie) return null;

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const decoded = jwt.verify(
            sessionCookie.value,
            JWT_SECRET
        ) as SessionUser;

        return decoded;

    } catch (err) {
        console.error('Session verification failed:', err);
        return null;
    }
}