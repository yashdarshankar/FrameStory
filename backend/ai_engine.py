from google import genai
from google.genai import types
import json
import os

def generate_script(frames: list, persona: str, original_filename: str):
    client = genai.Client()
    
    persona_prompts = {
        "Documentary": "You are a professional documentary narrator like David Attenborough. Speak with gravitas and wonder.",
        "Sports": "You are an energetic WWE or soccer announcer. Be hype, focus on the action and use visceral verbs!",
        "Funny": "You are a Gen-Z internet comedian channel. Be dramatic, act surprised, maybe a bit sarcastic.",
        "Teacher": "You are an educational instructor. Break down what is happening thoughtfully and analytically."
    }
    
    persona_instruction = persona_prompts.get(persona, persona_prompts["Documentary"])
    
    prompt = f"""
You are an advanced multimodal AI. Analyze these chronologically sampled frames from a video.
{persona_instruction}

Identify high-value segments (action, scene change, or focal points).
Do not narrate every single second, only narrate the most important moments.

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
