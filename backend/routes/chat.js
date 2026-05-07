import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { getEmbeddings } from "../services/embeddings.js";
import { searchEmbedding } from "../services/vectorStore.js";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const CHAT_MODEL = "z-ai/glm4.7";
const MAX_CONTEXT_CHARS = Number(process.env.MAX_CONTEXT_CHARS || 12000);

const ragPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a retrieval-augmented assistant. Answer only using the provided context. If the context is insufficient, clearly say what is missing.",
  ],
  [
    "human",
    "Context:\n{context}\n\nQuestion:\n{query}\n\nGive a concise, factual answer grounded in the context.",
  ],
]);

function toContextText(chunks, manualContext) {
  const normalizedChunks = chunks
    .map((chunk) => String(chunk || "").trim())
    .filter(Boolean);

  const sections = normalizedChunks.map((chunk, index) => `[Chunk ${index + 1}]\n${chunk}`);

  const extra = String(manualContext || "").trim();
  if (extra) {
    sections.push(`[Manual Context]\n${extra}`);
  }

  return sections.join("\n\n").slice(0, MAX_CONTEXT_CHARS);
}

function mapLangChainRoleToOpenAI(role) {
  if (role === "human") return "user";
  if (role === "ai") return "assistant";
  return "system";
}

router.post("/chat", async (req, res) => {
  try {
    // Accept either `query` or `message` from frontend
    const { query: q, question, message, urlContext, sessionId } = req.body;
    const query = q || question || message;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const queryEmbedding = await getEmbeddings(query);
    let retrievedChunks = await searchEmbedding(sessionId, queryEmbedding);

    // Fallback: if session filtering returns nothing, search globally.
    if ((!retrievedChunks || retrievedChunks.length === 0) && sessionId) {
      retrievedChunks = await searchEmbedding(undefined, queryEmbedding);
    }

    const context = toContextText(retrievedChunks || [], urlContext);
    if (!context) {
      const fallback =
        "I could not find indexed context for this session yet. Please upload a PDF/URL first, then ask again.";
      return res.json({ success: true, answer: fallback, reply: fallback, contextChunks: 0 });
    }

    const formattedMessages = await ragPrompt.formatMessages({ context, query });
    const messages = formattedMessages.map((msg) => ({
      role: mapLangChainRoleToOpenAI(msg.getType()),
      content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
    }));

    const result = await openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages,
      max_tokens: 16384,
          chat_template_kwargs: {"enable_thinking":true,"clear_thinking":false},
    stream: true
    });

    const responseText =
      result?.choices[0]?.delta?.reasoning_content ||
      "No response generated.";

    // Return both legacy keys and a `reply` key the frontend expects
    res.json({
      success: true,
      answer: responseText,
      reply: responseText,
      contextChunks: retrievedChunks.length,
    });
  } catch (error) {
    console.error("Error in chatbot query:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
