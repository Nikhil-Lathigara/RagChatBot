// routes/urlRoutes.js
import express from "express";
import { urlService } from "../services/urlService.js";


const router = express.Router();

// Middleware to validate URL format
function validateUrl(req, res, next) {
  const { url } = req.body;
  const urlPattern = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;

  if (!urlPattern.test(url)) {
    return res.status(400).json({ error: "Invalid URL format" });
  }
  next();
}

// POST /api/url
router.post("/url", validateUrl, urlService);

export default router;
