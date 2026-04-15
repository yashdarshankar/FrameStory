import os
import tempfile
import json
import uuid
import shutil
from dotenv import load_dotenv
from celery import Celery

load_dotenv()
from sqlalchemy.orm import Session

from auth import SessionLocal
from models import VideoJob
from video_processing import extract_smart_frames
from ai_engine import generate_script
from audio_merger import generate_audio_and_merge

# Use PostgreSQL via DATABASE_URL
DB_URL = os.getenv("DATABASE_URL")
if not DB_URL or not DB_URL.startswith("postgresql"):
    raise RuntimeError("DATABASE_URL must be a PostgreSQL connection string")

# Celery SQLAlchemy transport uses 'sqla+postgresql://'
BROKER_URL = DB_URL.replace("postgresql://", "sqla+postgresql://")
RESULT_BACKEND = f"db+{DB_URL}"

celery_app = Celery(
    'framestory_tasks',
    broker=BROKER_URL,
    backend=RESULT_BACKEND
)

@celery_app.task(bind=True)
def process_video_task(self, job_id: str, video_path: str, persona: str, original_filename: str):
    db: Session = SessionLocal()
    job_record = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    
    if not job_record:
        return {"status": "error", "detail": "Job not found in DB"}

    temp_dir = tempfile.mkdtemp()
    
    try:
        self.update_state(state='PROCESSING_FRAMES')
        job_record.status = 'PROCESSING_FRAMES'
        db.commit()
        
        is_guest = job_record.user_id is None
        max_duration = 45 if is_guest else None
        max_frames = 10 if is_guest else 30
        
        frames_dir = os.path.join(temp_dir, "frames")
        selected_frames = extract_smart_frames(video_path, frames_dir, max_duration=max_duration, max_frames=max_frames)
        
        if not selected_frames:
            raise Exception("No significant frames could be extracted.")

        self.update_state(state='GENERATING_NARRATION')
        job_record.status = 'GENERATING_NARRATION'
        db.commit()
        
        script_data = generate_script(selected_frames, persona, original_filename)
        
        # Save JSON
        result_json_dir = os.path.join("static", "results")
        os.makedirs(result_json_dir, exist_ok=True)
        json_path = os.path.join(result_json_dir, f"{job_id}.json")
        with open(json_path, 'w') as f:
            json.dump(script_data, f)
            
        job_record.result_json_path = json_path
        
        self.update_state(state='MERGING_AUDIO_AND_VIDEO')
        job_record.status = 'MERGING_AUDIO_AND_VIDEO'
        db.commit()
        
        out_file = os.path.join(temp_dir, "output.mp4")
        generate_audio_and_merge(video_path, out_file, script_data.get("commentary", []), temp_dir, persona_name=job_record.style)
        
        # Copy to static
        final_video_name = f"commentated_{job_id}.mp4"
        final_video_path = os.path.join("static", final_video_name)
        shutil.copy(out_file, final_video_path)
        
        job_record.final_video_url = f"/static/{final_video_name}"
        job_record.status = 'COMPLETED'
        db.commit()
        
        return {"status": "success", "json_path": json_path, "video_url": job_record.final_video_url}
        
    except Exception as e:
        job_record.status = 'FAILED'
        db.commit()
        return {"status": "failed", "detail": str(e)}
        
    finally:
        db.close()
        # Clean up temp frames but PRESERVE original video for Timeless Editor
        shutil.rmtree(temp_dir, ignore_errors=True)
        # if os.path.exists(video_path):
        #     os.remove(video_path)

@celery_app.task(bind=True)
def regenerate_audio_task(self, job_id: str, new_commentary: list):
    db: Session = SessionLocal()
    job_record = db.query(VideoJob).filter(VideoJob.id == job_id).first()
    
    if not job_record or not job_record.original_video_path:
        return {"status": "error", "detail": "Job or video not found"}
        
    temp_dir = tempfile.mkdtemp()
    try:
        self.update_state(state='REGENERATING_AUDIO')
        job_record.status = 'REGENERATING_AUDIO'
        db.commit()
        
        out_file = os.path.join(temp_dir, "output_regen.mp4")
        # Regenerate with new script and persona speed
        generate_audio_and_merge(
            job_record.original_video_path, 
            out_file, 
            new_commentary, 
            temp_dir, 
            persona_name=job_record.persona
        )
        
        # Overwrite final result
        final_video_name = f"commentated_{job_id}.mp4"
        final_video_path = os.path.join("static", final_video_name)
        shutil.copy(out_file, final_video_path)
        
        # Update JSON record too
        with open(job_record.result_json_path, 'r') as f:
            data = json.load(f)
        data["commentary"] = new_commentary
        with open(job_record.result_json_path, 'w') as f:
            json.dump(data, f)
            
        job_record.status = 'COMPLETED'
        db.commit()
    except Exception as e:
        job_record.status = 'FAILED'
        db.commit()
    finally:
        db.close()
        shutil.rmtree(temp_dir, ignore_errors=True)
