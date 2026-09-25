import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, ticketApi } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  ShieldCheck,
  PlusCircle,
  ArrowRight,
  UserCheck,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const STATUS_COLORS = {
  OPEN: '#3b82f6',
  ASSIGNED: '#a855f7',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981',
  CLOSED: '#64748b',
};

const PRIORITY_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#f43f5e',
};

const Dashboard = () => {
  const { user, isAdmin, isAgent, isEmployee } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isAdmin) {
        res = await dashboardApi.getAdminDashboard();
      } else if (isAgent) {
        res = await dashboardApi.getAgentDashboard();
      } else {
        res = await dashboardApi.getEmployeeDashboard();
      }
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.role]);

  const handleClaimTicket = async (ticketId) => {
    setActionLoading(true);
    try {
      await ticketApi.assignTicket(ticketId, { assignedToId: user.id });
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim ticket');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage={false} message="Loading operational dashboard..." />;
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl flex flex-col items-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
        <p className="font-semibold text-sm">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN DASHBOARD
  // -------------------------------------------------------------
  if (isAdmin && data) {
    const statusChartData = (data.statusDistribution || []).map((item) => ({
      name: item.name.replace('_', ' '),
      value: item.value,
      color: STATUS_COLORS[item.name] || '#64748b',
    }));

    const priorityChartData = (data.priorityDistribution || []).map((item) => ({
      name: item.name,
      value: item.value,
      fill: PRIORITY_COLORS[item.name] || '#64748b',
    }));

    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enterprise service metrics, workload distribution, and ticket lifecycles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <Link
              to="/tickets/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Ticket
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total</span>
              <Ticket className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.totalTickets}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">All tickets logged</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-blue-600 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Open</span>
              <HelpCircle className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{data.openTickets}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Awaiting triage</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-amber-600 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">{data.inProgressTickets}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Under investigation</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Resolved</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{data.resolvedTickets}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pending closure</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between text-slate-600 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Closed</span>
              <ShieldCheck className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-700">{data.closedTickets}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Resolution verified</div>
          </div>

          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-sm">
            <div className="flex items-center justify-between text-rose-600 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Critical</span>
              <AlertCircle className="w-4 h-4 text-rose-600 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-rose-700">{data.criticalTickets}</div>
            <div className="text-[11px] text-rose-500 mt-0.5">Requires escalation</div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Tickets by Status</h3>
              <p className="text-xs text-slate-500">Proportion of workload across workflow states</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Tickets by Priority</h3>
              <p className="text-xs text-slate-500">Distribution of issue severity</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category & Trend Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Tickets by Category</h3>
              <p className="text-xs text-slate-500">Departmental issue areas</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.categoryDistribution || []}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Creation Trend */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Volume Over Time (Last 7 Days)</h3>
              <p className="text-xs text-slate-500">Incoming incident submission rate</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trendData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Tickets Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Service Incidents</h3>
              <p className="text-xs text-slate-500">Latest tickets submitted across the enterprise</p>
            </div>
            <Link
              to="/tickets"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.recentTickets || []).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{t.category?.name}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {t.assignedTo ? t.assignedTo.fullName : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/tickets/${t.id}`)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUPPORT AGENT DASHBOARD
  // -------------------------------------------------------------
  if (isAgent && data) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Agent Workspace</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Welcome back, {user?.fullName}. Here are your active assignments and triage queue.
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Queue
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">My Assigned</span>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{data.assignedTickets}</div>
            <span className="text-[11px] text-slate-400">Total in your queue</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{data.inProgressTickets}</div>
            <span className="text-[11px] text-slate-400">Active tasks</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Unassigned</span>
            <div className="text-2xl font-bold text-blue-600 mt-1">{data.unassignedTickets}</div>
            <span className="text-[11px] text-slate-400">Available to take</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Open Tickets</span>
            <div className="text-2xl font-bold text-slate-700 mt-1">{data.openTickets}</div>
            <span className="text-[11px] text-slate-400">Enterprise open</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">High Priority</span>
            <div className="text-2xl font-bold text-orange-600 mt-1">{data.highPriorityTickets}</div>
            <span className="text-[11px] text-slate-400">Urgent requests</span>
          </div>

          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Critical Priority</span>
            <div className="text-2xl font-bold text-rose-700 mt-1">{data.criticalTickets}</div>
            <span className="text-[11px] text-rose-500">Severe incidents</span>
          </div>
        </div>

        {/* My Assigned Tickets Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Active Assigned Incidents</h3>
              <p className="text-xs text-slate-500">Tickets currently assigned to your profile</p>
            </div>
            <Link
              to="/tickets"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Full Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.myAssignedTickets || []).length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400">
                      No active tickets assigned to you right now. Take tickets from the unassigned pool below!
                    </td>
                  </tr>
                ) : (
                  data.myAssignedTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                        {t.ticketNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {t.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{t.category?.name}</td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">{t.createdBy?.fullName}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigate(`/tickets/${t.id}`)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                        >
                          Resolve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Unassigned Pool */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Unassigned Ticket Pool</h3>
            <p className="text-xs text-slate-500">Pick up new tickets to investigate</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.availableTickets || []).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      All tickets are currently assigned. Great job!
                    </td>
                  </tr>
                ) : (
                  data.availableTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                        {t.ticketNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                        {t.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{t.category?.name}</td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">{t.createdBy?.fullName}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleClaimTicket(t.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
                          >
                            Assign to Me
                          </button>
                          <button
                            onClick={() => navigate(`/tickets/${t.id}`)}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPLOYEE DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-3xl text-white shadow-lg shadow-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm mb-3">
            Employee Support Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            How can IT support assist you today, {user?.fullName}?
          </h1>
          <p className="text-xs text-indigo-100 mt-1 max-w-xl">
            Submit a request for hardware, software installations, access permissions, or report connectivity disruptions.
          </p>
        </div>

        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 text-sm font-bold shadow-md hover:bg-indigo-50 transition flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          Create Support Ticket
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">My Tickets</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{data.totalTickets}</div>
          <span className="text-[11px] text-slate-400">Total submitted</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Open</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{data.openTickets}</div>
          <span className="text-[11px] text-slate-400">Awaiting assignment</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{data.inProgressTickets}</div>
          <span className="text-[11px] text-slate-400">Agent working</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Resolved</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{data.resolvedTickets}</div>
          <span className="text-[11px] text-slate-400">Ready for review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Closed</span>
          <div className="text-2xl font-bold text-slate-600 mt-1">{data.closedTickets}</div>
          <span className="text-[11px] text-slate-400">Resolved & archived</span>
        </div>
      </div>

      {/* My Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Service Requests</h3>
            <p className="text-xs text-slate-500">Track real-time progress on your open and resolved requests</p>
          </div>
          <Link
            to="/tickets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            All My Tickets <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Ticket Number</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Support Agent</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.myTickets || []).length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <p className="mb-2 font-medium">You have not submitted any service tickets yet.</p>
                    <Link
                      to="/tickets/new"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-semibold hover:bg-indigo-100 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Submit First Request
                    </Link>
                  </td>
                </tr>
              ) : (
                data.myTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{t.category?.name}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {t.assignedTo ? t.assignedTo.fullName : (
                        <span className="text-slate-400 italic">Waiting for agent</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/tickets/${t.id}`)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
