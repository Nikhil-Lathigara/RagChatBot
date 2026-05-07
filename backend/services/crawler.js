export async function crawl({ startUrl, maxPages, maxDepth }) {
  const queue = [{ url: startUrl, depth: 0 }];
  const visited = new Set();
  const results = [];

  const rootHost = new URL(startUrl).host;

  while (queue.length && results.length < maxPages) {
    const current = queue.shift();

    if (!current || visited.has(current.url)) continue;
    visited.add(current.url);

    results.push(current);

    if (current.depth >= maxDepth) continue;

    for (const link of current.links || []) {
      try {
        const parsed = new URL(link);
        if (parsed.host !== rootHost) continue;

        queue.push({
          url: link,
          depth: current.depth + 1,
        });
      } catch {}
    }
  }

  return results;
}