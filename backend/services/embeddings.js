
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  baseURL: 'https://integrate.api.nvidia.com/v1',
  apiKey: "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"
});

export async function getEmbeddings(text, type = "passage") {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text for embedding");
  }

  try {
    const response = await openai.embeddings.create({
      model: "nvidia/llama-3.2-nemoretriever-300m-embed-v1",
      input: [text], // safer

        input_type: type,
        truncate: "NONE",
    });

    return response.data[0].embedding;
  } catch (err) {
    console.error("Embedding error:", err);
    throw err;
  }
}
