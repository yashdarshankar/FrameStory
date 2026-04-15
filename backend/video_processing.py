import subprocess
import os
import glob
import imageio_ffmpeg
import cv2

from typing import Optional

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def extract_smart_frames(video_path: str, output_dir: str, max_duration: Optional[int] = None, max_frames: int = 30):
    os.makedirs(output_dir, exist_ok=True)
    
    # Using FFmpeg to extract 1 frame per second
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", video_path,
        "-filter:v", "fps=1",
    ]
    
    # If duration limit is provided, stop extraction early
    if max_duration:
        cmd.extend(["-t", str(max_duration)])
        
    cmd.append(os.path.join(output_dir, "frame_%04d.jpg"))
    
    subprocess.run(cmd, capture_output=True)
    
    # Get extracted frames
    frames = sorted(glob.glob(os.path.join(output_dir, "*.jpg")))
    
    # Heuristics: stay within max_frames limit
    if len(frames) > max_frames:
        step = len(frames) / max_frames
        selected_frames = []
        for i in range(max_frames):
            idx = int(i * step)
            if idx < len(frames):
                selected_frames.append(frames[idx])
    else:
        selected_frames = frames

    return selected_frames
