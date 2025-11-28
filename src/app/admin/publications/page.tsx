'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Publication } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';

// Helper Component for this page
const StatusBadge: React.FC<{ published: boolean }> = ({ published }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
  }`}>
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
    );
};

export default function PubManager() {
  usePageTitle('Manage Publications - Admin');
  const { publications, addPublication, updatePublication, deletePublication } = useData();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPub, setCurrentPub] = useState<Partial<Publication>>({});
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [coAuthorsInput, setCoAuthorsInput] = useState('');

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

  const handleDelete = async (id: string) => {
      if(window.confirm('Delete this publication?')) {
          const success = await deletePublication(id);
          if (success) showToast('Publication deleted', 'success');
          else showToast('Failed to delete publication', 'error');
      }
  }

  const paginatedPubs = sortedPubs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div>
      {isEditing ? (
        <div className="max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif text-slate-800">{currentPub.title ? 'Edit Publication' : 'New Publication'}</h2>
            <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-800"><X /></button>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 bg-white p-8 rounded-none shadow-sm border border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" required className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none" value={currentPub.title || ''} onChange={e => setCurrentPub({...currentPub, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Publisher</label>
                  <input type="text" required className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none" value={currentPub.venue || ''} onChange={e => setCurrentPub({...currentPub, venue: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <input type="number" required min="1900" max="2100" className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none" value={currentPub.year || ''} onChange={e => setCurrentPub({...currentPub, year: e.target.value})} />
               </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Co-Authors (comma separated)</label>
              <input type="text" className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none" value={coAuthorsInput} onChange={e => setCoAuthorsInput(e.target.value)} placeholder="e.g. Jane Smith, John Doe" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none" value={currentPub.type || 'Journal Article'} onChange={e => setCurrentPub({...currentPub, type: e.target.value as any})}>
                    <option>Journal Article</option>
                    <option>Book Chapter</option>
                    <option>Policy Paper</option>
                    <option>Conference Paper</option>
                  </select>
               </div>
               <div className="flex items-center pt-6">
                  <input type="checkbox" id="featured" checked={currentPub.featured || false} onChange={e => setCurrentPub({...currentPub, featured: e.target.checked})} className="mr-2" />
                  <label htmlFor="featured" className="text-sm font-medium text-slate-700">Featured Work</label>
               </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Abstract</label>
              <textarea rows={4} className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none" value={currentPub.abstract || ''} onChange={e => setCurrentPub({...currentPub, abstract: e.target.value})} />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link (URL)</label>
              <input type="url" className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none" value={currentPub.link || ''} onChange={e => setCurrentPub({...currentPub, link: e.target.value})} />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-none">Cancel</button>
              <button type="button" onClick={() => handleSave(false)} disabled={isSaving} className="px-6 py-2 border border-slate-300 text-slate-700 rounded-none hover:bg-slate-50 disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Draft'}</button>
              <button type="button" onClick={() => handleSave(true)} disabled={isSaving} className="px-6 py-2 bg-primary text-white rounded-none hover:bg-slate-800 disabled:opacity-50">{isSaving ? 'Saving...' : (currentPub.published ? 'Update' : 'Publish')}</button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif text-slate-800">Publications</h2>
            <button onClick={handleCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-none hover:bg-slate-800 transition-colors">
              <Plus size={18} /> New Publication
            </button>
          </div>
          <div className="bg-white rounded-none shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 font-medium text-slate-500 text-sm min-w-[200px]">Title</th>
                    <th className="p-4 font-medium text-slate-500 text-sm">Status</th>
                    <th className="p-4 font-medium text-slate-500 text-sm">Publisher</th>
                    <th className="p-4 font-medium text-slate-500 text-sm">Year</th>
                    <th className="p-4 font-medium text-slate-500 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPubs.map(pub => (
                    <tr key={pub.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">
                        {pub.title}
                        {pub.featured && <span className="ml-2 text-xs bg-accent/20 text-yellow-700 px-1.5 py-0.5 rounded-none">Featured</span>}
                         {pub.coAuthors && pub.coAuthors.length > 0 && <div className="text-xs text-slate-400 mt-1">w/ {pub.coAuthors.join(', ')}</div>}
                      </td>
                      <td className="p-4"><StatusBadge published={pub.published} /></td>
                      <td className="p-4 text-slate-500 text-sm">{pub.venue}</td>
                      <td className="p-4 text-slate-500 text-sm">{pub.year}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(pub)} className="text-slate-400 hover:text-primary mr-3"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(pub.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
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