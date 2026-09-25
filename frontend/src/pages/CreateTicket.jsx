import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketApi, categoryApi } from '../api/axiosClient';
import {
  PlusCircle,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const PRIORITIES = [
  { value: 'LOW', label: 'Low', desc: 'General queries, minor inconvenience' },
  { value: 'MEDIUM', label: 'Medium', desc: 'Standard business issues affecting single user' },
  { value: 'HIGH', label: 'High', desc: 'Critical functionality impaired, deadline risk' },
  { value: 'CRITICAL', label: 'Critical', desc: 'System-wide outage or security breach' },
];

const CreateTicket = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [file, setFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getCategories(false);
        const cats = res.data.data || [];
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    loadCategories();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Check size (10MB limit)
    if (selected.size > 10 * 1024 * 1024) {
      setError('Selected file exceeds maximum limit of 10MB');
      return;
    }

    // Check extension
    const filename = selected.name.toLowerCase();
    const disallowed = ['.exe', '.bat', '.sh', '.bin', '.msi', '.vbs', '.cmd', '.jar'];
    if (disallowed.some((ext) => filename.endsWith(ext))) {
      setError('Executable files are strictly prohibited for security compliance');
      return;
    }

    setError('');
    setFile(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }

    if (description.trim().length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    if (!categoryId) {
      setError('Please select an issue category');
      return;
    }

    setSubmitting(true);

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('categoryId', categoryId);
        formData.append('priority', priority);
        formData.append('file', file);
        res = await ticketApi.createTicketMultipart(formData);
      } else {
        res = await ticketApi.createTicketJson({
          title: title.trim(),
          description: description.trim(),
          categoryId: Number(categoryId),
          priority,
        });
      }

      setCreatedTicket(res.data.data);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit service ticket. Please review your inputs.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setFile(null);
    setPriority('MEDIUM');
    setCreatedTicket(null);
    setError('');
  };

  // If ticket was successfully created, show confirmation view
  if (createdTicket) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Ticket Created Successfully
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Your incident has been registered in the system and queued for IT triage.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 max-w-sm mx-auto">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500 block">
              Generated Ticket Identifier
            </span>
            <span className="font-mono text-2xl font-bold text-indigo-700 tracking-wider">
              {createdTicket.ticketNumber}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/tickets/${createdTicket.id}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
            >
              View Ticket Details
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Support Request
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Provide complete details and attachments to expedite resolution by IT specialists
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {/* Ticket Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Issue Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Outlook fails to send outgoing attachments after VPN connection"
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            {title.length}/200 characters (minimum 5)
          </span>
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} — {cat.description}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label} ({p.desc})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={5}
            maxLength={5000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the steps to reproduce the issue, exact error messages observed, and any troubleshooting already attempted..."
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            {description.length}/5000 characters (minimum 10)
          </span>
        </div>

        {/* File Attachment Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Screenshot or Document Attachment (Optional)
          </label>

          {!file ? (
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Click or drag & drop file to upload
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, PDF, DOCX, TXT, ZIP up to 10MB. Executables prohibited.
              </p>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.txt,.zip,.log"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs font-medium text-slate-800 truncate max-w-xs sm:max-w-md">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-md transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Support Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTicket;
