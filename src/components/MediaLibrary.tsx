import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Trash2,
  ChevronDown
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface MediaLibraryProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

interface MediaFile {
  name: string;
  url: string;
  id: string;
}

const PAGE_SIZE = 20;

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, onClose }) => {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const BUCKET_NAME = "site-assets";

  useEffect(() => {
    fetchImages(0, true);
  }, []);

  const fetchImages = async (pageNum: number, isInitial: boolean = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", {
          limit: PAGE_SIZE,
          offset: from,
          sortBy: { column: "created_at", order: "desc" }
        });

      if (error) throw error;

      if (data) {
        const processedImages = data
          .filter(file => file.name !== ".emptyFolderPlaceholder")
          .map(file => {
            const { data: publicUrlData } = supabase.storage
              .from(BUCKET_NAME)
              .getPublicUrl(file.name);

            return {
              name: file.name,
              id: file.id,
              url: publicUrlData.publicUrl
            };
          });

        if (processedImages.length < PAGE_SIZE) {
            setHasMore(false);
        }

        setImages(prev => isInitial ? processedImages : [...prev, ...processedImages]);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
      fetchImages(page + 1);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Refresh list from start
      setPage(0);
      setHasMore(true);
      await fetchImages(0, true);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Check console details.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when clicking delete
    if (
      !window.confirm(
        "Are you sure you want to delete this image? This might break existing posts."
      )
    )
      return;

    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([imageName]);
      if (error) throw error;
      setImages(images.filter(img => img.name !== imageName));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h3 className="font-serif text-xl text-slate-800">Media Library</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an image or upload a new one.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
             Showing {images.length} Assets
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Upload size={16} />
              )}
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50">
          {loading && page === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2
                size={32}
                className="animate-spin mb-3 text-primary/50"
              />
              <p>Loading assets...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-4">
              <ImageIcon size={48} className="mb-4 opacity-20" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline mt-2 text-sm"
              >
                Upload your first image
              </button>
            </div>
          ) : (
            <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {images.map(img => (
                    <div
                    key={img.id}
                    onClick={() => onSelect(img.url)}
                    className="group relative aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:border-primary hover:shadow-md transition-all"
                    >
                    <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="bg-white text-primary px-3 py-1 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        Select
                        </span>
                    </div>
                    {/* Delete Button */}
                    <button
                        onClick={e => handleDelete(img.name, e)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-10"
                        title="Delete image"
                    >
                        <Trash2 size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 text-[10px] text-slate-600 truncate font-mono border-t border-slate-100">
                        {img.name}
                    </div>
                    </div>
                ))}
                </div>
                
                {hasMore && (
                    <div className="flex justify-center pb-4">
                        <button 
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-full shadow-sm hover:bg-slate-50 hover:text-primary transition-colors disabled:opacity-50"
                        >
                            {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
                            {loadingMore ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;