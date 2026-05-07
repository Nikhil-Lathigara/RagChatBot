import React from "react";
import { Upload, Link as LinkIcon, Trash2 } from "lucide-react";

export default function Toolbar({ onOpenPdf, onOpenUrl, onClear }) {
  return (
    <div className="flex items-center gap-2 p-3 md:p-4 border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <button onClick={onOpenPdf} className="group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-gradient-to-br from-orange-600 to-amber-600 text-black shadow hover:shadow-orange-500/30 transition" title="Add PDF context">
        <Upload className="h-4 w-4 group-hover:scale-110 transition" /> PDF
      </button>
      <button onClick={onOpenUrl} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white" title="Add URL context">
        <LinkIcon className="h-4 w-4" /> URL
      </button>
      <div className="ml-auto" />
      <button onClick={onClear} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white" title="Clear chat (local only)">
        <Trash2 className="h-4 w-4" /> Clear Chat
      </button>
    </div>
  );
}
