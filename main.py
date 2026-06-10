import os
import json
import io
import uuid
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from jose import JWTError, jwt
from supabase import create_client, Client
import bcrypt as _bcrypt


load_dotenv()

# ── Auth Config ──────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get("SECRET_KEY", "studybuddy-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# ── Supabase Setup ────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://clnpiqxtfpykdcantjvi.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsbnBpcXh0ZnB5a2RjYW50anZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTA2OTgsImV4cCI6MjA4ODcyNjY5OH0.cFOaFys9iLE-VxwzlYqSIqYjVSlBiqSPwWvNqxXu6_0")
# Optional: prefer the service role key for server-side operations so RLS doesn't block server calls.
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if SUPABASE_SERVICE_ROLE_KEY:
    supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    print(f"[INFO] Supabase client initialized for project: {SUPABASE_URL} using SERVICE_ROLE key")
else:
    supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"[WARN] Supabase client initialized for project: {SUPABASE_URL} using anon/regular key.\n[WARN] If you use custom JWTs or RLS, SELECT queries may return no rows. Consider setting SUPABASE_SERVICE_ROLE_KEY in the environment for server operations.")

# Set connection timeout/auth helper
supabase_client.postgrest.auth = supabase_client.auth
print(f"[INFO] Connection timeout set to 30 seconds")
# ─────────────────────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")

def retry_supabase_operation(operation_func, max_retries=3, retry_delay=0.5):
    """Helper function to retry Supabase operations with exponential backoff"""
    import time
    for attempt in range(max_retries):
        try:
            return operation_func()
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(retry_delay * (attempt + 1))
                continue
            else:
                print(f"[ERROR] Supabase operation failed after {max_retries} attempts: {e}")
                raise HTTPException(status_code=503, detail="Database service temporarily unavailable. Please try again.")

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Use retry helper for Supabase query
    def query_user():
        result = supabase_client.table("users").select("id, name, email, status, created_at").eq("email", email).execute()
        if not result.data:
            raise credentials_exception
        return result.data[0]

    return retry_supabase_operation(query_user)

def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("status") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return current_user

# ── Auth Pydantic Models ──────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
class ChangePasswordRequest(BaseModel):
    new_password: str

class ChangeRoleRequest(BaseModel):
    status: str

class ChangeStatusRequest(BaseModel):
    account_status: str

class DocumentCreate(BaseModel):
    title: str
    content: str
    docId: str
    summary: str | None = None

class QuizResultCreate(BaseModel):
    docId: str
    docTitle: str
    score: int
    totalQuestions: int

class StudySessionCreate(BaseModel):
    durationMinutes: int
# ─────────────────────────────────────────────────────────────────────────────

from google import genai

# LangChain Imports
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

import pypdf
from docx import Document as DocxDocument

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.environ.get("API_KEY")

MODEL_NAME = 'gemini-2.5-flash-lite'  # Using 2.0 flash model (confirmed available)

llm = None
direct_model = None

print(f"Debug: API_KEY present: {bool(api_key)}")

if api_key:
    try:
        print("Debug: Initializing Google GenAI client...")
        client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
        direct_model = client.models.generate_content
        print("Debug: GenAI client initialized")

        print("Debug: Initializing LangChain...")
        llm = ChatGoogleGenerativeAI(model=MODEL_NAME, google_api_key=api_key)
        print("[SUCCESS] AI Clients initialized successfully.")
    except Exception as e:
        print(f"[ERROR] Warning: Failed to initialize AI clients: {e}")
        import traceback
        traceback.print_exc()
else:
    print("[ERROR] Warning: API_KEY not found in environment variables. AI features will fail.")

document_chunks: Dict[str, List[str]] = {}
STORAGE_DIR = "storage"
if not os.path.exists(STORAGE_DIR):
    os.makedirs(STORAGE_DIR)
class SummaryRequest(BaseModel):
    text: str
    length: str = "medium"
    doc_title: str = ""

class QuizRequest(BaseModel):
    text: str
    num_questions: int = 5

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    docId: str
    history: List[ChatMessage]

class ParaphraseRequest(BaseModel):
    text: str

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            t = page.extract_text()
            if t: text += t + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    text = ""
    try:
        doc = DocxDocument(io.BytesIO(file_bytes))
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        raise HTTPException(status_code=400, detail="Could not extract text from DOCX.")
    return text

def process_and_store_document(text: str) -> str:
    """Splits document text into chunks and stores them in memory AND disk."""
    doc_id = str(uuid.uuid4())

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=5000,
        chunk_overlap=200
    )
    chunks = text_splitter.split_text(text)

    if not chunks:
        raise HTTPException(status_code=400, detail="Document is empty or could not be split.")

    document_chunks[doc_id] = chunks

    try:
        file_path = os.path.join(STORAGE_DIR, f"{doc_id}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(chunks, f)
        print(f"Debug: Successfully saved document {doc_id} to {file_path}")
    except Exception as e:
        print(f"Warning: Failed to persist document to disk: {e}")

    return doc_id

def create_stuff_documents_chain(llm, prompt):
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    return (
        RunnablePassthrough.assign(context=lambda x: format_docs(x["context"]))
        | prompt
        | llm
        | StrOutputParser()
    )

@app.get("/")
def health_check():
    return {"status": "ok", "model": MODEL_NAME, "rag_enabled": True, "api_key_configured": bool(api_key)}

# ── Auth Routes ───────────────────────────────────────────────────────────────
@app.post("/api/auth/register", response_model=TokenResponse)
def register(req: RegisterRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    # Check if email already exists
    existing = supabase_client.table("users").select("id").eq("email", req.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "name": req.name,
        "email": req.email,
        "status": "user",
        "password": hash_password(req.password),
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase_client.table("users").insert(new_user).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user.")
    token = create_access_token({"sub": req.email})
    user_data = {"id": user_id, "name": req.name, "email": req.email, "status": "user", "created_at": new_user["created_at"]}
    return TokenResponse(access_token=token, token_type="bearer", user=user_data)

@app.post("/api/auth/login", response_model=TokenResponse)
def login(req: LoginRequest):
    result = supabase_client.table("users").select("*").eq("email", req.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    user = result.data[0]
    if not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token({"sub": req.email})
    user_data = {"id": user["id"], "name": user["name"], "email": user["email"], "status": user.get("status", "user"), "created_at": user["created_at"]}
    return TokenResponse(access_token=token, token_type="bearer", user=user_data)

@app.get("/api/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@app.get("/api/auth/verify")
def verify_token(current_user: dict = Depends(get_current_user)):
    return {"valid": True, "user_id": current_user["id"]}

# ── Admin Routes ──────────────────────────────────────────────────────────────
@app.get("/api/admin/users")
def admin_list_users(admin: dict = Depends(get_current_admin)):
    result = supabase_client.table("users").select("id, name, email, status, created_at").execute()
    return result.data or []

@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    result = supabase_client.table("users").delete().eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "User deleted successfully."}

@app.put("/api/admin/users/{user_id}/password")
def admin_change_password(user_id: str, req: ChangePasswordRequest, admin: dict = Depends(get_current_admin)):
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    hashed = hash_password(req.new_password)
    result = supabase_client.table("users").update({"password": hashed}).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": "Password updated successfully."}

@app.put("/api/admin/users/{user_id}/role")
def admin_change_role(user_id: str, req: ChangeRoleRequest, admin: dict = Depends(get_current_admin)):
    if req.status not in ("user", "admin"):
        raise HTTPException(status_code=400, detail="status must be 'user' or 'admin'.")
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="You cannot change your own role.")
    result = supabase_client.table("users").update({"status": req.status}).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": f"User role updated to {req.status}."}

@app.put("/api/admin/users/{user_id}/status")
def admin_toggle_user_status(user_id: str, req: ChangeStatusRequest, admin: dict = Depends(get_current_admin)):
    if req.account_status not in ("active", "inactive"):
        raise HTTPException(status_code=400, detail="account_status must be 'active' or 'inactive'.")
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="You cannot change your own account status.")
    result = supabase_client.table("users").update({"account_status": req.account_status}).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"message": f"User account status updated to {req.account_status}."}

@app.get("/api/admin/users/{user_id}/details")
def admin_get_user_details(user_id: str, admin: dict = Depends(get_current_admin)):
    user_result = supabase_client.table("users").select("*").eq("id", user_id).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found.")

    user = user_result.data[0]

    docs_result = supabase_client.table("documents").select("id, title, created_at").eq("user_id", user_id).order("created_at", desc=True).execute()
    quizzes_result = supabase_client.table("quiz_results").select("id, score, total_questions, created_at").eq("user_id", user_id).order("created_at", desc=True).execute()

    activities = []
    for doc in docs_result.data or []:
        activities.append({
            "action": f"Uploaded document: {doc['title']}",
            "timestamp": doc["created_at"]
        })
    for quiz in quizzes_result.data or []:
        activities.append({
            "action": f"Completed quiz: {quiz['score']}/{quiz['total_questions']} correct",
            "timestamp": quiz["created_at"]
        })
    activities.sort(key=lambda x: x["timestamp"], reverse=True)

    return {
        "user": user,
        "documents": docs_result.data or [],
        "quiz_results": quizzes_result.data or [],
        "recent_activity": activities[:20]
    }
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    filename = file.filename
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    content = ""

    image_extensions = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg", "ico", "tiff", "heic"]
    if extension in image_extensions:
        raise HTTPException(status_code=400, detail="Image files are not supported. Please upload a PDF, DOCX, or TXT file.")

    file_bytes = await file.read()

    if extension == "pdf":
        content = extract_text_from_pdf(file_bytes)
    elif extension in ["docx", "doc"]:
        content = extract_text_from_docx(file_bytes)
    elif extension == "txt":
        try:
            content = file_bytes.decode("utf-8")
        except:
            content = file_bytes.decode("latin-1")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF, DOCX, DOC, or TXT file.")

    if not content.strip():
         raise HTTPException(status_code=400, detail="The document appears to be empty.")

    doc_id = process_and_store_document(content)

    # Save to database
    db_doc_id = str(uuid.uuid4())
    new_doc = {
        "id": db_doc_id,
        "user_id": current_user["id"],
        "title": filename,
        "content": content,
        "doc_id": doc_id,
        "summary": None,
        "created_at": datetime.utcnow().isoformat()
    }
    try:
        result = supabase_client.table("documents").insert(new_doc).execute()
        # Postgrest client returns .data on success, .error on failure
        if getattr(result, "error", None):
            print(f"Error saving document (postgrest error): {result.error}")
        if not getattr(result, "data", None):
            # Surface the error to the client so it's visible during upload
            err_msg = getattr(result, "error", None) or "Unknown error saving document"
            print(f"Failed to save document to DB: {err_msg}")
            raise HTTPException(status_code=500, detail=f"Failed to save document to DB: {err_msg}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Exception when saving document: {e}")
        raise HTTPException(status_code=500, detail=f"Exception when saving document: {e}")

    return {
        "title": filename,
        "content": content,
        "docId": doc_id,
        "id": db_doc_id
    }

# ── User Documents ───────────────────────────────────────────────────────────
@app.post("/api/documents")
async def create_document(doc: DocumentCreate, current_user: dict = Depends(get_current_user)):
    doc_id = str(uuid.uuid4())
    new_doc = {
        "id": doc_id,
        "user_id": current_user["id"],
        "title": doc.title,
        "content": doc.content,
        "doc_id": doc.docId,
        "summary": doc.summary,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase_client.table("documents").insert(new_doc).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save document.")
    return new_doc

@app.get("/api/documents")
async def get_documents(current_user: dict = Depends(get_current_user)):
    result = supabase_client.table("documents").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return result.data or []

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase_client.table("documents").delete().eq("id", doc_id).eq("user_id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"message": "Document deleted successfully."}

@app.put("/api/documents/{doc_id}/summary")
async def update_document_summary(doc_id: str, request: SummaryRequest, current_user: dict = Depends(get_current_user)):
    result = supabase_client.table("documents").update({"summary": request.text}).eq("id", doc_id).eq("user_id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"message": "Summary updated successfully."}

# ── Quiz Results ─────────────────────────────────────────────────────────────
@app.post("/api/quiz-results")
async def create_quiz_result(quiz_result: QuizResultCreate, current_user: dict = Depends(get_current_user)):
    result_id = str(uuid.uuid4())
    new_result = {
        "id": result_id,
        "user_id": current_user["id"],
        "doc_id": quiz_result.docId,
        "doc_title": quiz_result.docTitle,
        "score": quiz_result.score,
        "total_questions": quiz_result.totalQuestions,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase_client.table("quiz_results").insert(new_result).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save quiz result.")
    return new_result

@app.get("/api/quiz-results")
async def get_quiz_results(current_user: dict = Depends(get_current_user)):
    result = supabase_client.table("quiz_results").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return result.data or []

# ── Study Sessions ──────────────────────────────────────────────────────────
@app.post("/api/study-sessions")
async def create_study_session(session: StudySessionCreate, current_user: dict = Depends(get_current_user)):
    session_id = str(uuid.uuid4())
    new_session = {
        "id": session_id,
        "user_id": current_user["id"],
        "duration_minutes": session.durationMinutes,
        "created_at": datetime.utcnow().isoformat()
    }
    result = supabase_client.table("study_sessions").insert(new_session).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save study session.")
    return new_session

@app.get("/api/study-sessions")
async def get_study_sessions(current_user: dict = Depends(get_current_user)):
    result = supabase_client.table("study_sessions").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return result.data or []

@app.get("/api/dashboard-stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    # Get document count
    docs_result = supabase_client.table("documents").select("id", count="exact").eq("user_id", current_user["id"]).execute()
    doc_count = docs_result.count if docs_result.count is not None else 0

    # Get quiz results
    quiz_result = supabase_client.table("quiz_results").select("*").eq("user_id", current_user["id"]).execute()
    quiz_results = quiz_result.data or []
    quiz_count = len(quiz_results)

    # Calculate average score
    avg_score = 0
    if quiz_count > 0:
        total_percentage = sum((q["score"] / q["total_questions"]) * 100 for q in quiz_results)
        avg_score = round(total_percentage / quiz_count)

    # Get study time
    sessions_result = supabase_client.table("study_sessions").select("duration_minutes").eq("user_id", current_user["id"]).execute()
    sessions = sessions_result.data or []
    total_study_minutes = sum(s["duration_minutes"] for s in sessions)

    # Get recent quiz results (last 5)
    recent_quizzes = quiz_results[:5]

    # Get recent documents
    docs_list = supabase_client.table("documents").select("id, title, created_at").eq("user_id", current_user["id"]).order("created_at", desc=True).limit(4).execute()
    recent_docs = docs_list.data or []

    return {
        "documentCount": doc_count,
        "quizCount": quiz_count,
        "averageScore": avg_score,
        "studyHours": round(total_study_minutes / 60, 1),
        "recentQuizzes": recent_quizzes,
        "recentDocuments": recent_docs
    }

@app.post("/api/summary")
async def generate_summary(request: SummaryRequest):
    if not direct_model:
        raise HTTPException(status_code=500, detail="Server misconfigured: GenAI client not initialized (Missing API Key?).")

    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Document content is too short to summarize.")

    doc_title = request.doc_title or "the document"
    text_content = request.text

    print(f"[SUMMARY] Generating {request.length} summary for: {doc_title}")
    print(f"[SUMMARY] Text length: {len(text_content)} chars")

    if request.length == "short":
        prompt = f"""You are a study assistant. Read the following document and create a VERY BRIEF summary.

DOCUMENT TITLE: {doc_title}

REQUIREMENTS:
- Write exactly 3 bullet points
- Each bullet must be on ONE LINE only
- Use completely different words than the original text
- Focus on the 3 most important concepts
- Do NOT copy text directly - paraphrase everything

DOCUMENT TEXT:
{text_content[:3000]}

YOUR RESPONSE (exactly 3 lines, each starting with •):"""
        max_tokens = 500
        temp = 0.5

    elif request.length == "long":
        prompt = f"""You are a study assistant. Read the following document and create a DETAILED summary.

DOCUMENT TITLE: {doc_title}

REQUIREMENTS:
- Write a comprehensive summary with introduction paragraph
- List 8-10 main topics with 2-3 sentences of explanation each
- Include all important definitions and terminology
- Add examples from the text where relevant
- End with a conclusion paragraph
- Use your OWN WORDS - do not copy text verbatim
- Be thorough and detailed

DOCUMENT TEXT:
{text_content}

YOUR DETAILED SUMMARY:"""
        max_tokens = 4500
        temp = 0.4

    else:
        prompt = f"""You are a study assistant. Read the following document and create a BALANCED summary.

DOCUMENT TITLE: {doc_title}

REQUIREMENTS:
- Start with a brief intro paragraph (2-3 sentences)
- List 5-6 main points, each with 1-2 sentences of explanation
- Include key definitions (at least 3 terms)
- End with a main takeaway or conclusion
- Use your OWN WORDS - paraphrase, don't copy
- Be informative but keep it readable

DOCUMENT TEXT:
{text_content[:6000]}

YOUR BALANCED SUMMARY:"""
        max_tokens = 2000
        temp = 0.35

    try:
        response = direct_model(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "max_output_tokens": max_tokens,
                "temperature": temp
            }
        )

        summary_text = response.text.strip()
        print(f"[SUMMARY] Generated {len(summary_text)} chars")

        if not summary_text:
            raise Exception("Empty response from AI")

        return {"summary": summary_text}

    except HTTPException:
        raise
    except Exception as api_error:
        error_str = str(api_error)
        print(f"[SUMMARY ERROR] {error_str}")
        if "image" in error_str.lower():
            raise HTTPException(status_code=400, detail="Image files are not supported. Please provide text content only.")
        if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
            raise HTTPException(status_code=429, detail="API quota exceeded. You have used up your daily/monthly quota. Please upgrade your API plan or try again later.")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(api_error)}")

@app.post("/api/quiz")
async def generate_quiz(request: QuizRequest):
    if not direct_model:
        raise HTTPException(status_code=500, detail="Server misconfigured: GenAI client not initialized (Missing API Key?).")

    try:
        system_instruction = """You are a strict quiz generator.
        Create exactly the requested number of questions.
        Return a JSON ARRAY of objects. Do not wrap it in a root object like "questions".
        Each object must have: "question", "options" (array of strings), "correctAnswerIndex" (0-based integer).
        Return ONLY valid JSON."""

        prompt = f"{system_instruction}\n\nGenerate a multiple-choice quiz with {request.num_questions} questions based on the following text:\n\n{request.text}"

        try:
            response = direct_model(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "max_output_tokens": 2000,
                    "temperature": 0.2
                }
            )
        except Exception as api_error:
            error_str = str(api_error)
            if "image" in error_str.lower():
                raise HTTPException(status_code=400, detail="Image files are not supported. Please provide text content only.")
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                raise HTTPException(status_code=429, detail="API quota exceeded. You have used up your daily/monthly quota. Please upgrade your API plan or try again later.")
            raise

        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            if text.endswith("```"):
                text = text.rsplit("\n", 1)[0]

        data = json.loads(text)

        if isinstance(data, dict):
            if "questions" in data and isinstance(data["questions"], list):
                data = data["questions"]
            elif "quiz" in data and isinstance(data["quiz"], list):
                data = data["quiz"]
            else:
                for key, value in data.items():
                    if isinstance(value, list):
                        data = value
                        break

        if not isinstance(data, list):
            raise ValueError("AI did not return a list of questions.")

        return data
    except HTTPException:
        raise
    except Exception as e:
        print(f"Quiz Generation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz. Check backend logs.")

@app.post("/api/chat")
async def chat_response(request: ChatRequest):
    if not llm:
        raise HTTPException(status_code=500, detail="Server misconfigured: LLM not initialized (Missing API Key?).")

    if request.docId not in document_chunks:
        file_path = os.path.join(STORAGE_DIR, f"{request.docId}.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    document_chunks[request.docId] = json.load(f)
                print(f"Debug: Restored document {request.docId} from disk.")
            except Exception as e:
                print(f"Error loading document from disk: {e}")

    if request.docId not in document_chunks:
        raise HTTPException(status_code=404, detail="Document not found in memory. It might have been cleared. Please re-upload.")

    try:
        chunks = document_chunks[request.docId]
        context_docs = [Document(page_content=chunk) for chunk in chunks]

        user_message = request.message.lower().strip()

        # Handle greetings
        greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', "what's up", 'wassup']
        if any(g == user_message or user_message.startswith(g + ' ') or user_message.startswith(g + ',') for g in greetings):
            return {"text": "Hello! I'm your study assistant. Feel free to ask me any questions about the document you're reading, and I'll help you understand the content better."}

        # Handle thank you messages
        thanks = ['thank you', 'thanks', 'thank you so much', 'thanks a lot', 'appreciate it', 'thx']
        if any(t in user_message for t in thanks):
            return {"text": "You're welcome! I'm happy to help. Feel free to ask more questions if you need anything else."}

        # Handle goodbye messages
        goodbye = ['bye', 'goodbye', 'see you', 'talk to you later', 'thanks for helping']
        if any(g in user_message for g in goodbye):
            return {"text": "Goodbye! Good luck with your studies. Feel free to come back anytime if you need help!"}

        # Build the prompt - with paraphrasing, no verbatim copying, and polite fallbacks
        prompt_text = """You are a helpful AI Study Assistant. Your role is to help students understand their study materials better.

CRITICAL RULES - Follow these strictly:
1. PARAPHRASE EVERYTHING: Never copy text verbatim from the document. Always rephrase and explain in your own words while maintaining accuracy.
2. Be conversational and friendly, like a helpful tutor.
3. When information is in the document: Explain it clearly in your own words with examples or analogies when helpful.
4. When information is NOT in the document: Politely say "I couldn't find information about that in your document. However, based on general knowledge..." and then provide a helpful answer. Do not apologize excessively or make the user feel bad for asking.
5. Use bullet points or numbered lists when presenting multiple points.
6. Keep answers focused but informative.
{rephrase_instruction}

Document Context:
{context}

Question: {input}

Your Answer:"""

        # Check if user is asking to explain in their own words or simplify
        rephrase_instructions = ""
        if "in your own words" in user_message or "rephrase" in user_message or "simplify" in user_message or "explain simply" in user_message or "easier way" in user_message:
            rephrase_instructions = "\n7. The user asked for a simpler explanation - use very plain language, everyday examples, and avoid technical jargon."
        elif "elaborate" in user_message or "more details" in user_message or "explain more" in user_message:
            rephrase_instructions = "\n7. The user wants more detail - provide a thorough explanation with additional examples and context."

        prompt = ChatPromptTemplate.from_template(prompt_text)

        document_chain = create_stuff_documents_chain(llm, prompt)

        response = document_chain.invoke({
            "input": request.message,
            "context": context_docs,
            "rephrase_instruction": rephrase_instructions
        })

        return {"text": response}

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/paraphrase")
async def paraphrase_text(request: ParaphraseRequest):
    print(f"[DEBUG] Paraphrase request received. direct_model available: {direct_model is not None}")

    if not direct_model:
        raise HTTPException(status_code=500, detail="Server misconfigured: GenAI client not initialized (Missing API Key?).")

    if not request.text or len(request.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Text is too short to paraphrase.")

    try:
        prompt = f"""You are an expert at rephrasing and rewording text. Your task is to completely rewrite the given text using DIFFERENT words and sentence structures while preserving the original meaning.

IMPORTANT RULES:
1. Use completely different words and phrases than the original
2. Change the sentence structure and order when possible
3. Do NOT copy any phrases verbatim - EVERY phrase must be rewritten
4. Keep the same meaning but make it sound like a different person wrote it
5. Output ONLY the paraphrased text, nothing else

Text to paraphrase:
{request.text}

Rewritten (completely different words):"""

        print(f"[DEBUG] Calling AI model with text length: {len(request.text)}")

        try:
            response = direct_model(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "max_output_tokens": 2000,
                    "temperature": 0.8
                }
            )
        except Exception as api_error:
            error_str = str(api_error)
            if "image" in error_str.lower():
                raise HTTPException(status_code=400, detail="Image files are not supported. Please provide text content only.")
            raise

        print(f"[DEBUG] Response received: {response}")
        print(f"[DEBUG] Response type: {type(response)}")

        if response is None:
            print("[ERROR] Response is None")
            raise Exception("No response from AI")

        paraphrased_text = ""
        if hasattr(response, 'text'):
            paraphrased_text = response.text.strip() if response.text else ""
        elif isinstance(response, dict) and 'text' in response:
            paraphrased_text = response['text'].strip() if response.get('text') else ""

        print(f"[DEBUG] Extracted text: {paraphrased_text[:100] if paraphrased_text else 'EMPTY'}...")

        if not paraphrased_text:
            raise Exception("Empty response from AI")

        return {"paraphrased": paraphrased_text}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Paraphrase Error: {e}")
        import traceback
        traceback.print_exc()
        error_detail = str(e)
        if "image" in error_detail.lower():
            raise HTTPException(status_code=400, detail="Image files are not supported. Please provide text content only.")
        raise HTTPException(status_code=500, detail=f"Failed to paraphrase text: {error_detail}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
