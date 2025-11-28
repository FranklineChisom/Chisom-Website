import React, { useRef } from 'react';
import { Bold, Italic, Link, List, Quote, Heading } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  rows?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ value, onChange, label, rows = 12 }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);
    
    const newText = previousText.substring(0, start) + before + selectedText + after + previousText.substring(end);
    
    onChange(newText);
    
    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
      <div className="border border-slate-200 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-shadow">
        {/* Toolbar */}
        <div className="flex items-center gap-1 bg-slate-50 border-b border-slate-200 p-2 overflow-x-auto">
          <button type="button" onClick={() => insertText('**', '**')} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-200 rounded" title="Bold">
            <Bold size={16} />
          </button>
          <button type="button" onClick={() => insertText('*', '*')} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-200 rounded" title="Italic">
            <Italic size={16} />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          <button type="button" onClick={() => insertText('### ')} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-200 rounded" title="Heading">
            <Heading size={16} />
          </button>
          <button type="button" onClick={() => insertText('> ')} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-200 rounded" title="Quote">
            <Quote size={16} />
          </button>
          <button type="button" onClick={() => insertText('- ')} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-200 rounded" title="List">
            <List size={16} />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-1"></div>
          <button type="button" onClick={() => insertText('[Link Text](', ')')} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-200 rounded" title="Link">
            <Link size={16} />
          </button>
        </div>
        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={rows}
          className="w-full p-4 focus:outline-none font-mono text-sm leading-relaxed resize-y"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your content here... Markdown is supported."
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;