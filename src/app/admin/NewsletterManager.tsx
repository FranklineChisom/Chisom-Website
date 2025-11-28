import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Eye, Image as ImageIcon } from 'lucide-react';
import { Newsletter } from '../../types';
import MarkdownEditor from '../../components/MarkdownEditor';
import { useData } from '../../contexts/DataContext';
import { useToast } from '../../contexts/ToastContext';
import { usePageTitle } from '../../hooks/usePageTitle';
import { toInputDate, fromInputDate, generateSlug } from './adminUtils';
import MediaLibrary from '../../components/MediaLibrary';

const StatusBadge: React.FC<{ published: boolean }> = ({ published }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
  }`}>
    {published ? 'Published' : 'Draft'}
  </span>
);

const NewsletterManager: React.FC = () => {
  usePageTitle('Manage Newsletter - Admin');
  const { newsletters, addNewsletter, updateNewsletter, deleteNewsletter } = useData();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [page, setPage] = useState(1);
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
    const success = await handleSave(current.published);
    if (success) {
        window.open(`/preview?type=newsletter&id=${current.id}`, '_blank');
    }
  };

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

  const handleDelete = async (id: string) => {
      if(window.confirm('Delete this newsletter issue?')) {
          const success = await deleteNewsletter(id);
          if (success) showToast('Issue deleted', 'success');
          else showToast('Failed to delete issue', 'error');
      }
  }

  const handleImageSelect = (url: string) => {
    setCurrent({ ...current, coverImage: url });
    setShowMediaLibrary(false);
  };

  const paginatedNewsletters = newsletters.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(newsletters.length / ITEMS_PER_PAGE);

  if (isEditing) {
    return (
      <div className="max-w-4xl">
        {showMediaLibrary && (
            <MediaLibrary 
                onSelect={handleImageSelect} 
                onClose={() => setShowMediaLibrary(false)} 
            />
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-slate-800">{current.title ? 'Edit Issue' : 'New Issue'}</h2>
          <div className="flex gap-2">
             <button 
                onClick={handlePreview} 
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors text-sm font-medium"
             >
                <Eye size={16} /> Preview
             </button>
             <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-800"><X /></button>
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 bg-white p-8 rounded-none shadow-sm border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
            <input 
              type="text"
              className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
              value={current.title} 
              onChange={e => setCurrent({...current, title: e.target.value})} 
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date"
                  className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
                  value={toInputDate(current.date)} 
                  onChange={e => setCurrent({...current, date: fromInputDate(e.target.value)})} 
                  required
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image</label>
                <div className="flex gap-2">
                    <input 
                    type="url"
                    className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
                    value={current.coverImage || ''} 
                    onChange={e => setCurrent({...current, coverImage: e.target.value})} 
                    placeholder="https://..."
                    />
                    <button 
                        type="button"
                        onClick={() => setShowMediaLibrary(true)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <ImageIcon size={18} /> Library
                    </button>
                </div>
                {current.coverImage && (
                    <div className="mt-2 h-32 w-full bg-slate-50 border border-slate-100 rounded overflow-hidden">
                        <img src={current.coverImage} alt="Preview" className="h-full w-full object-contain" />
                    </div>
                )}
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Short Description (for homepage)</label>
            <textarea 
              rows={2}
              className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
              value={current.description} 
              onChange={e => setCurrent({...current, description: e.target.value})} 
              required
            />
          </div>
          <MarkdownEditor 
            label="Content (Markdown Supported)" 
            value={current.content} 
            onChange={val => setCurrent({...current, content: val})} 
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-none">Cancel</button>
            <button 
                type="button" 
                onClick={() => handleSaveAndClose(false)} 
                disabled={isSaving} 
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-none hover:bg-slate-50 disabled:opacity-50"
            >
                {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
                type="button" 
                onClick={() => handleSaveAndClose(true)} 
                disabled={isSaving} 
                className="px-6 py-2 bg-primary text-white rounded-none hover:bg-slate-800 disabled:opacity-50"
            >
                {isSaving ? 'Saving...' : (current.published ? 'Update' : 'Publish')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif text-slate-800">Newsletter</h2>
        <button onClick={handleCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-none hover:bg-slate-800 transition-colors">
          <Plus size={18} /> New Issue
        </button>
      </div>
      <div className="bg-white rounded-none shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-medium text-slate-500 text-sm min-w-[200px]">Title</th>
                <th className="p-4 font-medium text-slate-500 text-sm">Status</th>
                <th className="p-4 font-medium text-slate-500 text-sm">Date</th>
                <th className="p-4 font-medium text-slate-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedNewsletters.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{item.title}</td>
                  <td className="p-4"><StatusBadge published={item.published} /></td>
                  <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{item.date}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-primary mr-3"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-slate-100 bg-slate-50">
                <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1}
                    className={`p-1 rounded-none ${page === 1 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                    <ChevronLeft size={16} />
                </button>
                <span className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</span>
                <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={page === totalPages}
                    className={`p-1 rounded-none ${page === totalPages ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-200'}`}
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManager;