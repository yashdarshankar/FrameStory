import os
import tempfile
import json
import uuid
import shutil
from celery import Celery
from sqlalchemy.orm import Session

from auth import SessionLocal
from models import VideoJob
from video_processing import extract_smart_frames
from ai_engine import generate_script
from audio_merger import generate_audio_and_merge

# Use sqla+sqlite since Docker/Redis was not available in this environment.
celery_app = Celery(
    'framestory_tasks',
    broker='sqla+sqlite:///celery_broker.sqlite',
    backend='db+sqlite:///celery_results.sqlite'
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
        
        frames_dir = os.path.join(temp_dir, "frames")
        selected_frames = extract_smart_frames(video_path, frames_dir)
        
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
        generate_audio_and_merge(video_path, out_file, script_data.get("commentary", []), temp_dir)
        
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
        # Clean up temp
        shutil.rmtree(temp_dir, ignore_errors=True)
        # Clean up original upload
        if os.path.exists(video_path):
            os.remove(video_path)
