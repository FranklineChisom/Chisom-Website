'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Eye, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Newsletter } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toInputDate, fromInputDate, generateSlug } from '../adminUtils';
import MediaLibrary from '@/components/MediaLibrary';
import Modal from '@/components/Modal';

const StatusBadge: React.FC<{ published: boolean }> = ({ published }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 ${
    published 
      ? 'bg-green-50 text-green-700 border-green-200' 
      : 'bg-amber-50 text-amber-700 border-amber-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${published ? 'bg-green-500' : 'bg-amber-500'}`}></span>
    {published ? 'Published' : 'Draft'}
  </span>
);

const NewsletterManager: React.FC = () => {
  usePageTitle('Manage Newsletter - Admin');
  const { newsletters, addNewsletter, updateNewsletter, deleteNewsletter } = useData();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [page, setPage] = useState(1);
  
  // Modal States
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
  const [previewModal, setPreviewModal] = useState(false);

  const ITEMS_PER_PAGE = 8;

  const [current, setCurrent] = useState<Newsletter>({
    id: '', slug: '', title: '', date: '', description: '', content: '', coverImage: '', published: false
  });

  const handleEdit = (item: Newsletter) => {
    setCurrent(item);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrent({ 
      id: 'n' + Date.now().toString(), 
      slug: '',
      title: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      description: '',
      content: '',
      coverImage: '',
      published: false
    });
    setIsEditing(true);
  };

  const handlePreview = async () => {
    setPreviewModal(true);
  };

  const confirmPreview = async () => {
      setPreviewModal(false);
      const success = await handleSave(current.published);
      if (success) {
          window.open(`/preview?type=newsletter&id=${current.id}`, '_blank');
      }
  }

  const handleSave = async (publishedStatus: boolean): Promise<boolean> => {
    if (!current.title || !current.content) {
        showToast('Title and Content required', 'error');
        return false;
    }
    
    setIsSaving(true);
    // Auto-generate slug
    const updated = {
        ...current,
        slug: current.slug || generateSlug(current.title),
        published: publishedStatus
    };

    let success;
    if (newsletters.some(n => n.id === updated.id)) {
      success = await updateNewsletter(updated);
    } else {
      success = await addNewsletter(updated);
    }

    setIsSaving(false);
    if (success) {
        const msg = publishedStatus ? 'Issue Published!' : 'Draft Saved';
        showToast(msg, 'success');
        return true;
    } else {
        showToast('Failed to save issue', 'error');
        return false;
    }
  };

  const handleSaveAndClose = async (status: boolean) => {
      const success = await handleSave(status);
      if(success) setIsEditing(false);
  }

  const confirmDelete = (id: string) => {
      setDeleteModal({ isOpen: true, id });
  }

  const handleDelete = async () => {
      if (deleteModal.id) {
          setIsDeleting(true);
          try {
            const success = await deleteNewsletter(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
            if (success) showToast('Issue deleted', 'success');
            else showToast('Failed to delete issue', 'error');
          } finally {
            setIsDeleting(false);
          }
      }
  }

  const handleImageSelect = (url: string) => {
    setCurrent({ ...current, coverImage: url });
    setShowMediaLibrary(false);
  };

  const paginatedNewsletters = newsletters.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(newsletters.length / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Media Library */}
       {showMediaLibrary && (
            <MediaLibrary 
                onSelect={handleImageSelect} 
                onClose={() => setShowMediaLibrary(false)} 
            />
        )}

       {/* Delete Modal */}
       <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal({ isOpen: false, id: null })}
        title="Delete Newsletter?"
        type="danger"
        actions={
            <>
                <button 
                    onClick={() => setDeleteModal({ isOpen: false, id: null })} 
                    disabled={isDeleting}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleDelete} 
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
                >
                    {isDeleting && <Loader2 size={14} className="animate-spin" />}
                    {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
            </>
        }
      >
        <p>Are you sure you want to delete this newsletter issue? This will remove it from the public archive.</p>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={previewModal}
        onClose={() => setPreviewModal(false)}
        title="Preview Newsletter"
        type="info"
        actions={
            <>
                <button onClick={() => setPreviewModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">Cancel</button>
                <button onClick={confirmPreview} className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">Save & Open Preview</button>
            </>
        }
      >
        <p>We need to save your changes before generating the preview. Proceed?</p>
      </Modal>

      {isEditing ? (
      <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-serif text-slate-800">{current.title ? 'Edit Issue' : 'New Issue'}</h2>
          <div className="flex gap-2">
             <button 
                onClick={handlePreview} 
                disabled={isSaving}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors text-sm font-medium rounded-full"
             >
                <Eye size={16} /> <span className="hidden sm:inline">Preview</span>
             </button>
             <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-200/60">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issue Title</label>
            <input 
              type="text"
              className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              value={current.title} 
              onChange={e => setCurrent({...current, title: e.target.value})} 
              required
              placeholder="e.g. Issue #5: The Future of Finance"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input 
                  type="date"
                  className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  value={toInputDate(current.date)} 
                  onChange={e => setCurrent({...current, date: fromInputDate(e.target.value)})} 
                  required
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cover Image</label>
                <div className="flex gap-2">
                    <input 
                    type="url"
                    className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    value={current.coverImage || ''} 
                    onChange={e => setCurrent({...current, coverImage: e.target.value})} 
                    placeholder="https://..."
                    />
                    <button 
                        type="button"
                        onClick={() => setShowMediaLibrary(true)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-md transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
                    >
                        <ImageIcon size={18} /> <span className="hidden sm:inline">Library</span>
                    </button>
                </div>
                {current.coverImage && (
                    <div className="mt-3 h-32 w-full bg-slate-50 border border-slate-100 rounded-md overflow-hidden relative group">
                        <img src={current.coverImage} alt="Preview" className="h-full w-full object-contain" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    </div>
                )}
             </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Short Description</label>
            <textarea 
              rows={2}
              className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
              value={current.description} 
              onChange={e => setCurrent({...current, description: e.target.value})} 
              required
              placeholder="A brief summary for the archive list..."
            />
          </div>
          
          <div className="pt-2">
            <MarkdownEditor 
                label="Content (Markdown)" 
                value={current.content} 
                onChange={val => setCurrent({...current, content: val})} 
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors w-full sm:w-auto text-center">Cancel</button>
            <button 
                type="button" 
                onClick={() => handleSaveAndClose(false)} 
                disabled={isSaving} 
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 hover:border-slate-400 font-medium disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
            >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
                type="button" 
                onClick={() => handleSaveAndClose(true)} 
                disabled={isSaving} 
                className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-slate-800 font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
            >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
                {isSaving ? 'Saving...' : (current.published ? 'Update Issue' : 'Publish Issue')}
            </button>
          </div>
        </form>
      </div>
    ) : (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-serif text-slate-800">Newsletter</h2>
            <p className="text-slate-500 text-sm mt-1">Manage email campaigns and issues</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium w-full md:w-auto justify-center">
          <Plus size={18} /> New Issue
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3 md:p-5 min-w-[250px]">Title</th>
                <th className="p-3 md:p-5">Status</th>
                <th className="p-3 md:p-5 hidden sm:table-cell">Date</th>
                <th className="p-3 md:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedNewsletters.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-3 md:p-5 font-medium text-slate-800">
                    {item.title}
                    <div className="sm:hidden text-xs text-slate-400 mt-1">{item.date}</div>
                  </td>
                  <td className="p-3 md:p-5"><StatusBadge published={item.published} /></td>
                  <td className="p-3 md:p-5 text-slate-500 font-mono text-xs whitespace-nowrap hidden sm:table-cell">{item.date}</td>
                  <td className="p-3 md:p-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors" title="Edit">
                            <Edit2 size={16} />
                        </button>
                        <button onClick={() => confirmDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
               {paginatedNewsletters.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                            No newsletters found. Draft your first issue today.
                        </td>
                    </tr>
                )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                <span className="text-xs text-slate-500">Showing page {page} of {totalPages}</span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPage(page - 1)} 
                        disabled={page === 1}
                        className={`p-1.5 rounded-md border transition-all ${
                            page === 1
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary bg-white shadow-sm'
                        }`}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        onClick={() => setPage(page + 1)} 
                        disabled={page === totalPages}
                        className={`p-1.5 rounded-md border transition-all ${
                            page === totalPages
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                : 'border-slate-200 text-slate-600 hover:border-primary hover:text-primary bg-white shadow-sm'
                        }`}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
    )}
    </div>
  );
};

export default NewsletterManager;