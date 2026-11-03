'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/components/ToastProvider';
import {
  UserCheck,
  Users,
  Armchair,
  Plus,
  Search,
  LogOut,
  QrCode,
  Clock,
  IndianRupee,
  ShieldCheck,
  Smartphone,
  Loader2,
  MapPin,
  Wifi,
  AlertCircle,
} from 'lucide-react';
import RegisterMemberModal from '@/app/components/RegisterMemberModal';
import ModifyMemberModal from '@/app/components/ModifyMemberModal';
import SeatGridMap from '@/app/components/SeatGridMap';
import PayDueModal from '@/app/components/PayDueModal';
import PaymentHistoryModal from '@/app/components/PaymentHistoryModal';
import ManagePlansTab from '@/app/components/ManagePlansTab';
import CashDrawerTab from '@/app/components/CashDrawerTab';
import StaffPunchButton from '@/app/components/StaffPunchButton';

export default function StaffDashboard() {
  const router = useRouter();
  const { showToast, confirmAction } = useToast();
  const [activeTab, setActiveTab] = useState<'shift' | 'members' | 'seats' | 'plans' | 'drawer'>('shift');
  const [searchTerm, setSearchTerm] = useState('');
  const [memberFilter, setMemberFilter] = useState<'all' | 'active' | 'due' | 'expiring' | 'expired'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [punchStartedAt, setPunchStartedAt] = useState<number | null>(null);
  const [clockTick, setClockTick] = useState<number>(Date.now());
  const [showQrScanModal, setShowQrScanModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<any>(null);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<any>(null);
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<any>(null);

  const activeLibraryId = dashboardData?.libraryId || '';
  const totalSeats = dashboardData?.totalSeats || 30;
  const totalDue = dashboardData?.members?.reduce((sum: number, member: any) => sum + Number(member.dueAmount || 0), 0) || 0;
  const [attendanceStatus, setAttendanceStatus] = useState<any>(null);


  const fetchAttendanceStatus = async () => {
    try {
      const res = await fetch('/api/staff/status'); // Optional API to check active status
      const result = await res.json();
      if (res.ok && result.success) {
        setAttendanceStatus(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch attendance status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, []);

  const formatDuration = (milliseconds: number) => {
    const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} hrs`;
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayPaymentEntries = (dashboardData?.members || []).flatMap((member: any) =>
    (member.paymentHistory || []).filter((entry: any) => {
      const paymentDate = new Date(entry?.date ?? entry?.paymentDate ?? Date.now());
      return !Number.isNaN(paymentDate.getTime()) && paymentDate >= todayStart && paymentDate <= todayEnd;
    }).map((entry: any) => ({ ...entry, memberName: member.name, seatNumber: member.seatNumber }))
  );

  const cashCollected = todayPaymentEntries.reduce((sum: number, entry: any) => {
    const directCash = Number(entry?.cashAmount ?? 0);
    const fallbackCash = entry?.mode === 'Cash' ? Number(entry?.amount ?? 0) : 0;
    return sum + (directCash || fallbackCash);
  }, 0);

  const upiCollected = todayPaymentEntries.reduce((sum: number, entry: any) => {
    const directUpi = Number(entry?.upiAmount ?? 0);
    const fallbackUpi = entry?.mode === 'UPI' ? Number(entry?.amount ?? 0) : 0;
    const splitUpi = entry?.mode === 'Both (Cash & UPI)' ? Number(entry?.amount ?? 0) - Number(entry?.cashAmount ?? 0) : 0;
    return sum + (directUpi || fallbackUpi || splitUpi);
  }, 0);

  const newAdmissionsToday = (dashboardData?.members || []).filter((member: any) => {
    const startDate = new Date(member?.startDate);
    return !Number.isNaN(startDate.getTime()) && startDate >= todayStart && startDate <= todayEnd;
  }).length;

  const shiftStats = {
    cashCollected,
    upiCollected,
    newAdmissions: newAdmissionsToday,
    hoursOnDuty: isPunchedIn && punchStartedAt ? formatDuration(clockTick - punchStartedAt) : '00:00 hrs',
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/dashboard/stats');
      const text = await res.text();
      let result: any = {};

      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          result = { error: 'Unexpected server response while loading dashboard data.' };
        }
      }

      if (res.ok && result.success) {
        setDashboardData(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data.');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Something went wrong while connecting to the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAdded = () => {
    setIsModalOpen(false);
    fetchDashboardData();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      router.push('/login');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!isPunchedIn || !punchStartedAt) return;

    const timer = setInterval(() => {
      setClockTick(Date.now());
    }, 30000);

    return () => clearInterval(timer);
  }, [isPunchedIn, punchStartedAt]);

  const handlePunchIn = () => {
    setShowQrScanModal(true);
  };

  const confirmQrPunchIn = () => {
    const now = Date.now();
    setIsPunchedIn(true);
    setPunchStartedAt(now);
    setPunchTime(new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setShowQrScanModal(false);
  };

  const handlePunchOut = () => {
    setIsPunchedIn(false);
    setPunchStartedAt(null);
    setPunchTime(null);
  };

  const filteredMembers = (dashboardData?.members || []).filter((member: any) => {
    const term = searchTerm.toLowerCase();
    const matchesFilter =
      memberFilter === 'all' ||
      (memberFilter === 'active' && member.status === 'Active') ||
      (memberFilter === 'due' && Number(member.dueAmount || 0) > 0) ||
      (memberFilter === 'expiring' && member.status === 'Expiring Soon') ||
      (memberFilter === 'expired' && member.status === 'Expired');

    const matchesSearch =
      !term ||
      member.name?.toLowerCase().includes(term) ||
      member.mobile?.toLowerCase().includes(term) ||
      member.seatNumber?.toString().toLowerCase().includes(term) ||
      member.planName?.toLowerCase().includes(term) ||
      member.status?.toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [memberFilter, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading live data from MongoDB...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-xs max-w-md text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex">
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4" />
              <span>Front Desk Portal</span>
            </div>
            <h2 className="text-lg font-bold text-white">Umesh Sahu</h2>
            <p className="text-xs text-slate-400">Receptionist & Operations</p>
          </div>

          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('shift')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'shift' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Clock className="w-4 h-4" />
              <span>Shift & Revenue Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'members' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              <span>Member Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('seats')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'seats' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Armchair className="w-4 h-4" />
              <span>Seat Layout Grid</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'plans' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <Users className="w-4 h-4" />
              <span>Plans</span>
            </button>

            <button
              onClick={() => setActiveTab('drawer')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'drawer' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}
            >
              <IndianRupee className="w-4 h-4" />
              <span>Cash Drawer</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-start space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout / Exit</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 p-6 lg:p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ATTENDANCE PUNCH BOX */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-cyan-400" /> Shift Attendance
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  You must be connected to the office Wi-Fi and physically within the library geofence boundary to check in.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <StaffPunchButton
                  isPunchedIn={attendanceStatus?.isPunchedIn || false}
                  onPunchSuccess={() => {
                    fetchAttendanceStatus(); // Refresh state instantly
                  }}
                />
              </div>
            </div>

            {/* GUIDELINES & SECURITY CARD */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-amber-400" /> Verification Guidelines
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start space-x-2.5 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  <Wifi className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Office Wi-Fi Binding</span>
                    <span className="text-slate-400 text-[11px]">Your request IP must match the library router subnet.</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">GPS Geofencing</span>
                    <span className="text-slate-400 text-[11px]">Your browser will prompt for location permission to verify you are within 50 meters of the library branch.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </header>

        {activeTab === 'shift' && (
          <div className="space-y-8 animate-in fade-in duration-300">

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400 font-semibold">Total Revenue</span>
                  <span className="bg-emerald-500/10 text-emerald-400 p-2 rounded-2xl"><IndianRupee className="w-5 h-5" /></span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">₹{dashboardData?.totalRevenue?.toLocaleString() || 0}</h3>
                <p className="text-[11px] text-emerald-400 mt-1">Live fee collections</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400 font-semibold">Total Due</span>
                  <span className="bg-amber-500/10 text-amber-400 p-2 rounded-2xl"><IndianRupee className="w-5 h-5" /></span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">₹{totalDue.toLocaleString()}</h3>
                <p className="text-[11px] text-amber-400 mt-1">Outstanding balances</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400 font-semibold">Active Members</span>
                  <span className="bg-cyan-500/10 text-cyan-400 p-2 rounded-2xl"><Users className="w-5 h-5" /></span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">{dashboardData?.activeMembers || 0}</h3>
                <p className="text-[11px] text-cyan-400 mt-1">Enrolled students</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400 font-semibold">Available Seats</span>
                  <span className="bg-blue-500/10 text-blue-400 p-2 rounded-2xl"><Armchair className="w-5 h-5" /></span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">{dashboardData?.availableSeats || 0} / {dashboardData?.totalSeats || totalSeats}</h3>
                <p className="text-[11px] text-blue-400 mt-1">Unassigned desks</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-slate-400 font-semibold">Occupancy Rate</span>
                  <span className="bg-purple-500/10 text-purple-400 p-2 rounded-2xl"><ShieldCheck className="w-5 h-5" /></span>
                </div>
                <h3 className="text-2xl font-extrabold text-white">
                  {dashboardData?.totalSeats ? Math.round(((dashboardData?.activeMembers || 0) / dashboardData.totalSeats) * 100) : 0}%
                </h3>
                <p className="text-[11px] text-purple-400 mt-1">Branch utilization</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Today's Collection & Shift Analytics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-slate-400 font-semibold uppercase">UPI Collections</span>
                    <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl"><IndianRupee className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">₹{shiftStats.upiCollected}</div>
                  <p className="text-xs text-slate-400 mt-2">Scanned via Desk QR Code</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Cash Collections</span>
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><IndianRupee className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">₹{shiftStats.cashCollected}</div>
                  <p className="text-xs text-slate-400 mt-2">Received at reception counter</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-slate-400 font-semibold uppercase">New Admissions</span>
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl"><Users className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">{shiftStats.newAdmissions} Students</div>
                  <p className="text-xs text-slate-400 mt-2">Registered during this shift</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Total Collection</span>
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"><IndianRupee className="w-4 h-4" /></div>
                  </div>
                  <div className="text-3xl font-extrabold text-white">₹{shiftStats.upiCollected + shiftStats.cashCollected}</div>
                  <p className="text-xs text-emerald-400 mt-2 font-semibold">Ready for daily audit</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center gap-3 flex-col md:flex-row">
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Members</option>
                  <option value="active">Active</option>
                  <option value="due">Due</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Member</span>
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Registered Members Directory</h3>

              {filteredMembers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No matching members found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Seat</th>
                        <th className="pb-3 font-semibold">Plan</th>
                        <th className="pb-3 font-semibold">Mobile</th>
                        <th className="pb-3 font-semibold">Fees Paid</th>
                        <th className="pb-3 font-semibold">Payment History</th>
                        <th className="pb-3 font-semibold">Start Date</th>
                        <th className="pb-3 font-semibold">Expiry Date</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {paginatedMembers.map((member: any) => {
                        const getPaymentDate = (entry: any) => new Date(entry?.date ?? entry?.paymentDate ?? Date.now());
                        const paymentHistory = Array.isArray(member.paymentHistory)
                          ? [...member.paymentHistory].sort((a: any, b: any) => getPaymentDate(b).getTime() - getPaymentDate(a).getTime())
                          : [];
                        const latestPayment = paymentHistory[0];

                        return (
                          <tr key={member._id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 font-bold text-white">{member.name}</td>
                            <td className="py-4 text-cyan-400 font-semibold">Seat #{member.seatNumber}</td>
                            <td className="py-4 text-slate-300">{member.planName}</td>
                            <td className="py-4 text-slate-400">{member.mobile}</td>
                            <td className="py-4 text-emerald-400 font-bold">₹{member.feesPaid}</td>
                            <td className="py-4">
                              {latestPayment ? (
                                <div className="flex flex-col">
                                  <span className="text-emerald-300 font-bold">₹{Number(latestPayment.amount || 0).toLocaleString()}</span>
                                  <span className="text-[10px] text-slate-400">{getPaymentDate(latestPayment).toLocaleDateString()}</span>
                                  <span className="text-[9px] text-slate-500">{paymentHistory.length} payment{paymentHistory.length > 1 ? 's' : ''}</span>
                                </div>
                              ) : (
                                <span className="text-slate-500">—</span>
                              )}
                            </td>
                            <td className="py-4 text-slate-400">{new Date(member.startDate).toLocaleDateString()}</td>
                            <td className="py-4 text-slate-400">{new Date(member.expiryDate).toLocaleDateString()}</td>
                            <td className="py-4">
                              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                                {member.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <button
                                onClick={() => setSelectedMemberForHistory(member)}
                                className="bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
                              >
                                History
                              </button>

                              <button
                                onClick={() => setSelectedMemberForEdit(member)}
                                className="bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 border border-slate-700 hover:border-cyan-500/40 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ml-1"
                              >
                                Modify
                              </button>

                              {Number(member.dueAmount || 0) > 0 && (
                                <button
                                  onClick={() => setSelectedMemberForPayment(member)}
                                  className="bg-amber-500/10 ml-1 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
                                >
                                  Pay Due
                                </button>
                              )}

                              <button
                                onClick={async () => {
                                  const confirmed = await confirmAction({
                                    title: `Remove ${member.name}?`,
                                    description: `This will free up Seat #${member.seatNumber}.`,
                                    confirmLabel: 'Delete member',
                                    cancelLabel: 'Keep member',
                                    destructive: true,
                                  });

                                  if (!confirmed) return;

                                  try {
                                    const res = await fetch(`/api/members/${member._id}`, { method: 'DELETE' });
                                    const result = await res.json();
                                    if (res.ok && result.success) {
                                      fetchDashboardData();
                                      showToast({
                                        type: 'success',
                                        title: 'Member removed',
                                        description: `${member.name} was deleted successfully.`,
                                      });
                                    } else {
                                      showToast({
                                        type: 'error',
                                        title: 'Delete failed',
                                        description: result.error || 'Failed to delete member.',
                                      });
                                    }
                                  } catch (err) {
                                    showToast({
                                      type: 'error',
                                      title: 'Network error',
                                      description: 'Unable to delete the member right now.',
                                    });
                                  }
                                }}
                                className="bg-red-500/10 ml-1 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
                      <button
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-500/40"
                      >
                        Previous
                      </button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 disabled:opacity-40 disabled:cursor-not-allowed hover:border-cyan-500/40"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'seats' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-white">Seat Layout & Capacity</h3>
                <p className="text-xs text-slate-400 mt-1">Live seat view for the current library branch. Layout updates are restricted to owners only.</p>
              </div>
            </div>

            <SeatGridMap
              seatSections={dashboardData?.seatSections || []}
              title="Seat Layout & Capacity"
              members={dashboardData?.members || []}
              onPayDue={(member) => setSelectedMemberForPayment(member)}
            />
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <ManagePlansTab readOnly />
          </div>
        )}

        {activeTab === 'drawer' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <CashDrawerTab />
          </div>
        )}
      </main>

      {showQrScanModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center relative animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-white">Scan Desk QR Code</h4>
            <p className="text-xs text-slate-400 mb-4">
              GPS Location Verified: <strong className="text-emerald-400">GyaanSphere Library Premises</strong>
            </p>

            <div className="bg-slate-900 border-2 border-dashed border-cyan-500/40 rounded-2xl p-4 my-4">
              <div className="w-40 h-40 bg-slate-800 mx-auto rounded-xl flex items-center justify-center text-slate-400 text-xs font-mono">
                [ CAMERA QR SCANNER ]
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-6">
              Point your phone camera at the reception desk QR code to complete your shift punch-in.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowQrScanModal(false)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs py-3 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmQrPunchIn}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition-all shadow-lg"
              >
                Verify & Punch In
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <RegisterMemberModal
          libraryId={activeLibraryId}
          totalSeats={totalSeats}
          seatSections={dashboardData?.seatSections || []}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleMemberAdded}
        />
      )}

      {selectedMemberForEdit && (
        <ModifyMemberModal
          member={selectedMemberForEdit}
          totalSeats={totalSeats}
          seatSections={dashboardData?.seatSections || []}
          onClose={() => setSelectedMemberForEdit(null)}
          onSuccess={() => {
            setSelectedMemberForEdit(null);
            fetchDashboardData();
          }}
        />
      )}

      {selectedMemberForPayment && (
        <PayDueModal
          member={selectedMemberForPayment}
          onClose={() => setSelectedMemberForPayment(null)}
          onSuccess={() => {
            setSelectedMemberForPayment(null);
            fetchDashboardData();
          }}
        />
      )}

      {selectedMemberForHistory && (
        <PaymentHistoryModal
          member={selectedMemberForHistory}
          onClose={() => setSelectedMemberForHistory(null)}
        />
      )}
    </div>
  );
}