import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketApi, categoryApi } from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Search,
  Filter,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
  UserCheck,
} from 'lucide-react';

const STATUS_TABS = [
  { label: 'All Tickets', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

const Tickets = () => {
  const { user, isAdmin, isAgent } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and pagination state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.getCategories(false);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sort: 'createdAt,desc',
      };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (categoryId) params.categoryId = categoryId;
      if (unassignedOnly) params.unassignedOnly = true;

      const res = await ticketApi.getTickets(params);
      const data = res.data.data;
      setTickets(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [page, size, status, priority, categoryId, unassignedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTickets();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setUnassignedOnly(false);
    setPage(0);
  };

  const handleClaimTicket = async (ticketId, e) => {
    e.stopPropagation();
    try {
      await ticketApi.assignTicket(ticketId, { assignedToId: user.id });
      fetchTickets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim ticket');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Support Incidents</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Global ticket repository and dispatch center'
              : isAgent
              ? 'Browse, assign, and update service tickets'
              : 'Track and review the status of your submitted requests'}
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Ticket
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto pb-px">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value);
                setPage(0);
              }}
              className={`px-4 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket number, title, or keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-900 transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Priority filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(0);
            }}
            className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(0);
            }}
            className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Unassigned Only checkbox (Agent / Admin) */}
          {(isAdmin || isAgent) && (
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={unassignedOnly}
                onChange={(e) => {
                  setUnassignedOnly(e.target.checked);
                  setPage(0);
                }}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>Unassigned Only</span>
            </label>
          )}

          {/* Reset Filters button */}
          <button
            onClick={handleResetFilters}
            title="Reset Filters"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching ticket records..." />
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No Tickets Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no service tickets matching your search query or active filter selection.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition"
                  >
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
                    <td className="py-3 px-4 text-slate-600">
                      {t.assignedTo ? (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                          {t.assignedTo.fullName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {(isAdmin || isAgent) && !t.assignedTo && (
                        <button
                          onClick={(e) => handleClaimTicket(t.id, e)}
                          className="mr-2 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          Claim
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${t.id}`);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{tickets.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{totalElements}</span> tickets
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="py-1 px-2 border border-slate-300 rounded-md text-xs focus:ring-indigo-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>
                Page <span className="font-semibold text-slate-800">{page + 1}</span> of{' '}
                <span className="font-semibold text-slate-800">{Math.max(1, totalPages)}</span>
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((prev) => prev + 1)}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
