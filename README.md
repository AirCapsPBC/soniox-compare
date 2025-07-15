# Soniox Compare

Welcome to Soniox Compare, a comprehensive platform for evaluating real-time speech-to-text (STT) and machine translation services. This project highlights the performance of Soniox by enabling side-by-side comparisons with other providers. We provide full source code for transparency, allowing users to independently test and verify the results. The tool features a robust backend and an intuitive frontend, designed to display and compare outputs from multiple selected providers simultaneously.

You can try it out at https://soniox.com/compare/

You can compare the outputs of the following providers:
- [Soniox](https://soniox.com/)
- [Google](https://cloud.google.com/speech-to-text)
- [Azure](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/overview)
- [OpenAI](https://platform.openai.com/docs/api-reference/realtime-sessions/create-transcription)
- [Deepgram](https://www.deepgram.com/)
- [Speechmatics](https://www.speechmatics.com/)
- [AssemblyAI](https://www.assemblyai.com/)

## Running the Project

**Backend (FastAPI - Project Root):**

```bash
# Install dependencies:
uv sync
# Run the backend server:
uv run fastapi dev
# Backend runs on: http://127.0.0.1:8000
```

**Frontend (React/Vite - `frontend/` directory):**

```bash
# Ensure Node.js and yarn are installed
cd frontend
# Install dependencies:
yarn install
# Run the frontend server:
yarn dev
# Frontend runs on: http://localhost:5173/compare/ui/ (proxies to backend)
```

## Core Settings & Configuration

**Backend (Project Root):**

*   **Provider Implementations**: `providers/<provider_name>/provider.py`
    *   Each provider (e.g., `soniox`, `google`) has its own subdirectory in `providers/`.
*   **Provider Configuration**: `config.py` (see `get_provider_config` function).
    *   Loads API keys and settings primarily from environment variables.
    *   Google provider might require `credentials-google.json` in the root directory.
*   **Main Application Logic**: `main.py` (FastAPI routes, WebSocket handling for `/compare/api/compare-websocket`).
*   **Environment Variables**: Create a `.env` file in the project root to store API keys (e.g., `SONIOX_API_KEY`, `AZURE_API_KEY`, etc.). This is loaded by `load_dotenv()` in `main.py` and `config.py`.

**Frontend (`frontend/` directory):**

*   **Core Logic & State**: `src/contexts/comparison-context.tsx`
    *   Manages WebSocket connection, audio processing, and application state.
*   **Mock Data Toggle**: `USE_MOCK_DATA` constant in `src/contexts/comparison-context.tsx`.
*   **UI Components**: `src/components/`
*   **API Proxy (Vite)**: `vite.config.ts` (proxies `/compare` calls to backend at `http://127.0.0.1:8000`).
*   **Provider UI Names/Features**: `src/lib/provider-features.ts`.
*   **Comparison UI Settings (Dropdowns, etc.)**: `src/lib/comparison-constants.ts`.