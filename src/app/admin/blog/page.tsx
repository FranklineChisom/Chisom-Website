'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Eye, Image as ImageIcon, Loader2 } from 'lucide-react';
import { BlogPost } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toInputDate, fromInputDate, generateSlug, calculateReadTime } from '../adminUtils';
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

export default function BlogManager() {
  usePageTitle('Manage Articles - Admin');
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useData();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [page, setPage] = useState(1);
  
  // Modal States
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });
  const [previewModal, setPreviewModal] = useState(false);

  const ITEMS_PER_PAGE = 8;
  
  const [currentPost, setCurrentPost] = useState<BlogPost>({
    id: '', slug: '', title: '', date: '', category: '', readTime: '', excerpt: '', content: '', coverImage: '', published: false
  });

  const sortedPosts = [...blogPosts].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleEdit = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentPost({ 
      id: Date.now().toString(),
      slug: '', 
      title: '',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      category: '',
      readTime: '',
      excerpt: '',
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
      const success = await handleSave(currentPost.published);
      if (success) {
        window.open(`/preview?type=blog&id=${currentPost.id}`, '_blank');
      }
  }

  const handleSave = async (publishedStatus: boolean): Promise<boolean> => {
    if (!currentPost.title || !currentPost.content) {
        showToast('Title and Content are required', 'error');
        return false;
    }
    
    setIsSaving(true);
    const updatedPost = {
      ...currentPost,
      slug: currentPost.slug || generateSlug(currentPost.title),
      readTime: calculateReadTime(currentPost.content),
      published: publishedStatus
    };

    let success;
    const exists = blogPosts.some(p => p.id === updatedPost.id);
    
    if (exists) {
      success = await updateBlogPost(updatedPost);
    } else {
      success = await addBlogPost(updatedPost);
    }

    setIsSaving(false);
    if (success) {
        const msg = publishedStatus ? 'Article Published!' : 'Draft Saved';
        showToast(msg, 'success');
        return true;
    } else {
        showToast('Failed to save article', 'error');
        return false;
    }
  };

  const handleSaveAndClose = async (status: boolean) => {
      const success = await handleSave(status);
      if(success) setIsEditing(false);
  }

  const confirmDelete = (id: string) => {
      setDeleteModal({ isOpen: true, id });
  };

  const handleDelete = async () => {
      if (deleteModal.id) {
          const success = await deleteBlogPost(deleteModal.id);
          setDeleteModal({ isOpen: false, id: null });
          if (success) {
              showToast('Article deleted', 'success');
          } else {
              showToast('Failed to delete article', 'error');
          }
      }
  };

  const handleImageSelect = (url: string) => {
    setCurrentPost({ ...currentPost, coverImage: url });
    setShowMediaLibrary(false);
  };

  const paginatedPosts = sortedPosts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Media Library Modal */}
      {showMediaLibrary && (
        <MediaLibrary 
            onSelect={handleImageSelect} 
            onClose={() => setShowMediaLibrary(false)} 
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Article?"
        type="danger"
        actions={
            <>
                <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">Delete Permanently</button>
            </>
        }
      >
        <p>Are you sure you want to delete this article? This action cannot be undone and will remove the post from your blog.</p>
      </Modal>

      {/* Preview Modal */}
       <Modal
        isOpen={previewModal}
        onClose={() => setPreviewModal(false)}
        title="Preview Article"
        type="info"
        actions={
            <>
                <button onClick={() => setPreviewModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors">Cancel</button>
                <button onClick={confirmPreview} className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">Save & Open Preview</button>
            </>
        }
      >
        <p>To preview this article, we first need to save your current changes. Do you want to proceed?</p>
      </Modal>


      {isEditing ? (
      <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-slate-800">{currentPost.title ? 'Edit Post' : 'New Post'}</h2>
          <div className="flex gap-2">
             <button 
                onClick={handlePreview} 
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors text-sm font-medium rounded-full"
             >
                <Eye size={16} /> <span className="hidden sm:inline">Preview</span>
             </button>
             <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-slate-200/60">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</label>
            <input 
              type="text"
              className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              value={currentPost.title} 
              onChange={e => setCurrentPost({...currentPost, title: e.target.value})} 
              required
              placeholder="Enter a captivating title..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Publication Date</label>
                <input 
                  type="date"
                  className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  value={toInputDate(currentPost.date)} 
                  onChange={e => setCurrentPost({...currentPost, date: fromInputDate(e.target.value)})} 
                  required
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                <input 
                  type="text"
                  className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  value={currentPost.category} 
                  onChange={e => setCurrentPost({...currentPost, category: e.target.value})} 
                  required
                  placeholder="e.g. Law, Technology"
                />
             </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cover Image URL</label>
            <div className="flex gap-2">
                <input 
                type="url"
                className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                value={currentPost.coverImage || ''} 
                onChange={e => setCurrentPost({...currentPost, coverImage: e.target.value})} 
                placeholder="https://..."
                />
                <button 
                    type="button"
                    onClick={() => setShowMediaLibrary(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 rounded-md transition-colors flex items-center gap-2 whitespace-nowrap font-medium"
                >
                    <ImageIcon size={18} /> Library
                </button>
            </div>
            {currentPost.coverImage && (
                <div className="mt-3 h-48 w-full bg-slate-50 border border-slate-100 rounded-md overflow-hidden relative group">
                    <img src={currentPost.coverImage} alt="Preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Excerpt</label>
            <textarea 
              rows={3}
              className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all resize-none"
              value={currentPost.excerpt} 
              onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})} 
              required
              placeholder="A short summary for listing pages..."
            />
          </div>
          
          <div className="pt-2">
            <MarkdownEditor 
                label="Content (Markdown)" 
                value={currentPost.content} 
                onChange={val => setCurrentPost({...currentPost, content: val})} 
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-md font-medium transition-colors">Cancel</button>
            <button 
                type="button"
                onClick={() => handleSaveAndClose(false)}
                disabled={isSaving}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 hover:border-slate-400 font-medium disabled:opacity-50 transition-all shadow-sm"
            >
                {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
                type="button"
                onClick={() => handleSaveAndClose(true)}
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary text-white rounded-md hover:bg-slate-800 font-medium disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
                {isSaving ? 'Publishing...' : (currentPost.published ? 'Update Article' : 'Publish Article')}
            </button>
          </div>
        </form>
      </div>
      ) : (
      <div className="animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-serif text-slate-800">Articles</h2>
                <p className="text-slate-500 text-sm mt-1">Manage your blog posts and drafts</p>
            </div>
            <button onClick={handleCreate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium">
                <Plus size={18} /> New Article
            </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                    <th className="p-5 min-w-[250px]">Title</th>
                    <th className="p-5 w-32">Status</th>
                    <th className="p-5 w-32">Date</th>
                    <th className="p-5 w-32">Category</th>
                    <th className="p-5 w-24 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedPosts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-5 font-medium text-slate-800">{post.title}</td>
                    <td className="p-5"><StatusBadge published={post.published} /></td>
                    <td className="p-5 text-slate-500 font-mono text-xs whitespace-nowrap">{post.date}</td>
                    <td className="p-5 text-slate-500">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">{post.category}</span>
                    </td>
                    <td className="p-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(post)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors" title="Edit">
                                <Edit2 size={16} />
                            </button>
                            <button onClick={() => confirmDelete(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))}
                {paginatedPosts.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                            No articles found. Create one to get started.
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
}