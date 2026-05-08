import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import urlRoutes from "./routes/urlRoute.js";
import chatRoutes from "./routes/chat.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();
const app = express();
console.log("Key:", process.env.OPENROUTER_API_KEY);

app.use(cors(
  {
    origin: "https://rag-chat-bot-ce7l.vercel.app"
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", chatRoutes); // POST /chat
app.use("/upload", uploadRoutes); // POST /upload/pdf
app.use("/upload", urlRoutes); // POST /upload/url

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
