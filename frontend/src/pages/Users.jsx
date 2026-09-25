import React, { useState, useEffect } from 'react';
import { userApi } from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import {
  Users as UsersIcon,
  UserPlus,
  Shield,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Lock,
  Mail,
  User,
  ShieldAlert,
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Create User Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'SUPPORT_AGENT',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit User Modal
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: 'SUPPORT_AGENT',
    status: 'ACTIVE',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Status toggle confirmation
  const [toggleConfirmUser, setToggleConfirmUser] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userApi.getUsers();
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSubmitting(true);
    try {
      await userApi.createUser(createForm);
      setCreateModalOpen(false);
      setCreateForm({
        fullName: '',
        email: '',
        password: '',
        role: 'SUPPORT_AGENT',
      });
      await fetchUsers();
    } catch (err) {
      setCreateError(
        err.response?.data?.message || 'Failed to create user account'
      );
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    try {
      await userApi.updateUser(editUser.id, editForm);
      setEditUser(null);
      await fetchUsers();
    } catch (err) {
      setEditError(
        err.response?.data?.message || 'Failed to update user profile'
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleConfirmUser) return;
    setToggleLoading(true);
    try {
      await userApi.toggleStatus(toggleConfirmUser.id);
      setToggleConfirmUser(null);
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setToggleLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesSearch =
      !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Directory & Access Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Provision support personnel, manage role assignments, and govern account lifecycles
          </p>
        </div>
        <button
          onClick={() => {
            setCreateError('');
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Personnel
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by full name or corporate email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 focus:ring-indigo-500 w-full sm:w-auto"
        >
          <option value="">All Roles ({users.length})</option>
          <option value="ADMIN">Administrators</option>
          <option value="SUPPORT_AGENT">Support Agents</option>
          <option value="EMPLOYEE">Employees</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching user directory..." />
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UsersIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No Users Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No registered user profiles matched your current search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Corporate Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                          {u.fullName.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-900">
                          {u.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.role === 'SUPPORT_AGENT'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        )}
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setEditForm({
                            fullName: u.fullName,
                            role: u.role,
                            status: u.status,
                          });
                          setEditError('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition mr-1"
                        title="Edit profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setToggleConfirmUser(u)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                          u.status === 'ACTIVE'
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setCreateModalOpen(false)}
            />
            <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Provision New Team Account
              </h3>

              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, fullName: e.target.value })
                    }
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    placeholder="radams@company.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Role
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50"
                  >
                    {createSubmitting ? 'Provisioning...' : 'Provision User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setEditUser(null)}
            />
            <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Modify User Profile: {editUser.fullName}
              </h3>

              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditUser(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition disabled:opacity-50"
                  >
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      <ConfirmModal
        isOpen={!!toggleConfirmUser}
        title={`${
          toggleConfirmUser?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'
        } Account`}
        message={`Are you sure you want to ${
          toggleConfirmUser?.status === 'ACTIVE' ? 'deactivate' : 'activate'
        } user ${toggleConfirmUser?.fullName}? ${
          toggleConfirmUser?.role === 'ADMIN'
            ? 'Safety policy prevents deactivating the last active administrator.'
            : ''
        }`}
        confirmText={
          toggleConfirmUser?.status === 'ACTIVE'
            ? 'Yes, Deactivate'
            : 'Yes, Activate'
        }
        confirmVariant={
          toggleConfirmUser?.status === 'ACTIVE' ? 'danger' : 'success'
        }
        loading={toggleLoading}
        onClose={() => setToggleConfirmUser(null)}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
};

export default Users;
