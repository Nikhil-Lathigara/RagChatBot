import express from "express";
import multer from "multer";
import { processPDF } from "../services/pdfService.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    await processPDF(req.body.sessionId, req.file.buffer);
    res.json({ message: "PDF processed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

export default router;
