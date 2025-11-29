'use client';

import React, { useState } from 'react';
import { Save, User, Share2, Layout, BookOpen, Loader2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import MarkdownEditor from '@/components/MarkdownEditor';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function ProfileManager() {
    usePageTitle('Profile Settings - Admin');
    const { siteConfig, updateSiteConfig } = useData();
    const { showToast } = useToast();
    const [formData, setFormData] = useState(siteConfig);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ 
            ...formData, 
            social: { ...formData.social, [e.target.name]: e.target.value } 
        });
    };

    const handleContentChange = (val: string) => {
        setFormData({ ...formData, focusContent: val });
    };

    const handleResearchIntroChange = (val: string) => {
      setFormData({ ...formData, researchIntro: val });
    };

    const handleResearchInterestsChange = (val: string) => {
      setFormData({ ...formData, researchInterests: val });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const success = await updateSiteConfig(formData);
            if (success) showToast('Profile updated successfully!', 'success');
            else showToast('Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-5xl pb-20 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-serif text-slate-800">Profile Settings</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage your personal information and site content.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* General Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                    <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                        <User size={20} className="text-primary/80" />
                        <h3 className="font-semibold text-slate-800">Personal Information</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input type="text" required name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Professional Role</label>
                                <input type="text" required name="role" value={formData.role} onChange={handleChange} className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Tagline</label>
                            <textarea required name="tagline" value={formData.tagline} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white resize-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Profile Image URL</label>
                            <input type="url" name="aboutImage" value={formData.aboutImage} onChange={handleChange} className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" placeholder="https://..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Email</label>
                                <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" placeholder="City, Country" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Links Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                   <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                        <Share2 size={20} className="text-primary/80" />
                        <h3 className="font-semibold text-slate-800">Social Presence</h3>
                    </div>
                   <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">LinkedIn URL</label>
                          <input 
                            name="linkedin" 
                            value={formData.social.linkedin} 
                            onChange={handleSocialChange} 
                            className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Twitter/X URL</label>
                          <input 
                            name="twitter" 
                            value={formData.social.twitter} 
                            onChange={handleSocialChange} 
                            className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Google Scholar URL</label>
                          <input 
                            name="scholar" 
                            value={formData.social.scholar} 
                            onChange={handleSocialChange} 
                            className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" 
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SSRN URL</label>
                          <input 
                            name="ssrn" 
                            value={formData.social.ssrn || ''} 
                            onChange={handleSocialChange} 
                            className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" 
                          />
                      </div>
                   </div>
                </div>

                {/* Homepage Focus Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                   <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                        <Layout size={20} className="text-primary/80" />
                        <h3 className="font-semibold text-slate-800">Homepage & Focus</h3>
                    </div>
                   <div className="p-8 space-y-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Focus Text (Short Description)</label>
                          <textarea required name="focusText" value={formData.focusText} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white resize-none" />
                          <p className="text-xs text-slate-400 mt-1">This appears on the homepage banner.</p>
                      </div>
                      
                      <div>
                        <MarkdownEditor 
                            label="Current Focus Page Content"
                            value={formData.focusContent}
                            onChange={handleContentChange}
                            rows={8}
                        />
                      </div>

                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Focus Link Override</label>
                          <input type="text" name="focusLink" value={formData.focusLink || ''} onChange={handleChange} className="w-full border border-slate-200 rounded-md p-3 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all bg-white" placeholder="/current-focus" />
                          <p className="text-xs text-slate-400 mt-1">Leave blank to use default.</p>
                      </div>
                   </div>
                </div>
                
                {/* Research Page Settings Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                  <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
                        <BookOpen size={20} className="text-primary/80" />
                        <h3 className="font-semibold text-slate-800">Research Page Content</h3>
                    </div>
                  <div className="p-8 space-y-8">
                    <div>
                        <MarkdownEditor 
                            label="Research Page Introduction"
                            value={formData.researchIntro}
                            onChange={handleResearchIntroChange}
                            rows={4}
                        />
                    </div>
                    <div>
                        <MarkdownEditor 
                            label="Research Interests List"
                            value={formData.researchInterests}
                            onChange={handleResearchInterestsChange}
                            rows={6}
                        />
                        <p className="text-xs text-slate-400 mt-1">Use bullet points for best display.</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Save Button */}
                 <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="bg-primary text-white px-8 py-3 rounded-md hover:bg-slate-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2 font-medium disabled:opacity-70"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving All Changes...
                            </>
                        ) : (
                            <>
                                <Save size={18} /> Save All Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}