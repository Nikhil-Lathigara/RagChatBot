import dotenv from "dotenv";
import { processText } from "./textProcessor.js";

dotenv.config();

const MAX_CHUNK_SIZE = Number(process.env.PDF_CHUNK_SIZE || 1000);
const CHUNK_OVERLAP = Number(process.env.PDF_CHUNK_OVERLAP || 200);

export async function processPDF(sessionId, buffer) {
  if (!buffer) throw new Error("No PDF buffer provided");

  try {
    const pdfModule = await import("pdf-parse/lib/pdf-parse.js");
    const pdf = pdfModule.default || pdfModule;

    const data = await pdf(buffer);
    const text = (data?.text || "").replace(/\s+/g, " ").trim();

    console.log(
      `Processed PDF for session ${sessionId}. Length: ${text.length}`
    );

    const result = await processText({
      text,
      sessionId,
      chunkSize: MAX_CHUNK_SIZE,
      overlap: CHUNK_OVERLAP,
      metadata: {
        source: "pdf",
      },
    });

    return {
      textLength: text.length,
      chunkCount: result.chunkCount,
    };
  } catch (err) {
    console.error("PDF processing error:", err);
    throw err;
  }
}