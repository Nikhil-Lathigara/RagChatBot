import { processPage } from "../services/processor.js";

export async function urlService(req, res) {
  try {
    const { url, sessionId } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL required" });
    }

    const config = {
      chunkSize: 1000,
      overlap: 200,
      maxChars: 200000,
      maxPages: 20,
      maxDepth: 1,
    };

    const queue = [{ url, depth: 0 }];
    const visited = new Set();

    let totalChunks = 0;
    let pagesProcessed = 0;

    while (queue.length && pagesProcessed < config.maxPages) {
      const current = queue.shift();

      if (!current || visited.has(current.url)) continue;
      visited.add(current.url);

      const result = await processPage({
        url: current.url,
        sessionId,
        depth: current.depth,
        config,
      });

      pagesProcessed++;
      totalChunks += result.chunks;

      if (current.depth < config.maxDepth) {
        for (const link of result.links) {
          if (!visited.has(link)) {
            queue.push({
              url: link,
              depth: current.depth + 1,
            });
          }
        }
      }
    }

    return res.json({
      success: true,
      pagesProcessed,
      totalChunks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
}