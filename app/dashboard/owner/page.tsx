'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, IndianRupee, Armchair, ShieldCheck, Loader2, Plus, LogOut } from 'lucide-react';
import RegisterMemberModal from '@/app/components/RegisterMemberModal';
import ModifyMemberModal from '@/app/components/ModifyMemberModal';
import SeatConfigTab from '@/app/components/SeatConfigTab';
import SeatGridMap from '@/app/components/SeatGridMap';
import PayDueModal from '@/app/components/PayDueModal';
import PaymentHistoryModal from '@/app/components/PaymentHistoryModal';
import ManagePlansTab from '@/app/components/ManagePlansTab';
import CashDrawerTab from '@/app/components/CashDrawerTab';


export default function OwnerDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'seats' | 'config' | 'plans' | 'drawer'>('members');
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeatConfigModalOpen, setIsSeatConfigModalOpen] = useState(false);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<any>(null);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<any>(null);
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<any>(null);
  const [memberFilter, setMemberFilter] = useState<'all' | 'active' | 'due' | 'expiring' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalSeats = dashboardData?.totalSeats || 50;
  const totalDue = dashboardData?.members?.reduce((sum: number, member: any) => sum + Number(member.dueAmount || 0), 0) || 0;

  const activeLibraryId = dashboardData?.libraryId || '';

  const filteredMembers = (dashboardData?.members || []).filter((member: any) => {
    const matchesFilter =
      memberFilter === 'all' ||
      (memberFilter === 'active' && member.status === 'Active') ||
      (memberFilter === 'due' && Number(member.dueAmount || 0) > 0) ||
      (memberFilter === 'expiring' && member.status === 'Expiring Soon') ||
      (memberFilter === 'expired' && member.status === 'Expired');

    const matchesSearch = !searchTerm || [
      member.name,
      member.mobile,
      member.seatNumber,
      member.planName,
      member.status,
    ].some((value) => String(value || '').toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [memberFilter, searchTerm]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // The route handler is defined at /dashboard/stats, not /api/dashboard/stats.
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
        setError(result.error || 'Failed to load dashboard data.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Network error while connecting to MongoDB.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">


      {/* NAVIGATION TABS */}


      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Master Owner Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">{dashboardData.libraryName}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="bg-slate-800 hover:bg-red-500/20 text-red-400 border border-slate-700 hover:border-red-500/30 font-medium text-xs px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Member</span>
          </button>
        </div>
      </div>

      {/* ANALYTICS STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-10">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-slate-400 font-semibold">Total Revenue</span>
            <span className="bg-emerald-500/10 text-emerald-400 p-2 rounded-2xl">
              <IndianRupee className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">₹{dashboardData.totalRevenue.toLocaleString()}</h3>
          <p className="text-[11px] text-emerald-400 mt-1">Live fee collections</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-slate-400 font-semibold">Total Due</span>
            <span className="bg-amber-500/10 text-amber-400 p-2 rounded-2xl">
              <IndianRupee className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">₹{totalDue.toLocaleString()}</h3>
          <p className="text-[11px] text-amber-400 mt-1">Outstanding balances</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-slate-400 font-semibold">Active Members</span>
            <span className="bg-cyan-500/10 text-cyan-400 p-2 rounded-2xl">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">{dashboardData.activeMembers}</h3>
          <p className="text-[11px] text-cyan-400 mt-1">Enrolled students</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-slate-400 font-semibold">Available Seats</span>
            <span className="bg-blue-500/10 text-blue-400 p-2 rounded-2xl">
              <Armchair className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">{dashboardData.availableSeats} / {dashboardData.totalSeats}</h3>
          <p className="text-[11px] text-blue-400 mt-1">Unassigned desks</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-slate-400 font-semibold">Occupancy Rate</span>
            <span className="bg-purple-500/10 text-purple-400 p-2 rounded-2xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            {Math.round((dashboardData.activeMembers / dashboardData.totalSeats) * 100)}%
          </h3>
          <p className="text-[11px] text-purple-400 mt-1">Branch utilization</p>
        </div>
      </div>


      <div className="flex space-x-3 mb-8 border-b border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'members' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
        >
          Members Directory
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'config' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
        >
          Seat Layout & Capacity
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'plans' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
        >
          Manage Plans
        </button>

        <button
          onClick={() => setActiveTab('drawer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'drawer' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
        >
          Manage Cash Drawer
        </button>
      </div>

      {/* RENDER TAB CONTENT */}
      {activeTab === 'members' && (
        <div>      {/* MEMBER DIRECTORY TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-white">Registered Members Directory</h3>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search members..."
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={memberFilter}
                  onChange={(e) => setMemberFilter(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Members</option>
                  <option value="active">Active</option>
                  <option value="due">Due</option>
                  <option value="expiring">Expiring Soon</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No members match the current filter. Click "Register New Member" to add one.
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
                                if (window.confirm(`Are you sure you want to remove ${member.name}? This will free up Seat #${member.seatNumber}.`)) {
                                  try {
                                    const res = await fetch(`/api/members/${member._id}`, {
                                      method: 'DELETE',
                                    });
                                    const result = await res.json();

                                    if (res.ok && result.success) {
                                      // Refresh dashboard data instantly to update table and seat grid
                                      fetchDashboardData();
                                    } else {
                                      alert(result.error || 'Failed to delete member.');
                                    }
                                  } catch (err) {
                                    alert('Network error while deleting member.');
                                  }
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
                  {selectedMemberForEdit && (
                    <ModifyMemberModal
                      member={selectedMemberForEdit}
                      totalSeats={totalSeats}
                      seatSections={dashboardData.seatSections}
                      onClose={() => setSelectedMemberForEdit(null)} // Close modal
                      onSuccess={() => {
                        setSelectedMemberForEdit(null);
                        fetchDashboardData(); // Refresh dashboard table & metrics instantly after update
                      }}
                    />
                  )}
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

      {activeTab === 'config' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Seat Layout & Capacity</h3>
              <p className="text-xs text-slate-400 mt-1">Current layout is visible below. Use the button to update the sections.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsSeatConfigModalOpen(true)}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              Configure Layout
            </button>
          </div>

          <SeatGridMap
            seatSections={dashboardData.seatSections || []}
            title="Seat Layout & Capacity"
            members={dashboardData?.members || []}
            onPayDue={(member) => setSelectedMemberForPayment(member)}
          />
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <ManagePlansTab />
        </div>
      )}
      {activeTab === 'drawer' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <CashDrawerTab />
        </div>
      )}



      {/* MODAL */}
      {isModalOpen && (
        <RegisterMemberModal
          libraryId={activeLibraryId}
          totalSeats={dashboardData.totalSeats}
          seatSections={dashboardData.seatSections}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchDashboardData(); // Refresh data dynamically after registering a member
          }}
        />
      )}

      {isSeatConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 sm:p-6 relative shadow-2xl my-8">
            <SeatConfigTab
              initialSections={dashboardData?.seatSections || [{ prefix: 'A', count: dashboardData?.totalSeats || 30 }]}
              onUpdate={() => {
                setIsSeatConfigModalOpen(false);
                fetchDashboardData();
              }}
              onClose={() => setIsSeatConfigModalOpen(false)}
            />
          </div>
        </div>
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