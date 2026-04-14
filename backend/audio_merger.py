import subprocess
import os
from gtts import gTTS
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def parse_time_to_ms(ts_str):
    # expect formats like "00:05" or "0:05" or "1:30"
    if not ts_str:
        return 0
    parts = ts_str.split(':')
    if len(parts) == 2:
        return int(int(parts[0]) * 60000 + float(parts[1]) * 1000)
    elif len(parts) == 3:
        return int(int(parts[0]) * 3600000 + int(parts[1]) * 60000 + float(parts[2]) * 1000)
    return int(float(ts_str) * 1000)

def generate_audio_and_merge(input_vid: str, out_file: str, commentary_data: list, temp_dir: str):
    probe = subprocess.run([ffmpeg_exe, "-i", input_vid], capture_output=True, text=True)
    has_audio = "Audio:" in probe.stderr
    
    tts_files = []
    for i, item in enumerate(commentary_data):
        delay_ms = parse_time_to_ms(item.get("start_time", f"0:0{i}"))
        tts_path = os.path.join(temp_dir, f"tts_{i}.mp3")
        tts = gTTS(item.get("narration", ""), lang="en")
        tts.save(tts_path)
        tts_files.append((tts_path, delay_ms))

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
    return out_file
