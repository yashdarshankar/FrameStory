from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google import genai
from google.genai import types
from dotenv import load_dotenv
import tempfile
import subprocess
from gtts import gTTS
import imageio_ffmpeg
import shutil
import uuid
from dotenv import load_dotenv
import os
import time
import json

load_dotenv()

app = FastAPI()

os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize client dynamically per request to allow hot-reloading of .env
# client is not initialized globally anymore

@app.post("/analyze-video")
async def analyze_video(video: UploadFile = File(...), style: str = Form("Documentary")):
    load_dotenv()
    try:
        client = genai.Client()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Gemini API Key is not configured correctly in f:\\Recent\\AI\\videoCommentator\\backend\\.env file.")
        
    try:
        # Save temp file
        temp_file_path = f"temp_{video.filename}"
        with open(temp_file_path, "wb") as f:
            content = await video.read()
            f.write(content)
            
        print(f"Uploaded and saved temporarily: {temp_file_path}")
        
        # Uploading to Gemini
        gemini_file = client.files.upload(file=temp_file_path)
        
        # Wait for file to become active
        while gemini_file.state.name == "PROCESSING":
            print("File is processing, waiting...")
            time.sleep(2)
            gemini_file = client.files.get(name=gemini_file.name)
            
        if gemini_file.state.name == "FAILED":
            raise Exception("Video processing failed in Gemini API.")
            
        # Prepare Prompt
        prompt = f"""
You are an advanced multimodal AI system designed to analyze video content and generate high-quality natural language commentary.

OBJECTIVES:
1. Analyze the video frame-by-frame and detect: Objects, Actions, Scene context, Emotions, Text visible (OCR), Important transitions or events.
2. Understand temporal flow: Maintain sequence, identify key moments, avoid redundant description.
3. Generate a voice-over script: Natural, human-like narration, concise but descriptive. Add context where useful (e.g., "appears to be").
4. Tone & Style: The requested style is **{style}**. Please adapt the narration tone to match this style.

OUTPUT FORMAT:
Return a JSON object strictly matching this format:
{{
  "title": "A catchy title for the video",
  "summary": "A short summary of the video content",
  "music_mood": "Suggested background music mood (e.g. 'Upbeat electronic', 'Dramatic orchestral')",
  "commentary": [
    {{
      "timestamp": "00:00-00:05",
      "narration": "Narration text here..."
    }},
    {{
      "timestamp": "00:05-00:10",
      "narration": "Next narrative line..."
    }}
  ]
}}

CONSTRAINTS:
* Do NOT hallucinate unknown facts. If unsure, say 'appears to be' or 'likely'.
* Avoid over-description of static scenes.
* Keep narration engaging and smooth.
"""
        # Call Gemini models
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                gemini_file,
                prompt
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # Delete file after success
        client.files.delete(name=gemini_file.name)
        os.remove(temp_file_path)

        data = json.loads(response.text)
        return {"status": "success", "data": data}
        
    except Exception as e:
        # Clean up temp file on error
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    return {"message": "Video Commentator API is running."}

def parse_time_to_ms(ts_str):
    parts = ts_str.split('-')
    if not parts: return 0
    start = parts[0]
    p = start.split(':')
    if len(p) == 2:
        return int(int(p[0]) * 60000 + float(p[1]) * 1000)
    return int(float(start) * 1000)

@app.post("/download-video")
async def download_video(background_tasks: BackgroundTasks, video: UploadFile = File(...), commentary: str = Form(...)):
    com_data = json.loads(commentary)
    temp_dir = tempfile.mkdtemp()
    
    input_vid = os.path.join(temp_dir, f"input_{video.filename}")
    with open(input_vid, "wb") as f:
        f.write(await video.read())
        
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # Detect audio
    probe = subprocess.run([ffmpeg_exe, "-i", input_vid], capture_output=True, text=True)
    has_audio = "Audio:" in probe.stderr
    
    tts_files = []
    for i, c in enumerate(com_data):
        delay_ms = parse_time_to_ms(c.get("timestamp", "0:00-0:05"))
        tts_path = os.path.join(temp_dir, f"tts_{i}.mp3")
        tts = gTTS(c.get("narration", "No narration provided"), lang="en")
        tts.save(tts_path)
        tts_files.append((tts_path, delay_ms))
        
    out_file = os.path.join(temp_dir, "output.mp4")
    command = [ffmpeg_exe, "-y", "-i", input_vid]
    
    for path, _ in tts_files:
        command.extend(["-i", path])
        
    filter_complex = ""
    mix_inputs = ""
    num_inputs = len(tts_files)
    
    if has_audio:
        filter_complex += "[0:a]volume=0.2[a0];"
        mix_inputs += "[a0]"
        num_inputs += 1
        
    if len(tts_files) > 0:
        for i, (_, delay) in enumerate(tts_files):
            idx = i + 1
            filter_complex += f"[{idx}:a]adelay={delay}|{delay}[a{idx}];"
            mix_inputs += f"[a{idx}]"
            
        filter_complex += f"{mix_inputs}amix=inputs={num_inputs}:duration=first:dropout_transition=0[aout]"
        
        command.extend([
            "-filter_complex", filter_complex,
            "-map", "0:v",
            "-map", "[aout]",
            "-c:v", "copy",
            "-c:a", "aac",
            out_file
        ])
    else:
        command.extend(["-c:v", "copy", "-c:a", "copy", out_file])
    
    subprocess.run(command, check=True)
    
    unique_filename = f"commentated_{uuid.uuid4().hex[:8]}.mp4"
    static_file_path = os.path.join("static", unique_filename)
    shutil.copy(out_file, static_file_path)
    
    # We can clean up the temp directory safely now
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    return {"status": "success", "url": f"http://localhost:8000/static/{unique_filename}"}
