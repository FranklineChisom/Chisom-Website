'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Publication } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
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

const AdminPagination: React.FC<{ 
    total: number, 
    limit: number, 
    page: number, 
    setPage: (p: number) => void 
}> = ({ total, limit, page, setPage }) => {
    const totalPages = Math.ceil(total / limit);
    if (totalPages <= 1) return null;

    return (
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
    );
};

export default function PubManager() {
  usePageTitle('Manage Publications - Admin');
  const { publications, addPublication, updatePublication, deletePublication } = useData();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPub, setCurrentPub] = useState<Partial<Publication>>({});
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [coAuthorsInput, setCoAuthorsInput] = useState('');
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

  const sortedPubs = [...publications].sort((a, b) => parseInt(b.year) - parseInt(a.year));

  const handleEdit = (pub: Publication) => {
    setCurrentPub(pub);
    setCoAuthorsInput(pub.coAuthors ? pub.coAuthors.join(', ') : '');
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentPub({ 
      id: 'p' + Date.now().toString(), 
      featured: false, 
      type: 'Journal Article', 
      coAuthors: [],
      year: new Date().getFullYear().toString(),
      published: false
    });
    setCoAuthorsInput('');
    setIsEditing(true);
  };

  const handleSave = async (publishedStatus: boolean) => {
    if (!currentPub.title) { showToast('Title is required', 'error'); return; }
    setIsSaving(true);
    const coAuthorsArray = coAuthorsInput.split(',').map(s => s.trim()).filter(s => s !== '');
    const pubToSave = { ...currentPub, coAuthors: coAuthorsArray, published: publishedStatus } as Publication;

    let success;
    if (publications.find(p => p.id === currentPub.id)) success = await updatePublication(pubToSave);
    else success = await addPublication(pubToSave);

    setIsSaving(false);
    if(success) {
        showToast(publishedStatus ? 'Publication Published!' : 'Draft Saved', 'success');
        setIsEditing(false);
        setCoAuthorsInput('');
    } else {
        showToast('Failed to save publication', 'error');
    }
  };

  const confirmDelete = (id: string) => {
      setDeleteModal({ isOpen: true, id });
  }

  const handleDelete = async () => {
      if(deleteModal.id) {
          setIsDeleting(true);
          try {
            const success = await deletePublication(deleteModal.id);
            setDeleteModal({ isOpen: false, id: null });
            if (success) showToast('Publication deleted', 'success');
            else showToast('Failed to delete publication', 'error');
          } finally {
            setIsDeleting(false);
          }
      }
  }

  const paginatedPubs = sortedPubs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal({ isOpen: false, id: null })}
        title="Delete Publication?"
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
        <p>Are you sure you want to delete this publication? This will remove it from your research list.</p>
      </Modal>

      {isEditing ? (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-serif text-slate-800">{currentPub.title ? 'Edit Publication' : 'New Publication'}</h2>
            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-200/60">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
              <input 
                type="text" 
                required 
                className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                value={currentPub.title || ''} 
                onChange={e => setCurrentPub({...currentPub, title: e.target.value})} 
                placeholder="Enter publication title..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Publisher / Venue</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    value={currentPub.venue || ''} 
                    onChange={e => setCurrentPub({...currentPub, venue: e.target.value})} 
                    placeholder="e.g. Oxford University Press"
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Year</label>
                  <input 
                    type="number" 
                    required 
                    min="1900" 
                    max="2100" 
                    className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    value={currentPub.year || ''} 
                    onChange={e => setCurrentPub({...currentPub, year: e.target.value})} 
                  />
               </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Co-Authors (comma separated)</label>
              <input 
                type="text" 
                className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                value={coAuthorsInput} 
                onChange={e => setCoAuthorsInput(e.target.value)} 
                placeholder="e.g. Jane Smith, John Doe" 
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                  <div className="relative">
                    <select 
                        className="w-full border border-slate-200 rounded-md p-3 appearance-none focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white"
                        value={currentPub.type || 'Journal Article'} 
                        onChange={e => setCurrentPub({...currentPub, type: e.target.value as any})}
                    >
                        <option>Journal Article</option>
                        <option>Book Chapter</option>
                        <option>Policy Paper</option>
                        <option>Conference Paper</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
               </div>
               <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        id="featured" 
                        checked={currentPub.featured || false} 
                        onChange={e => setCurrentPub({...currentPub, featured: e.target.checked})} 
                        className="w-5 h-5 border-2 border-slate-300 rounded text-primary focus:ring-primary cursor-pointer" 
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">Mark as Featured Work</span>
                  </label>
               </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Abstract</label>
              <textarea 
                rows={4} 
                className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
                value={currentPub.abstract || ''} 
                onChange={e => setCurrentPub({...currentPub, abstract: e.target.value})} 
                placeholder="Brief summary of the work..."
              />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Link (URL)</label>
              <input 
                type="url" 
                className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                value={currentPub.link || ''} 
                onChange={e => setCurrentPub({...currentPub, link: e.target.value})} 
                placeholder="https://..."
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors w-full sm:w-auto text-center">Cancel</button>
              <button 
                type="button" 
                onClick={() => handleSave(false)} 
                disabled={isSaving} 
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 hover:border-slate-400 font-medium disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                  {isSaving && !currentPub.published && <Loader2 size={16} className="animate-spin" />}
                  {isSaving && !currentPub.published ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                type="button" 
                onClick={() => handleSave(true)} 
                disabled={isSaving} 
                className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-slate-800 font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
              >
                  {isSaving && currentPub.published && <Loader2 size={16} className="animate-spin" />}
                  {isSaving && currentPub.published ? 'Publishing...' : (currentPub.published ? 'Update' : 'Publish')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-serif text-slate-800">Publications</h2>
                <p className="text-slate-500 text-sm mt-1">Manage your academic and policy papers</p>
            </div>
            <button onClick={handleCreate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium w-full md:w-auto justify-center">
              <Plus size={18} /> New Publication
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 md:p-5 min-w-[200px]">Title</th>
                    <th className="p-3 md:p-5">Status</th>
                    <th className="p-3 md:p-5 hidden sm:table-cell">Publisher</th>
                    <th className="p-3 md:p-5 hidden sm:table-cell">Year</th>
                    <th className="p-3 md:p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedPubs.map(pub => (
                    <tr key={pub.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-3 md:p-5 font-medium text-slate-800">
                        {pub.title}
                        {pub.featured && <span className="ml-2 text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-1.5 py-0.5 rounded uppercase tracking-wide font-bold">Featured</span>}
                         {pub.coAuthors && pub.coAuthors.length > 0 && <div className="text-xs text-slate-400 mt-1">w/ {pub.coAuthors.join(', ')}</div>}
                      </td>
                      <td className="p-3 md:p-5"><StatusBadge published={pub.published} /></td>
                      <td className="p-3 md:p-5 text-slate-500 text-sm hidden sm:table-cell">{pub.venue}</td>
                      <td className="p-3 md:p-5 text-slate-500 text-sm font-mono hidden sm:table-cell">{pub.year}</td>
                      <td className="p-3 md:p-5 text-right whitespace-nowrap">
                         <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(pub)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors" title="Edit">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => confirmDelete(pub.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                   {paginatedPubs.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                                No publications found. Add your research work here.
                            </td>
                        </tr>
                    )}
                </tbody>
              </table>
            </div>
            <AdminPagination total={sortedPubs.length} limit={ITEMS_PER_PAGE} page={page} setPage={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}