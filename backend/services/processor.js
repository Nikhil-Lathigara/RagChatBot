import axios from "axios";
import { extractPageContent } from "./extractor.js";
import { splitText } from "./chunker.js";
import { getEmbeddings } from "./embeddings.js";
import { storeEmbedding } from "./vectorStore.js";

export async function processPage({
  url,
  sessionId,
  depth,
  config,
}) {
  const { data: html } = await axios.get(url, {
    timeout: 10000,
  });

  const { title, text, links } = extractPageContent(
    html,
    url,
    config.maxChars
  );

  if (!text) return { chunks: 0, links: [] };

  const chunks = splitText(
    text,
    config.chunkSize,
    config.overlap
  );

  // ⚡ PARALLEL EMBEDDINGS (10x faster)
  const embeddings = await Promise.all(
    chunks.map((chunk) => getEmbeddings(chunk))
  );

  // ⚡ BATCH STORE
  await Promise.all(
    embeddings.map((embedding, i) =>
      storeEmbedding(sessionId, embedding, {
        text: chunks[i],
        url,
        title,
        depth,
        chunkIndex: i + 1,
      })
    )
  );

  return {
    chunks: chunks.length,
    links,
  };
}