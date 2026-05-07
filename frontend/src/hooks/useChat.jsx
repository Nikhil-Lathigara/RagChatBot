import { useEffect, useState } from "react";

export default function useChat(sessionId) {
  const [messages, setMessages] = useState(() => {
    const raw = localStorage.getItem(`rag_chat_${sessionId}`);
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    const raw = localStorage.getItem(`rag_chat_${sessionId}`);
    setMessages(raw ? JSON.parse(raw) : []);
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem(`rag_chat_${sessionId}`, JSON.stringify(messages));
  }, [messages, sessionId]);

  const addMessage = (msg) => setMessages((m) => [...m, msg]);
  const clearChat = () => setMessages([]);

  return { messages, addMessage, clearChat };
}
