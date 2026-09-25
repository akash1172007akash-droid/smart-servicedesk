import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ticketApi,
  commentApi,
  attachmentApi,
  historyApi,
  userApi,
} from '../api/axiosClient';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Paperclip,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck,
  Tag,
  ShieldCheck,
  History,
  MessageSquare,
  Upload,
} from 'lucide-react';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isAgent, isEmployee } = useAuth();

  const [ticketData, setTicketData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Attachment upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Status modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Tab state: "discussion" or "history"
  const [activeTab, setActiveTab] = useState('discussion');

  const fetchTicket = async () => {
    try {
      const res = await ticketApi.getTicketById(id);
      setTicketData(res.data.data);
    } catch (err) {
      console.error('Failed to load ticket:', err);
      setError(err.response?.data?.message || 'Failed to retrieve ticket details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (isAdmin || isAgent) {
      try {
        const res = await userApi.getAgents();
        setAgents(res.data.data || []);
      } catch (err) {
        console.error('Failed to load support agents:', err);
      }
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchAgents();
  }, [id]);

  const handleStatusChange = async (newStatus, notes = null) => {
    setStatusSubmitting(true);
    try {
      await ticketApi.updateStatus(id, {
        status: newStatus,
        resolutionNotes: notes,
      });
      await fetchTicket();
      setResolveModalOpen(false);
      setCloseConfirmOpen(false);
      setResolutionNotes('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    try {
      await ticketApi.updatePriority(id, { priority: newPriority });
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update priority');
    }
  };

  const handleAssignAgent = async (agentId) => {
    try {
      await ticketApi.assignTicket(id, { assignedToId: Number(agentId) });
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      await commentApi.addComment(id, { commentText: newComment.trim() });
      setNewComment('');
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await attachmentApi.uploadAttachment(id, formData);
      await fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setUploading(false);
      e.target.value = '';
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

  if (loading) {
    return <LoadingSpinner fullPage={false} message="Loading ticket details..." />;
  }

  if (error || !ticketData) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-8 rounded-2xl text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-base">Error Loading Ticket</h3>
        <p className="text-xs text-rose-600 mt-1">{error || 'Ticket not found'}</p>
        <button
          onClick={() => navigate('/tickets')}
          className="mt-4 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition"
        >
          Return to Tickets
        </button>
      </div>
    );
  }

  const { ticket, comments, attachments, history } = ticketData;

  const canManageAssignment = isAdmin || isAgent;
  const canManagePriority = isAdmin || isAgent;
  const isTicketCreator = user?.id === ticket.createdBy?.id;
  const canCloseTicket = isTicketCreator || isAdmin;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 leading-snug">
              {ticket.title}
            </h1>
          </div>
        </div>

        {/* Workflow Transition Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Transition: OPEN -> ASSIGNED / IN_PROGRESS */}
          {ticket.status === 'OPEN' && canManageAssignment && (
            <>
              <button
                onClick={() => handleAssignAgent(user.id)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                Assign to Me
              </button>
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition shadow-sm"
              >
                Start Progress
              </button>
            </>
          )}

          {/* Transition: ASSIGNED -> IN_PROGRESS */}
          {ticket.status === 'ASSIGNED' && (canManageAssignment || isTicketCreator) && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition shadow-sm"
            >
              Start Investigation
            </button>
          )}

          {/* Transition: IN_PROGRESS -> RESOLVED */}
          {ticket.status === 'IN_PROGRESS' && (isAdmin || isAgent) && (
            <button
              onClick={() => setResolveModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              Mark as Resolved
            </button>
          )}

          {/* Transition: RESOLVED -> CLOSED */}
          {ticket.status === 'RESOLVED' && canCloseTicket && (
            <button
              onClick={() => setCloseConfirmOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition shadow-sm"
            >
              Confirm & Close Ticket
            </button>
          )}

          {/* Reopen button for RESOLVED or CLOSED */}
          {(ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (isTicketCreator || isAdmin) && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition"
            >
              Reopen Ticket
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Details & Right Metadata Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Description, Resolution Notes, Tabs (Comments / Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Description Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Issue Description
            </h2>
            <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans">
              {ticket.description}
            </div>

            {/* Resolution Notes Box if resolved or closed */}
            {ticket.resolutionNotes && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Resolution Summary
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap">
                  {ticket.resolutionNotes}
                </p>
                {ticket.resolvedAt && (
                  <span className="text-[10px] text-emerald-700 block mt-2">
                    Resolved at {formatDate(ticket.resolvedAt)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Attachments Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5" />
                Attachments ({attachments.length})
              </h2>

              <label className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Add Attachment'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No attachments uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-800 truncate" title={att.originalFilename}>
                          {att.originalFilename}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {(att.fileSize / 1024).toFixed(1)} KB • {att.uploadedBy?.fullName}
                        </p>
                      </div>
                    </div>
                    <a
                      href={att.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-200 rounded-lg transition"
                      title="Download file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discussion & Activity Timeline Tabs */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200 px-6 pt-4 gap-4">
              <button
                onClick={() => setActiveTab('discussion')}
                className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'discussion'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Comments & Discussion ({comments.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'history'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Audit Trail & History ({history.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'discussion' ? (
                <div className="space-y-6">
                  {/* Comments List */}
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No comments yet. Start the conversation below.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-900">
                                {c.user?.fullName}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  c.user?.role === 'ADMIN'
                                    ? 'bg-purple-100 text-purple-700'
                                    : c.user?.role === 'SUPPORT_AGENT'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {c.user?.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {formatDate(c.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {c.commentText}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Box */}
                  <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Leave a response
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type updates, diagnostic logs, or clarifications..."
                        className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={commentSubmitting || !newComment.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {commentSubmitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Activity Timeline / Audit Log */
                <div className="flow-root">
                  <ul className="-mb-8">
                    {history.map((event, eventIdx) => (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {eventIdx !== history.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center ring-8 ring-white text-xs font-bold">
                                {eventIdx + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs font-bold text-slate-900">
                                  {event.action}
                                </p>
                                <p className="text-xs text-slate-600 mt-0.5">
                                  {event.details}
                                </p>
                              </div>
                              <div className="text-right text-[11px] whitespace-nowrap text-slate-400">
                                {formatDate(event.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket Metadata & Management Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-3">
              Ticket Details
            </h3>

            {/* Category */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Category
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mt-1">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                {ticket.category?.name}
              </div>
            </div>

            {/* Priority Selector (Admin/Agent) or Display */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Priority
              </span>
              {canManagePriority ? (
                <select
                  value={ticket.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="mt-1 w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              ) : (
                <div className="mt-1">
                  <PriorityBadge priority={ticket.priority} />
                </div>
              )}
            </div>

            {/* Assigned Agent Selector (Admin/Agent) or Display */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Assigned Support Specialist
              </span>
              {canManageAssignment ? (
                <select
                  value={ticket.assignedTo?.id || ''}
                  onChange={(e) => handleAssignAgent(e.target.value)}
                  className="mt-1 w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-indigo-500"
                >
                  <option value="" disabled>Select Support Agent</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.fullName} ({ag.email})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs font-medium text-slate-800 mt-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  {ticket.assignedTo ? ticket.assignedTo.fullName : 'Unassigned'}
                </p>
              )}
            </div>

            {/* Created By */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Submitted By
              </span>
              <p className="text-xs font-medium text-slate-800 mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {ticket.createdBy?.fullName} ({ticket.createdBy?.email})
              </p>
            </div>

            {/* Created At */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Created Timestamp
              </span>
              <p className="text-xs font-medium text-slate-800 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(ticket.createdAt)}
              </p>
            </div>

            {/* Updated At */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Last Updated
              </span>
              <p className="text-xs font-medium text-slate-800 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(ticket.updatedAt)}
              </p>
            </div>

            {/* Closed Date */}
            {ticket.closedAt && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Closed Timestamp
                </span>
                <p className="text-xs font-medium text-slate-800 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  {formatDate(ticket.closedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Ticket Modal */}
      {resolveModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setResolveModalOpen(false)}
            />
            <div className="relative bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Mark Ticket as Resolved
              </h3>
              <p className="text-xs text-slate-500">
                Please document the solution steps and root cause analysis. This information will be visible to the requester upon confirmation.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain how the issue was fixed, patch versions applied, or hardware replaced..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={statusSubmitting || !resolutionNotes.trim()}
                  onClick={() => handleStatusChange('RESOLVED', resolutionNotes)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition disabled:opacity-50"
                >
                  {statusSubmitting ? 'Saving...' : 'Submit Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Close Modal */}
      <ConfirmModal
        isOpen={closeConfirmOpen}
        title="Confirm Resolution & Close Ticket"
        message="Are you satisfied that the issue has been completely resolved? Closing the ticket will archive it in your completed records."
        confirmText="Confirm & Close"
        confirmVariant="success"
        loading={statusSubmitting}
        onClose={() => setCloseConfirmOpen(false)}
        onConfirm={() => handleStatusChange('CLOSED')}
      />
    </div>
  );
};

export default TicketDetails;
