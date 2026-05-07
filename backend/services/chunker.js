export function splitText(text, chunkSize, overlap) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(text.length, start + chunkSize);
    const chunk = text.slice(start, end).trim();

    if (chunk) chunks.push(chunk);
    start += chunkSize - overlap;
  }

  return chunks;
}