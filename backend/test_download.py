import requests

url = "http://localhost:8000/download-video"
data = {"commentary": '[{"timestamp": "0:00-0:02", "narration": "Hello world"}]'}
files = {"video": ("dummy.mp4", b"\x00"*1024, "video/mp4")}

response = requests.post(url, data=data, files=files)
print("Status code:", response.status_code)
print("Headers:", response.headers)
if response.status_code != 200:
    print("Error text:", response.text)
