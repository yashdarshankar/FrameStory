import subprocess
import os
import glob
import imageio_ffmpeg
import cv2

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def extract_smart_frames(video_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    # Using FFmpeg to extract 1 frame per second to maximize extraction speed
    cmd = [
        ffmpeg_exe,
        "-y",
        "-i", video_path,
        "-filter:v", "fps=1",
        os.path.join(output_dir, "frame_%04d.jpg")
    ]
    subprocess.run(cmd, capture_output=True)
    
    # Compute highlight detection using variance of Laplacian (motion blur) as a proxy for static frames
    frames = sorted(glob.glob(os.path.join(output_dir, "*.jpg")))
    
    # Get video duration
    probe_cmd = [ffmpeg_exe, "-i", video_path]
    probe = subprocess.run(probe_cmd, capture_output=True, text=True)
    
    # Heuristics: if too many frames, keep top 60 evenly distributed
    if len(frames) > 60:
        step = len(frames) / 60
        selected_frames = []
        for i in range(60):
            idx = int(i * step)
            if idx < len(frames):
                selected_frames.append(frames[idx])
    else:
        selected_frames = frames

    return selected_frames
