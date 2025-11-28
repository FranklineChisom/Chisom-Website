'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Eye, Image as ImageIcon } from 'lucide-react';
import { BlogPost } from '@/types';
import MarkdownEditor from '@/components/MarkdownEditor';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageTitle } from '@/hooks/usePageTitle';
// FIX: Changed from './adminUtils' to '../adminUtils'
import { toInputDate, fromInputDate, generateSlug, calculateReadTime } from '../adminUtils';
import MediaLibrary from '@/components/MediaLibrary';

const StatusBadge: React.FC<{ published: boolean }> = ({ published }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
  }`}>
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
    const success = await handleSave(currentPost.published);
    if (success) {
        window.open(`/preview?type=blog&id=${currentPost.id}`, '_blank');
    }
  };

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
    // Check if post exists by ID
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

  const handleDelete = async (id: string) => {
      if(window.confirm('Are you sure you want to delete this article?')) {
          const success = await deleteBlogPost(id);
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

      {isEditing ? (
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif text-slate-800">{currentPost.title ? 'Edit Post' : 'New Post'}</h2>
          <div className="flex gap-2">
             <button 
                onClick={handlePreview} 
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-primary bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-colors text-sm font-medium"
             >
                <Eye size={16} /> Preview
             </button>
             <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-800 p-2"><X /></button>
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 bg-white p-8 rounded-none shadow-sm border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input 
              type="text"
              className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
              value={currentPost.title} 
              onChange={e => setCurrentPost({...currentPost, title: e.target.value})} 
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Publication Date</label>
                <input 
                  type="date"
                  className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
                  value={toInputDate(currentPost.date)} 
                  onChange={e => setCurrentPost({...currentPost, date: fromInputDate(e.target.value)})} 
                  required
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input 
                  type="text"
                  className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
                  value={currentPost.category} 
                  onChange={e => setCurrentPost({...currentPost, category: e.target.value})} 
                  required
                />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cover Image</label>
            <div className="flex gap-2">
                <input 
                type="url"
                className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
                value={currentPost.coverImage || ''} 
                onChange={e => setCurrentPost({...currentPost, coverImage: e.target.value})} 
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
            {currentPost.coverImage && (
                <div className="mt-2 h-32 w-full bg-slate-50 border border-slate-100 rounded overflow-hidden">
                    <img src={currentPost.coverImage} alt="Preview" className="h-full w-full object-contain" />
                </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Excerpt</label>
            <textarea 
              rows={2}
              className="w-full border border-slate-200 rounded-none p-2 focus:border-primary focus:outline-none"
              value={currentPost.excerpt} 
              onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})} 
              required
            />
          </div>
          
          <MarkdownEditor 
            label="Content (Markdown Supported)" 
            value={currentPost.content} 
            onChange={val => setCurrentPost({...currentPost, content: val})} 
          />
          
          <div className="flex justify-end gap-3 pt-4">
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
                className="px-6 py-2 bg-primary text-white rounded-none hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
            >
                {isSaving ? 'Publishing...' : (currentPost.published ? 'Update' : 'Publish')}
            </button>
          </div>
        </form>
      </div>
      ) : (
      <div>
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif text-slate-800">Articles</h2>
            <button onClick={handleCreate} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-none hover:bg-slate-800 transition-colors">
            <Plus size={18} /> New Article
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
                    <th className="p-4 font-medium text-slate-500 text-sm">Category</th>
                    <th className="p-4 font-medium text-slate-500 text-sm text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {paginatedPosts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-800">{post.title}</td>
                    <td className="p-4"><StatusBadge published={post.published} /></td>
                    <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{post.date}</td>
                    <td className="p-4 text-slate-500 text-sm">{post.category}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(post)} className="text-slate-400 hover:text-primary mr-3"><Edit2 size={18} /></button>
                        <button onClick={() => handleDelete(post.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
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
      )}
    </div>
  );
}