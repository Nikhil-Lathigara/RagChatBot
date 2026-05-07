# RagChatBot

This repository contains a React/Vite frontend and an Express backend for a retrieval-augmented generation (RAG) chatbot.

## Deployment

### GitHub
- The repository is configured with a GitHub Actions workflow at `.github/workflows/ci.yml`.
- The workflow installs dependencies for both `frontend` and `backend` and builds the frontend on `main` branch pushes and pull requests.

### Vercel (frontend)
- Deploy the `frontend` directory as the Vercel project root.
- Set an environment variable in Vercel:
  - `VITE_BACKEND_URL` = `https://<your-render-backend>.onrender.com`
- The frontend build is configured with `frontend/vercel.json` and uses Vite.

### Render (backend)
- Render service configuration is provided in `render.yaml`.
- Deploy the backend service with the root set to `backend`.
- Configure these environment variables on Render or in `render.yaml`:
  - `OPENROUTER_API_KEY`
  - `QDRANT_URL` (for example, a cloud-hosted Qdrant endpoint)
  - `QDRANT_COLLECTION`
  - `QDRANT_DISTANCE`
  - `QDRANT_VECTOR_SIZE`

## Local development

### Backend
- Copy `backend/.env.example` to `backend/.env` and populate the values.
- Run:
  ```bash
  cd backend
  npm install
  npm start
  ```

### Frontend
- Copy `frontend/.env.example` to `frontend/.env` if you need a local backend URL.
- Run:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
