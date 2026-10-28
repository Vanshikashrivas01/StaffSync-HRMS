import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Announcement, AnnouncementPriority, AnnouncementCategory } from '../types/index.ts';
import { 
  Megaphone, 
  Pin, 
  Plus, 
  Trash2, 
  X, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Sparkles 
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { role } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    content: '',
    priority: 'normal' as AnnouncementPriority,
    category: 'general' as AnnouncementCategory,
    pinned: false,
  });

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.announcements.getAll();
      setAnnouncements(res.announcements || []);
    } catch (err: any) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.announcements.create(form);
      setIsModalOpen(false);
      setForm({
        title: '',
        content: '',
        priority: 'normal',
        category: 'general',
        pinned: false,
      });
      await loadAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      await api.announcements.delete(id);
      await loadAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Company Announcements & Bulletin Board
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay aligned on company-wide news, organizational policy changes, and events.
          </p>
        </div>

        {role === 'hr' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {announcements.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No company announcements posted yet.
          </div>
        ) : (
          announcements.map((ann) => {
            const creatorName = typeof ann.createdBy === 'object' ? ann.createdBy?.name : 'HR Team';
            const creatorTitle = typeof ann.createdBy === 'object' ? ann.createdBy?.designation : 'People Operations';

            return (
              <div
                key={ann._id}
                className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                  ann.pinned ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {ann.pinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        ann.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                        ann.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ann.priority}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 capitalize">
                        {ann.category}
                      </span>
                    </div>

                    {role === 'hr' && (
                      <button
                        onClick={() => handleDelete(ann._id, ann.title)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {ann.content}
                  </p>
                </div>

                {/* Footer with author & date */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-700">{creatorName}</span>
                    <span>&bull; {creatorTitle}</span>
                  </div>
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Announcement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Post New Company Announcement
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Q4 Townhall Meeting Schedule"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as AnnouncementCategory })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="policy">Company Policy</option>
                    <option value="event">Corporate Event</option>
                    <option value="holiday">Holiday / Camp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Body</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Draft details and instructions for the company..."
                />
              </div>

              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Pin this notice to the top of the bulletin board</span>
              </label>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
