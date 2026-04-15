from google import genai
from google.genai import types
import json
import os

import personality_engine

def generate_script(frames: list, persona_name: str, original_filename: str):
    client = genai.Client()
    
    personality = personality_engine.get_personality(persona_name)
    
    prompt = f"""
You are an advanced multimodal AI. Analyze these chronologically sampled frames from a video.
IMPORTANT: You MUST write the commentary and transcript in the language '{personality.lang}' because that is the persona's native tongue.
{personality.instruction}

Identify high-value segments (action, scene change, or focal points).
Do not narrate every single second, only narrate the most important moments.
Suggest an appropriate 'music_mood' that matches this persona: {personality.music_mood}.

Return a JSON object STRICTLY matching this shape:
{{
  "title": "A catchy title",
  "summary": "Short summary",
  "music_mood": "Mood description",
  "commentary": [
    {{
      "start_time": "00:00",
      "end_time": "00:05",
      "description": "Context of scene",
      "narration": "What the narrator actually says"
    }}
  ]
}}
"""
    
    # We ideally upload files to gemini
    uploaded_files = []
    for f in frames:
        up = client.files.upload(file=f)
        uploaded_files.append(up)
        
    contents = uploaded_files + [prompt]
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        )
    )
    
    # Cleanup files
    for up in uploaded_files:
        client.files.delete(name=up.name)
        
    return json.loads(response.text)
