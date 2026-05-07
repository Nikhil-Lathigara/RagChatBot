import { splitText } from "./chunker.js";
import { getEmbeddings } from "./embeddings.js";
import { storeEmbedding } from "./vectorStore.js";

export async function processText({
  text,
  sessionId,
  metadata = {},
  chunkSize,
  overlap,
}) {
  if (!text) return { chunkCount: 0 };

  const chunks = splitText(text, chunkSize, overlap);

  // ⚡ Parallel embeddings (BIG upgrade)
  const embeddings = await Promise.all(
    chunks.map((chunk) => getEmbeddings(chunk))
  );

  // ⚡ Batch store
  await Promise.all(
    embeddings.map((embedding, i) =>
      storeEmbedding(sessionId, embedding, {
        text: chunks[i],
        chunkIndex: i + 1,
        ...metadata,
      })
    )
  );

  return { chunkCount: chunks.length };
}