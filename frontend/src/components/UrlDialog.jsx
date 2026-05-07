import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe } from "lucide-react";

export default function UrlDialog({ open, onClose, onSubmit }) {
  const [url, setUrl] = useState("");
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }} className="w-[92%] max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Globe className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-semibold">Add URL Context</h3>
                <p className="text-xs text-white/60">We will fetch & embed the page content</p>
              </div>
            </div>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" className="block w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none focus:ring-2 focus:ring-orange-600" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10">Cancel</button>
              <button onClick={() => url && onSubmit(url)} className="rounded-xl px-3 py-2 text-sm bg-gradient-to-br from-orange-600 to-amber-600 text-black font-semibold">Add</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
