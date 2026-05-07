import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import Header from "./components/Header";
import MessageBubble from "./components/MessageBubble";
import Toolbar from "./components/Toolbar";
import FilePdfDialog from "./components/FilePdfDialog";
import GradientText from "./components/GradientText";
import UrlDialog from "./components/UrlDialog";


const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "/api");

/**
 * Custom hook to manage the user's session ID.
 * The session ID is stored in localStorage to persist across page reloads.
 */
function useSession() {
  const [sessionId, setSessionId] = useState(() => {
    // Check for an existing session ID in local storage.
    const existing = localStorage.getItem("rag_session_id");
    if (existing) return existing;
    // If no session ID exists, create a new one.
    const id = crypto.randomUUID();
    localStorage.setItem("rag_session_id", id);
    return id;
  });

  const resetSession = () => {
    // Create a new session ID and clear old data.
    const id = crypto.randomUUID();
    localStorage.setItem("rag_session_id", id);
    localStorage.removeItem(`rag_chat_${sessionId}`);
    setSessionId(id);
  };

  return { sessionId, resetSession };
}

/**
 * Custom hook to manage the chat messages.
 * Messages are stored in localStorage associated with the session ID.
 */
function useChat(sessionId) {
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage for the current session.
    const raw = localStorage.getItem(`rag_chat_${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    // When the session changes, load the new chat history.
    const raw = localStorage.getItem(`rag_chat_${sessionId}`);
    setMessages(raw ? JSON.parse(raw) : []);
  }, [sessionId]);

  useEffect(() => {
    // Persist messages to localStorage whenever they change.
    localStorage.setItem(`rag_chat_${sessionId}`, JSON.stringify(messages));
  }, [messages, sessionId]);

  const addMessage = (msg) => setMessages((m) => [...m, msg]);
  const clearChat = () => setMessages([]);

  return { messages, addMessage, clearChat };
}

/**
 * The main application component.
 */
export default function App() {
  const { sessionId, resetSession } = useSession();
  const { messages, addMessage, clearChat } = useChat(sessionId);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    // Scroll to the bottom of the chat list on new messages or loading state changes.
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const ask = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMessage({ role: "user", content: text, ts: Date.now() });
    setLoading(true);
    try {
      // Make a POST request to the backend chat endpoint.
      const { data } = await axios.post(`${BACKEND_URL}/chat`, {
        sessionId,
        message: text,
      });
      addMessage({ role: "assistant", content: data.reply, ts: Date.now() });
    } catch (e) {
      addMessage({ role: "assistant", content: `Error: ${e.message}`, ts: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  const uploadPdf = async (file) => {
    setShowPdf(false);
    setLoading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("sessionId", sessionId);
    try {
      // Make a POST request to the backend PDF upload endpoint.
      await axios.post(`${BACKEND_URL}/upload/pdf`, form);
      addMessage({ role: "assistant", content: `PDF processed: ${file.name}`, ts: Date.now() });
    } catch (e) {
      addMessage({ role: "assistant", content: `PDF error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const addUrl = async (url) => {
    setShowUrl(false);
    setLoading(true);
    try {
      // Make a POST request to the backend URL upload endpoint.
      await axios.post(`${BACKEND_URL}/upload/url`, { url, sessionId });
      addMessage({ role: "assistant", content: `URL added: ${url}`, ts: Date.now() });
    } catch (e) {
      addMessage({ role: "assistant", content: `URL error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const placeholder = useMemo(
    () =>
      messages.length === 0
        ? "Ask anything… (We’ll use your PDF/URL context if provided)"
        : "Type your message…",
    [messages.length]
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-zinc-950 to-black text-white font-sans">
      <Header onReset={() => { clearChat(); resetSession(); }} />

      <main className="mx-auto max-w-5xl px-4 pb-28">
        {/* Hero / Tip */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6 mt-4"
          >
            <h2 className="text-lg md:text-xl font-semibold mb-2">
              Bring your <GradientText>knowledge</GradientText> — PDFs & URLs
            </h2>
            <p className="text-white/70 text-sm md:text-base">
              Upload a PDF or add a URL. Ask questions and the assistant will answer using your context.
            </p>
          </motion.div>
        )}

        {/* Messages */}
        <div ref={listRef} className="mt-6 space-y-4 max-h-[62vh] overflow-y-auto pr-1 custom-scroll">
          <AnimatePresence>
            {messages.map((m) => (
              <MessageBubble key={m.ts + m.content.slice(0, 10)} role={m.role} content={m.content} />
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
            </div>
          )}
        </div>
      </main>

      {/* Toolbar */}
      <div className="fixed bottom-24 left-0 right-0 mx-auto max-w-5xl px-4">
        <Toolbar onOpenPdf={() => setShowPdf(true)} onOpenUrl={() => setShowUrl(true)} onClear={clearChat} />
      </div>

      {/* Composer */}
      <div className="fixed bottom-4 left-0 right-0">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-2 shadow-xl">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask();
                  }
                }}
                rows={1}
                placeholder={placeholder}
                className="flex-1 resize-none rounded-xl bg-transparent p-3 outline-none placeholder:text-white/40 text-sm md:text-base"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={ask}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold bg-gradient-to-br from-orange-600 to-amber-600 text-black disabled:opacity-50"
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" /> Send
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <FilePdfDialog open={showPdf} onClose={() => setShowPdf(false)} onSubmit={uploadPdf} />
      <UrlDialog open={showUrl} onClose={() => setShowUrl(false)} onSubmit={addUrl} />

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .custom-scroll::-webkit-scrollbar{height:10px;width:10px}
        .custom-scroll::-webkit-scrollbar-thumb{background:linear-gradient(45deg,#fb923c,#f59e0b);border-radius:999px}
        .custom-scroll::-webkit-scrollbar-track{background:transparent}
      `}</style>
    </div>
  );
}
