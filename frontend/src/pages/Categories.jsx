import React, { useState, useEffect } from 'react';
import { categoryApi } from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FolderTree,
  PlusCircle,
  Edit2,
  CheckCircle,
  XCircle,
  Tag,
  ShieldAlert,
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', isActive: true });
  const [createError, setCreateError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Edit Modal
  const [editCategory, setEditCategory] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', isActive: true });
  const [editError, setEditError] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getCategories(true);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSubmitting(true);
    try {
      await categoryApi.createCategory(createForm);
      setCreateModalOpen(false);
      setCreateForm({ name: '', description: '', isActive: true });
      await fetchCategories();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    try {
      await categoryApi.updateCategory(editCategory.id, editForm);
      setEditCategory(null);
      await fetchCategories();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update category');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await categoryApi.updateCategory(category.id, {
        name: category.name,
        description: category.description,
        isActive: !category.isActive,
      });
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category status');
    }
  };

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
            Service Catalog & Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure incident classifications, routing groups, and departmental service areas
          </p>
        </div>
        <button
          onClick={() => {
            setCreateError('');
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Loading service categories..." />
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FolderTree className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No Categories Defined</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Add IT classification categories to organize support workflows.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      {c.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">
                      {c.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {c.isActive ? (
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3 h-3 text-slate-400" />
                        )}
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditCategory(c);
                          setEditForm({
                            name: c.name,
                            description: c.description || '',
                            isActive: c.isActive,
                          });
                          setEditError('');
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition mr-1"
                        title="Edit category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                          c.isActive
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setCreateModalOpen(false)}
            />
            <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                New Service Category
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
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    placeholder="e.g. Cloud Infrastructure"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={createForm.description}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, description: e.target.value })
                    }
                    placeholder="Brief description of the requests falling under this group..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="createActive"
                    checked={createForm.isActive}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, isActive: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="createActive" className="text-xs text-slate-700 select-none">
                    Active (visible in ticket creation form)
                  </label>
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
                    {createSubmitting ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setEditCategory(null)}
            />
            <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                Modify Category: {editCategory.name}
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
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editActive"
                    checked={editForm.isActive}
                    onChange={(e) =>
                      setEditForm({ ...editForm, isActive: e.target.checked })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="editActive" className="text-xs text-slate-700 select-none">
                    Active (visible in ticket creation form)
                  </label>
                </div>

                <div className="flex justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditCategory(null)}
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
    </div>
  );
};

export default Categories;
