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
    
    if max_duration:
        cmd.extend(["-t", str(max_duration)])
        
    cmd.append(os.path.join(output_dir, "frame_%04d.jpg"))
    subprocess.run(cmd, capture_output=True)
    
    frames = sorted(glob.glob(os.path.join(output_dir, "*.jpg")))
    if not frames:
        return []

    # Smart Selection based on Visual Change
    if len(frames) <= max_frames:
        return frames

    # Calculate differences between consecutive frames
    diffs = []
    prev_img = None
    
    for f in frames:
        img = cv2.imread(f)
        if img is None:
            diffs.append(0)
            continue
        
        img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        img_gray = cv2.resize(img_gray, (100, 100)) # Small size for speed
        
        if prev_img is None:
            diffs.append(0)
        else:
            diff = cv2.absdiff(img_gray, prev_img)
            diffs.append(diff.mean())
        
        prev_img = img_gray

    # Select frames:
    # 1. Always include first and last
    # 2. Pick top (max_frames - 2) frames with highest visual difference
    # 3. Sort them chronologically
    
    # Exclude first and last from the 'competitors' for highlight spots
    competitor_indices = list(range(1, len(frames) - 1))
    
    # Sort competitor indices by their corresponding difference value
    # diffs[i] is the difference between frames[i-1] and frames[i]
    sorted_indices = sorted(competitor_indices, key=lambda i: diffs[i], reverse=True)
    
    # Take top N indices
    num_to_take = min(len(sorted_indices), max_frames - 2)
    top_indices = sorted_indices[:num_to_take]
    
    # Combine with mandatory first and last (0 and len(frames)-1)
    final_indices = sorted(list(set([0] + top_indices + [len(frames)-1])))
    
    selected_frames = [frames[i] for i in final_indices]
    
    return selected_frames
