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
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://zkzoaaegbguanrtxaucx.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprem9hYWVnYmd1YW5ydHhhdWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MjQyODYsImV4cCI6MjA4OTAwMDI4Nn0.R8t7JFy03Hue7BfSG0HrSPrdlOMJk6duCKiYzLM9SzY")
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print(f"[INFO] Supabase client initialized for project: {SUPABASE_URL}")
# ─────────────────────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")

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
    result = supabase_client.table("users").select("id, name, email, status, created_at").eq("email", email).execute()
    if not result.data:
        raise credentials_exception
    return result.data[0]

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

MODEL_NAME = 'gemini-2.5-flash'  # You can change this to a different model if desired

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
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = file.filename
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    content = ""
    
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
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    if not content.strip():
         raise HTTPException(status_code=400, detail="The document appears to be empty.")

    doc_id = process_and_store_document(content)

    return {
        "title": filename,
        "content": content,
        "docId": doc_id
    }

@app.post("/api/summary")
async def generate_summary(request: SummaryRequest):
    if not direct_model:
        raise HTTPException(status_code=500, detail="Server misconfigured: GenAI client not initialized (Missing API Key?).")
        
    try:
        prompt = f"Please provide a concise but comprehensive summary of the following study material. Use bullet points for key concepts:\n\n{request.text}"
        response = direct_model(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "max_output_tokens": 1000
            }
        )
        return {"summary": response.text}
    except Exception as e:
        print(f"Summary Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
        
        response = direct_model(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "max_output_tokens": 2000,
                "temperature": 0.2
            }
        )
        
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

        prompt = ChatPromptTemplate.from_template("""
        You are an AI Study Buddy. Answer the user's question based ONLY on the following context.
        If the answer is not in the context, say you don't know based on the provided document.
        
        <context>
        {context}
        </context>

        Question: {input}
        """)

        document_chain = create_stuff_documents_chain(llm, prompt)
        
        response = document_chain.invoke({
            "input": request.message,
            "context": context_docs
        })

        return {"text": response}

    except Exception as e:
        print(f"Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
