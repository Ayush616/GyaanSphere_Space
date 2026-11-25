export type MemberStatus = 'Active' | 'Expiring Soon' | 'Expired';

export function getMemberStatus(expiryDate: Date | string | null | undefined, now = new Date()): MemberStatus {
  if (!expiryDate) return 'Expired';

  const expiry = new Date(expiryDate);
  if (Number.isNaN(expiry.getTime())) return 'Expired';

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (expiry < today) return 'Expired';

  const soonThreshold = new Date(today);
  soonThreshold.setDate(soonThreshold.getDate() + 7);

  if (expiry <= soonThreshold) return 'Expiring Soon';
  return 'Active';
}
