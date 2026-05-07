import React from "react";
import { Bot, Plus } from "lucide-react";
import GradientText from "./GradientText";

export default function Header({ onReset }) {
  return (
    <div className="flex items-center justify-between p-4 md:p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg flex items-center justify-center">
          <Bot className="h-6 w-6 text-black/90" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            <GradientText>RAG Chat</GradientText>
          </h1>
          <p className="text-xs md:text-sm text-white/60">PDF & URL Chatbot</p>
        </div>
      </div>
      <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white transition">
        <Plus className="h-4 w-4" /> New Session
      </button>
    </div>
  );
}
