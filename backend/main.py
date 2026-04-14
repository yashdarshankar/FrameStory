from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import uuid
import json

from auth import get_db, User, get_current_user, verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from models import VideoJob
from celery_worker import process_video_task
from datetime import timedelta

app = FastAPI()

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Endpoints
@app.post("/register")
def register(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == form_data.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(form_data.password)
    user = User(username=form_data.username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}


# Video Endpoints
@app.post("/upload-video")
async def upload_video(
    video: UploadFile = File(...), 
    style: str = Form("Documentary"), 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job_id = str(uuid.uuid4())
    temp_file_path = f"temp_{job_id}_{video.filename}"
    
    with open(temp_file_path, "wb") as f:
        content = await video.read()
        f.write(content)
        
    job = VideoJob(
        id=job_id,
        user_id=current_user.id,
        status="PENDING",
        persona=style
    )
    db.add(job)
    db.commit()
    
    # Send to Celery worker
    process_video_task.delay(job_id, temp_file_path, style, video.filename)
    
    return {"job_id": job_id, "status": "PENDING"}

@app.get("/my-videos")
def my_videos(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    videos = db.query(VideoJob).filter(VideoJob.user_id == current_user.id).all()
    return [{"id": v.id, "status": v.status, "persona": v.persona, "video_url": v.final_video_url} for v in videos]

@app.get("/status/{job_id}")
def get_status(job_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(VideoJob).filter(VideoJob.id == job_id, VideoJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job.id, "status": job.status}

@app.get("/result/{job_id}")
def get_result(job_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(VideoJob).filter(VideoJob.id == job_id, VideoJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    if not job.result_json_path or not os.path.exists(job.result_json_path):
        raise HTTPException(status_code=404, detail="Result JSON not generated yet")
        
    with open(job.result_json_path, 'r') as f:
        data = json.load(f)
    return data

@app.get("/download/{job_id}")
def get_download(request: Request, job_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    job = db.query(VideoJob).filter(VideoJob.id == job_id, VideoJob.user_id == current_user.id).first()
    if not job or not job.final_video_url:
        raise HTTPException(status_code=404, detail="Video not available")
    
    url = f"{request.base_url.scheme}://{request.base_url.netloc}{job.final_video_url}"
    return {"url": url}
