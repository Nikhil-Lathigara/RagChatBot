import { useState } from "react";

export default function useSession() {
  const [sessionId, setSessionId] = useState(() => {
    const existing = localStorage.getItem("rag_session_id");
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem("rag_session_id", id);
    return id;
  });

  const resetSession = () => {
    const id = crypto.randomUUID();
    localStorage.setItem("rag_session_id", id);
    localStorage.removeItem(`rag_chat_${sessionId}`);
    setSessionId(id);
  };

  return { sessionId, resetSession };
}
