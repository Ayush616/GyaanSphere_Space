import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StaffAttendance from '@/models/StaffAttendance';
import Library from '@/models/Library';
import { getSessionUser } from '@/lib/auth';

// Helper: Haversine Formula to calculate distance between two GPS coordinates in meters
function getHaversineDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const user = await getSessionUser();

        if (!user || user.role !== 'library_staff') {
            return NextResponse.json({ success: false, error: 'Unauthorized staff access.' }, { status: 401 });
        }

        const { action, latitude, longitude } = await req.json();

        // -------------------------------------------------------------
        // CHECK 1: WI-FI SUBNET VERIFICATION
        // -------------------------------------------------------------
        const forwardedFor = req.headers.get('x-forwarded-for');
        const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

        const OFFICE_SUBNET = process.env.OFFICE_SUBNET || '192.168.1.';
        const isLocalhost = clientIp === '127.0.0.1' || clientIp === '::1';
        const isInsideOfficeWifi = clientIp.startsWith(OFFICE_SUBNET) || isLocalhost;

        if (!isInsideOfficeWifi) {
            return NextResponse.json({
                success: false,
                error: `Punch-in rejected! You must be connected to the official Office Wi-Fi network. (Detected IP: ${clientIp})`,
            }, { status: 403 });
        }
        // -------------------------------------------------------------
        // CHECK 2: GEOFENCING (GPS DISTANCE) VERIFICATION
        // -------------------------------------------------------------
        if (!latitude || !longitude) {
            return NextResponse.json({
                success: false,
                error: 'Location permission is required to verify your attendance.',
            }, { status: 400 });
        }

        const library = await Library.findById(user.libraryId);
        if (!library || !library.latitude || !library.longitude) {
            return NextResponse.json({
                success: false,
                error: 'Library branch location coordinates are not configured by the owner.',
            }, { status: 400 });
        }

        const distanceInMeters = getHaversineDistanceInMeters(
            Number(latitude),
            Number(longitude),
            library.latitude,
            library.longitude
        );

        const ALLOWED_RADIUS_METERS = 50; // Allow within 50 meters of the branch
        if (distanceInMeters > ALLOWED_RADIUS_METERS) {
            return NextResponse.json({
                success: false,
                error: `Punch-in rejected! You are ${Math.round(distanceInMeters)} meters away from the library. You must be within ${ALLOWED_RADIUS_METERS} meters.`,
            }, { status: 403 });
        }

        // -------------------------------------------------------------
        // PROCESS PUNCH IN / PUNCH OUT LOGIC
        // -------------------------------------------------------------
        const activePunch = await StaffAttendance.findOne({
            staffId: user.userId,
            status: 'Present',
        });

        if (action === 'IN') {
            if (activePunch) {
                return NextResponse.json({ success: false, error: 'You are already punched in!' }, { status: 400 });
            }

            const newPunch = await StaffAttendance.create({
                libraryId: user.libraryId,
                staffId: user.userId,
                staffName: user.name,
                punchInTime: new Date(),
                punchInIp: clientIp,
                status: 'Present',
            });

            return NextResponse.json({
                success: true,
                message: 'Punch-in successful! Location & Wi-Fi verified.',
                data: newPunch,
            }, { status: 200 });

        } else if (action === 'OUT') {
            if (!activePunch) {
                return NextResponse.json({ success: false, error: 'No active punch-in record found.' }, { status: 400 });
            }

            activePunch.punchOutTime = new Date();
            activePunch.status = 'Checked Out';
            await activePunch.save();

            return NextResponse.json({
                success: true,
                message: 'Punched out successfully!',
                data: activePunch,
            }, { status: 200 });
        }

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}