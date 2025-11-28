'use client';

import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/contexts/ToastContext';
import MarkdownEditor from '@/components/MarkdownEditor';

export default function ProfileManager() {
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
        const success = await updateSiteConfig(formData);
        
        setIsSaving(false);
        if (success) showToast('Profile updated successfully!', 'success');
        else showToast('Failed to update profile', 'error');
    };

    return (
        <div className="max-w-4xl">
            <h2 className="text-3xl font-serif text-slate-800 mb-8">Profile Settings</h2>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-none shadow-sm border border-slate-100 space-y-8">
                
                {/* General Info */}
                <div className="space-y-6">
                  <h3 className="text-xl font-serif text-primary border-b border-slate-100 pb-2">General Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                          <input type="text" required name="name" value={formData.name} onChange={handleChange} className="w-full border border-slate-200 rounded-none p-2" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Professional Role</label>
                          <input type="text" required name="role" value={formData.role} onChange={handleChange} className="w-full border border-slate-200 rounded-none p-2" />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tagline</label>
                      <textarea required name="tagline" value={formData.tagline} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-none p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">About Page Image URL</label>
                    <input type="url" name="aboutImage" value={formData.aboutImage} onChange={handleChange} className="w-full border border-slate-200 rounded-none p-2" placeholder="https://..." />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                          <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-200 rounded-none p-2" />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                          <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border border-slate-200 rounded-none p-2" placeholder="City, Country" />
                      </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-6">
                   <h3 className="text-xl font-serif text-primary border-b border-slate-100 pb-2">Social Media Links</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
                          <input 
                            name="linkedin" 
                            value={formData.social.linkedin} 
                            onChange={handleSocialChange} 
                            className="w-full border border-slate-200 rounded-none p-2" 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Twitter/X URL</label>
                          <input 
                            name="twitter" 
                            value={formData.social.twitter} 
                            onChange={handleSocialChange} 
                            className="w-full border border-slate-200 rounded-none p-2" 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Google Scholar URL</label>
                          <input 
                            name="scholar" 
                            value={formData.social.scholar} 
                            onChange={handleSocialChange} 
                            className="w-full border border-slate-200 rounded-none p-2" 
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">SSRN URL</label>
                          <input 
                            name="ssrn" 
                            value={formData.social.ssrn || ''} 
                            onChange={handleSocialChange} 
                            className="w-full border border-slate-200 rounded-none p-2" 
                          />
                      </div>
                   </div>
                </div>

                {/* Homepage Focus */}
                <div className="space-y-6">
                   <h3 className="text-xl font-serif text-primary border-b border-slate-100 pb-2">Homepage Focus</h3>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Focus Text (Homepage Short Description)</label>
                      <textarea required name="focusText" value={formData.focusText} onChange={handleChange} rows={2} className="w-full border border-slate-200 rounded-none p-2" />
                  </div>
                  
                  <MarkdownEditor 
                      label="Current Focus Page Content"
                      value={formData.focusContent}
                      onChange={handleContentChange}
                      rows={8}
                  />

                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Focus Link (Legacy Override)</label>
                      <input type="text" name="focusLink" value={formData.focusLink || ''} onChange={handleChange} className="w-full border border-slate-200 rounded-none p-2" placeholder="/current-focus" />
                  </div>
                </div>
                
                {/* Research Page Settings */}
                <div className="space-y-6">
                  <h3 className="text-xl font-serif text-primary border-b border-slate-100 pb-2">Research Page Settings</h3>
                  <MarkdownEditor 
                      label="Research Page Intro"
                      value={formData.researchIntro}
                      onChange={handleResearchIntroChange}
                      rows={4}
                  />
                  <MarkdownEditor 
                      label="Research Interests List"
                      value={formData.researchInterests}
                      onChange={handleResearchInterestsChange}
                      rows={6}
                  />
                </div>

                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full bg-primary text-white py-3 rounded-none hover:bg-slate-800 transition-colors flex justify-center items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} /> Save All Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}