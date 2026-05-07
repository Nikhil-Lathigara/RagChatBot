# RagChatBot Project Documentation

This document provides a comprehensive overview of the **RagChatBot** project. It is intended to outline the architecture, codebase structure, core functionalities, and the technical challenges encountered during its development. This will serve as a foundational study guide for prompt engineering and technical interviews.

---

## 1. Project Overview & Core Features

**RagChatBot** is a Retrieval-Augmented Generation (RAG) powered chatbot application. It enables users to interact with a Large Language Model (LLM) while augmenting its knowledge with custom external data sources like PDF documents and Web URLs.

### Key Features:
- **Interactive Chat Interface**: A modern, sleek UI built with React and Framer Motion for processing user queries.
- **Context Injection**: Users can upload a PDF or provide a URL to inject specific data as context for their queries.
- **Persistent Sessions**: User session states and chat histories are stored client-side using `localStorage`, ensuring history isn't lost on page reloads.
- **Vector Search (RAG)**: The system processes external data via embeddings and stores them in a Vector Database to rapidly retrieve the most relevant chunks of data when a user asks a question.
- **Google Generative AI**: Powered by Google's `gemini-1.5-flash` model for intelligent, context-aware responsiveness and `models/embedding-001` for vectorizing text.

---

## 2. Codebase Structure

The project is structured into two main directories: `frontend` and `backend`.

### Backend (Node.js / Express)
The backend manages API endpoints, integrates with AI models via LangChain, and orchestrates the vector store.
```
backend/
├── index.js            # Main Express application setup, CORS, and routing.
├── routes/
│   ├── chat.js         # POST /chat - Proxies query to Gemini 1.5 Flash.
│   ├── upload.js       # POST /upload/pdf - Handles multer PDF uploads.
│   └── urlRoute.js     # POST /upload/url - Mounts URL services.
├── services/
│   ├── pdfService.js   # Uses pdf-parse to extract text from buffer.
│   ├── urlService.js   # LangChain orchestrator (Embeddings, Qdrant VectorStore, Gemini model).
│   └── vectorStore.js  # Wrapper around QdrantClient (@qdrant/qdrant-js).
├── package.json        # Dependencies including @langchain/core, qdrant-js, google-genai, etc.
└── .env                # Environment variables (OPENROUTER_API_KEY, QDRANT_URL, etc.).
```

### Frontend (React / Vite)
The frontend encapsulates the visual presentation and client-side session management.
```
frontend/
├── src/
│   ├── App.jsx         # Main React component uniting Session, Chat hooks, and the main view logic.
│   ├── components/     # UI Components (Header, MessageBubble, Toolbar, FilePdfDialog, UrlDialog).
│   ├── hooks/          # Reusable custom React Hooks.
│   ├── index.css       # Tailwind CSS configurations.
│   └── main.jsx        # Entry point for the Vite + React app.
├── tailwind.config.js  # Defines the design tokens for Tailwind CSS.
└── vite.config.js      # Vite build configuration.
```

---

## 3. Implementation Details

### Client-Side Implementation (Frontend)
- **Framework & Styling**: Developed using React with Vite. The styling is completely driven by **Tailwind CSS** allowing for modern layouts (e.g. glassmorphism) and **Framer Motion** for smooth state transitions and micro-animations.
- **Session Management**: React components rely on custom hooks (`useSession` and `useChat`) that interact directly with the browser's `localStorage`. This creates a persistent experience per session without requiring a fully fledged authentication system.
- **API Communication**: The frontend uses `axios` to invoke endpoints running on the Node.js server (`http://localhost:5000`). Forms are structured using `FormData` to handle binary uploads (PDFs) cleanly.

### Server-Side Implementation (Backend)
- **Framework**: Express setup with memory-resident file processing using `multer`.
- **RAG Architecture**:
  1. **Data Ingestion**: Text flows into the system either through `pdfService.js` (using `pdf-parse`) or dynamically scraped via the URL endpoints.
  2. **Vectorization**: Uses `@langchain/google-genai` to invoke the `embedding-001` model, producing rich vector embeddings of the contextual text blocks.
  3. **Vector Database**: **Qdrant** is the chosen vector database. `vectorStore.js` integrates the Qdrant client to upsert payload chunks with metadata (like `sessionId`).
  4. **Question Answering**: When `/chat` or `urlService` retrieves a user query, it runs a similarity search against Qdrant, pipes the relevant document contexts alongside the user's prompt, and uses `gemini-1.5-flash` to structure the final answer.

---

## 4. Potential Challenges & Limitations Encountered

During the development and testing of this architecture, several challenges typically arise:

1. **Token Limit Management**:
   - Compressing large PDF datasets can sometimes exceed the prompt token limits to the Gemini model. Chunking logic (via LangChain's text splitters) must be precise to balance context size and LLM limits.
   
2. **Context Hallucination**:
   - If the vector similarity search retrieves loosely related sections, the LLM might hallucinate or merge irrelevant ideas. Ensuring prompt boundaries like "Answer purely based on the provided context" helps mitigate this.

3. **PDF Text Extraction Consistency**:
   - Using libraries like `pdf-parse` can be inconsistent depending on how the PDF was encoded (e.g. scanned documents without OCR, complex multi-column layouts, tabular data). The system struggles without a dedicated layout parsing engine.

4. **Synchronizing Distributed State**:
   - Since the system utilizes session IDs passed from the frontend to securely namespace embeddings in Qdrant (via payload filtering `sessionId`), managing cleanup of stale session vectors poses a challenge to database size over time.

5. **Asynchronous Delays in UI**:
   - RAG pipelines (ingestion -> embedding -> storing -> answering) carry latency. Designing a frontend application that robustly handles loading states without making the application appear frozen necessitates optimistic UI updates and `Loader2` spin states, as implemented in `App.jsx`.

---
*End of Documentation.*
