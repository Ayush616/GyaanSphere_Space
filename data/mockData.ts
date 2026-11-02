import { Member, Seat, LibraryPlan } from '@/types/library';

export const INITIAL_PLANS: LibraryPlan[] = [
  { id: '1', name: 'Full Day Monthly', durationMonths: 1, price: 1100, description: '7:00 AM – 10:00 PM Access' },
  { id: '2', name: 'Quarterly Plan', durationMonths: 3, price: 2950, description: '3 Months Full Access + Savings' },
  { id: '3', name: 'Half-Yearly Plan', durationMonths: 6, price: 5500, description: '6 Months Full Access + Best Value' },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'M-101',
    name: 'Rahul Sharma',
    aadhaarId: 'XXXX-XXXX-1234',
    mobile: '9876543210',
    email: 'rahul@gmail.com',
    planId: '1',
    seatNumber: 12,
    startDate: '2026-10-01',
    expiryDate: '2026-11-01',
    status: 'Active',
    feesPaid: 1100,
  },
  {
    id: 'M-102',
    name: 'Priya Verma',
    aadhaarId: 'XXXX-XXXX-5678',
    mobile: '9123456789',
    email: 'priya@gmail.com',
    planId: '2',
    seatNumber: 15,
    startDate: '2026-09-15',
    expiryDate: '2026-12-15',
    status: 'Active',
    feesPaid: 2950,
  },
];

// Generate 30 library seats
export const INITIAL_SEATS: Seat[] = Array.from({ length: 30 }, (_, index) => {
  const seatNum = index + 1;
  const assignedMember = INITIAL_MEMBERS.find(m => m.seatNumber === seatNum);
  return {
    seatNumber: seatNum,
    status: assignedMember ? 'occupied' : 'available',
    currentMemberId: assignedMember?.id,
    currentMemberName: assignedMember?.name,
  };
});