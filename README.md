# AI Study Buddy 🧠📚

> **Your intelligent companion for solving information overload.**  
> AI Study Buddy acts as an on-demand virtual tutor by ingesting academic documents (PDFs, DOCX, etc.) and using Artificial Intelligence to summarize content, generate quizzes for self-assessment, and answer questions in real-time.

---

## 🚀 Features

-   **📄 Document Ingestion**: Upload PDF, DOCX, or TXT study materials. The system automatically extracts text and prepares it for AI analysis.
-   **📝 Smart Summaries**: Instantly generate concise, bullet-pointed summaries of long documents to grasp key concepts quickly.
-   **💬 AI Tutor (RAG Chat)**: Chat with your documents! Ask questions and get answers based *strictly* on the content you uploaded, powered by Retrieval-Augmented Generation (RAG).
-   **✅ Auto-Generated Quizzes**: Test your knowledge with AI-generated multiple-choice quizzes.
    -   Instant grading and score tracking.
    -   Focuses on key topics from your specific materials.
-   **💾 Persistence**: Documents and chat contexts are saved locally, so you can pick up where you left off even after a server restart.

---

## 🛠️ Technical Stack

This project uses a modern, lightweight, and efficient tech stack:

### **Backend**
-   **Language**: Python 3.10+
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (High-performance web API)
-   **AI & LLM**: 
    -   **Google Gemini** (`gemma-3-1b-it` / Gemini Flash) for generation.
    -   **LangChain** for RAG pipeline orchestration and prompt management.
-   **Data Processing**: 
    -   `pypdf` & `python-docx` for file parsing.
    -   `RecursiveCharacterTextSplitter` for intelligent text chunking.
-   **Storage**: Local JSON-based persistence for document chunks and vector storage.

### **Frontend**
-   **Framework**: React (TypeScript)
-   **Styling**: Tailwind CSS for a clean, modern, dark-mode UI.
-   **Icons**: Lucide React.
-   **HTTP Client**: Fetch API for communicating with the backend.

---

## ⚡ Getting Started

### Prerequisites
-   **Node.js** (for frontend)
-   **Python 3.10+** (for backend)
-   **Google Gemini API Key**

### 1. Backend Setup
1.  Navigate to the project root.
2.  Install Python dependencies:
    ```bash
    pip install fastapi uvicorn google-genai langchain-google-genai pypdf python-docx python-dotenv
    ```
3.  Create a `.env` file in the root directory and add your API Key:
    ```env
    API_KEY=your_google_gemini_api_key_here
    ```
4.  Start the backend server:
    ```bash
    python main.py
    ```
    *The server will start on `http://localhost:8001`.*

### 2. Frontend Setup
1.  Navigate to the frontend directory (if separate) or ensure `node_modules` are installed in the root if it's a monorepo structure.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *The app will typically run on `http://localhost:5173`.*

---

## 📖 Usage Guide

1.  **Upload**: Go to the "Documents" tab and upload your study material (PDF/DOCX).
2.  **Summary**: Click "Generate Summary" to get a quick overview.
3.  **Chat**: Switch to the "Chat" tab and ask specific questions like *"What is the main conclusion of this paper?"*.
4.  **Quiz**: Go to the "Quiz" tab and click "Generate Quiz" to challenge yourself. Submit your answers to see your score!

---

## 🔮 Future Roadmap (Planned)
-   [ ] **Vector Database**: Migrate from local JSON storage to a dedicated Vector DB (PGVector/Pinecone) for scalable semantic search.
-   [ ] **User Accounts**: Add authentication (Auth0/Firebase) to save user progress across devices.
-   [ ] **Multi-Document Chat**: Ability to query across *all* uploaded documents simultaneously.
-   [ ] **Flashcards**: Auto-generate flashcards for spaced repetition.

---

*Verified & maintained by the AI Study Buddy Team.*
