# main.py
import os
import json
import tempfile
from fastapi import FastAPI, Depends, HTTPException, Header, Request, Query, UploadFile, File, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import multiprocessing
import uvicorn

# --- RAG Imports ---
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader, UnstructuredWordDocumentLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# --- Google API Imports ---
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

# Import the combined agent function
from agents import generate_full_launch_kit

load_dotenv()
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# --- Production URLs ---
# Note: For production, it's best practice to set these as environment variables.
# They are hardcoded here for simplicity as requested.
BACKEND_URL = "https://huggingface.co/spaces/mayankrathi0805/MarketForgeAI-Backend"
FRONTEND_URL = "https://market-forge-ai-beryl.vercel.app"
GOOGLE_CALLBACK_URI = f"{BACKEND_URL}/api/v1/auth/google/callback"

# --- Google OAuth 2.0 Configuration (UPDATED FOR PRODUCTION) ---
CLIENT_SECRETS_CONFIG = {
    "web": {
        "client_id": os.environ.get("GOOGLE_CLIENT_ID"),
        "project_id": "marketforge-ai",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": os.environ.get("GOOGLE_CLIENT_SECRET"),
        "redirect_uris": [
            "http://localhost:8000/api/v1/auth/google/callback",
            GOOGLE_CALLBACK_URI # <-- This now includes your production URL
        ]
    }
}
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

# --- Configuration & Clients ---
def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    return create_client(url, key)

# --- Authentication Dependency ---
async def get_current_user(
    authorization: Optional[str] = Header(None),
    auth_query: Optional[str] = Query(None, alias="authorization"),
    supabase: Client = Depends(get_supabase_client)
):
    token_str = authorization or auth_query
    if not token_str or not token_str.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization scheme")

    token = token_str.split(" ")[1]
    try:
        user_response = supabase.auth.get_user(token)
        return user_response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token or user not found")

# --- Pydantic Data Models ---
class UserCredentials(BaseModel):
    email: str
    password: str

class ScheduleItem(BaseModel):
    day: str
    time: str
    content: str

class LaunchKitResponse(BaseModel):
    id: str
    market_analysis: str
    product_copy: str
    ad_copy: str
    social_posts: list[str]
    schedule: List[ScheduleItem]

class HistoryItem(BaseModel):
    id: str
    product_idea: str
    created_at: datetime

# --- RAG Helper Function ---
def process_document(file: UploadFile) -> Optional[FAISS]:
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name

        if file.content_type == 'application/pdf':
            loader = PyPDFLoader(tmp_path)
        elif file.content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            loader = UnstructuredWordDocumentLoader(tmp_path)
        elif file.content_type == 'text/plain':
            loader = TextLoader(tmp_path)
        else:
            return None

        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        chunks = text_splitter.split_documents(documents)
        
        embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        print("--- Creating vector store from document... ---")
        vector_store = FAISS.from_documents(chunks, embedding_model)
        print("--- Vector store created successfully. ---")
        return vector_store
    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)

# --- FastAPI App Initialization ---
app = FastAPI(title="MarketForge AI API")

# --- CORS Middleware (UPDATED FOR PRODUCTION) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080", 
        "http://localhost:5173",
        FRONTEND_URL # <-- This now includes your production frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/auth/signup")
async def signup(creds: UserCredentials, supabase: Client = Depends(get_supabase_client)):
    try:
        res = supabase.auth.sign_up({"email": creds.email, "password": creds.password})
        return {"message": "User signed up successfully. Please check your email to verify.", "data": res.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/auth/login")
async def login(creds: UserCredentials, supabase: Client = Depends(get_supabase_client)):
    try:
        res = supabase.auth.sign_in_with_password({"email": creds.email, "password": creds.password})
        return {"access_token": res.session.access_token, "user_id": res.user.id}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/v1/generate-launch-kit")
def generate_launch_kit(
    product_idea: str = Form(...),
    file: Optional[UploadFile] = File(None),
    supabase: Client = Depends(get_supabase_client),
    current_user = Depends(get_current_user)
):
    vector_store = None
    if file:
        vector_store = process_document(file)

    try:
        full_kit = generate_full_launch_kit(product_idea, vector_store)
        
        data_to_save = {
            "user_id": str(current_user.id),
            "product_idea": product_idea,
            "market_analysis": full_kit["market_analysis"],
            "product_copy": full_kit["product_copy"],
            "ad_copy": full_kit["ad_copy"],
            "social_posts": json.dumps(full_kit["social_posts"]),
            "schedule": json.dumps(full_kit["schedule"])
        }
        insert_response = supabase.table("launch_kits").insert(data_to_save).execute()
        saved_data = insert_response.data[0]
        return {
            "id": saved_data["id"],
            "market_analysis": saved_data["market_analysis"],
            "product_copy": saved_data["product_copy"],
            "ad_copy": saved_data["ad_copy"],
            "social_posts": json.loads(saved_data["social_posts"]),
            "schedule": json.loads(saved_data["schedule"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@app.get("/api/v1/history", response_model=List[HistoryItem])
def get_history(
    supabase: Client = Depends(get_supabase_client),
    current_user = Depends(get_current_user)
):
    try:
        response = supabase.table("launch_kits").select("id, product_idea, created_at").eq("user_id", str(current_user.id)).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

@app.get("/api/v1/history/{kit_id}", response_model=LaunchKitResponse)
def get_history_item(
    kit_id: str,
    supabase: Client = Depends(get_supabase_client),
    current_user = Depends(get_current_user)
):
    try:
        response = supabase.table("launch_kits").select("*").eq("id", kit_id).eq("user_id", str(current_user.id)).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Launch kit not found or you do not have permission to view it.")
        
        saved_data = response.data
        return {
            "id": saved_data["id"],
            "market_analysis": saved_data["market_analysis"],
            "product_copy": saved_data["product_copy"],
            "ad_copy": saved_data["ad_copy"],
            "social_posts": json.loads(saved_data["social_posts"]),
            "schedule": json.loads(saved_data["schedule"])
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to fetch launch kit details: {str(e)}")

@app.get("/api/v1/auth/google/authorize")
def google_auth_authorize(current_user = Depends(get_current_user)):
    flow = Flow.from_client_config(
        client_config=CLIENT_SECRETS_CONFIG,
        scopes=SCOPES,
        redirect_uri=GOOGLE_CALLBACK_URI
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true',
        state=str(current_user.id)
    )
    return RedirectResponse(authorization_url)

@app.get("/api/v1/auth/google/callback")
async def google_auth_callback(request: Request, supabase: Client = Depends(get_supabase_client)):
    flow = Flow.from_client_config(
        client_config=CLIENT_SECRETS_CONFIG,
        scopes=SCOPES,
        redirect_uri=GOOGLE_CALLBACK_URI
    )
    flow.fetch_token(authorization_response=str(request.url))
    credentials = flow.credentials
    user_id = request.query_params.get("state")
    creds_data = {
        'user_id': user_id,
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': ",".join(credentials.scopes)
    }
    supabase.table('user_google_credentials').upsert(creds_data).execute()
    return HTMLResponse(content="<script>window.close();</script>")

@app.post("/api/v1/schedule/{kit_id}")
def schedule_to_calendar(
    kit_id: str,
    supabase: Client = Depends(get_supabase_client),
    current_user = Depends(get_current_user)
):
    try:
        creds_response = supabase.table('user_google_credentials').select('*').eq('user_id', str(current_user.id)).execute()
        if not creds_response.data:
            raise HTTPException(status_code=401, detail="User has not authorized Google Calendar access.")
        creds_info = creds_response.data[0]
        credentials = Credentials.from_authorized_user_info(creds_info)
        service = build('calendar', 'v3', credentials=credentials)
        kit_response = supabase.table('launch_kits').select('schedule, product_idea').eq('id', kit_id).single().execute()
        if not kit_response.data:
            raise HTTPException(status_code=404, detail="Launch kit not found.")
        schedule_list = json.loads(kit_response.data['schedule'])
        product_idea = kit_response.data['product_idea']
        start_date = datetime.now().date() + timedelta(days=2)
        events_created = 0
        for item in schedule_list:
            if not item.get('time') or not item.get('content'):
                print(f"[WARNING] Skipping invalid schedule item: {item}")
                continue
            day_offset = int(item['day'].split(' ')[1]) - 1
            event_date = start_date + timedelta(days=day_offset)
            event_time = datetime.strptime(item['time'], '%I:%M %p').time()
            start_datetime = datetime.combine(event_date, event_time)
            end_datetime = start_datetime + timedelta(hours=1)
            event = {
                'summary': f'Social Post: {product_idea[:30]}...',
                'description': item['content'],
                'start': {'dateTime': start_datetime.isoformat(), 'timeZone': 'UTC'},
                'end': {'dateTime': end_datetime.isoformat(), 'timeZone': 'UTC'},
            }
            service.events().insert(calendarId='primary', body=event).execute()
            events_created += 1
        return {"message": f"Successfully scheduled {events_created} posts to your Google Calendar!"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# This block is for running the server locally
if __name__ == '__main__':
    multiprocessing.freeze_support()
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, workers=1)
