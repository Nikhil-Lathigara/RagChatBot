import React from "react";
import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";

export default function MessageBubble({ role, content }) {
  const isUser = role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] md:max-w-[70%] rounded-2xl px-4 py-3 border ${isUser ? "bg-gradient-to-br from-orange-600 to-amber-600 text-black border-black/10" : "bg-white/5 text-white border-white/10"} shadow-lg`}>
        <div className="flex items-center gap-2 mb-2">
          {isUser ? <User className="h-4 w-4 opacity-80" /> : <Bot className="h-4 w-4 opacity-80" />}
          <span className="text-xs uppercase tracking-wide opacity-70">{isUser ? "You" : "Assistant"}</span>
        </div>
        <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{content}</div>
      </div>
    </motion.div>
  );
}
