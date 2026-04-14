# FrameStory - AI Video Commentator System

FrameStory is a production-grade, asynchronous full-stack application that leverages the power of generative AI to automatically analyze videos, extract intelligent highlights, generate contextual narrations in various personas (e.g., Documentary, Funny, Sports), and produce a final synced video output with human-like Text-to-Speech (TTS).

The system features a **React** frontend leveraging the *Digital Curator* (Stitch v2) design system, and a highly concurrent **FastAPI** backend orchestrating background processing jobs via **Celery**.

---

## 🚀 Key Features

* **Async Processing Pipeline**: Heavy video extraction and AI generation jobs are offloaded to a Celery worker queue, allowing the API and UI to remain fully responsive.
* **Smart Frame Sampling**: Utilizes FFmpeg scene detection and OpenCV heuristics to extract ONLY high-value keyframes, optimizing API latency and inference costs.
* **Multimodal API Intelligence**: Employs Gemini 2.5 Flash to comprehend scenes chronologically and emit rigorous, time-bound JSON commentary logic.
* **Narration Personality Engine**: Adaptive system prompt layer altering the commentary style based on user selection (Documentary, Teacher, Sports, Funny).
* **Audio-Video Weaver**: Employs `gTTS` and FFmpeg filters (`adelay`, `amix`, `volume`) to precisely time dubs over the original source material.
* **JWT Authentication**: Full persistent SQL-based user system and a "My Videos" job dashboard.

---

## 🏗 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing & State**: `react-router-dom`, Zustand
- **Design System**: "Digital Curator" (Glassmorphism, Dark mode, Space Grotesk / Inter typography)
- **Icons & HTTP**: Lucide-React, Axios

### Backend & Infrastructure
- **Framework**: FastAPI (Python)
- **Queue Pipeline**: Celery (Currently configured rapidly utilizing SQLAlchemy/SQLite Broker for environments without Docker/Redis)
- **Database / Auth**: SQLite, SQLAlchemy, `passlib`, `python-jose` (JWT OAuth2)
- **Intelligence**: `google-genai` (Gemini SDK), OpenCV, FFmpeg
- **TTS**: `gTTS`

---

## 📦 Local Development Setup

### Prerequisites
- Python 3.9+
- Node.js & npm
- FFmpeg installed and accessible in the system path (`imageio-ffmpeg` dependency generally handles this in Python, but native FFmpeg is recommended).
- A valid Google Gemini API Key

### 1. Setup the Backend & Worker

Open a terminal and set up the Python environment:
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\Activate.ps1
# On Mac/Linux:
source venv/bin/activate

# Install all architecture dependencies
pip install -r requirements.txt

# Create your .env file
echo GEMINI_API_KEY=your_genai_api_key > .env
```

You must run TWO processes for the backend to function (the API router and the Celery worker).

**Window 1 (The FastAPI Server):**
```bash
# Serves the REST API and the Static File directory
uvicorn main:app --reload
```

**Window 2 (The Celery Worker):**
```bash
# Processes the asynchronous intelligence background tasks
celery -A celery_worker.celery_app worker --loglevel=info --pool=eventlet
```

### 2. Setup the Frontend

Open a **third** terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Run the development environment
npm run dev
```

The frontend will be accessible at `http://localhost:5173`. You can register a new account, login, and access the intelligent video upload dashboard.

---

## 🔌 API Endpoints
All protected endpoints expect a `Bearer {token}` header.

- **`POST /register`**: Create new User
- **`POST /token`**: Returns OAuth2 JWT Token
- **`POST /upload-video`** *(Auth)*: Submits `video` file and `style` form. Returns a Celery `job_id`.
- **`GET /status/{job_id}`** *(Auth)*: Returns current job pipeline status.
- **`GET /result/{job_id}`** *(Auth)*: Returns the synthesized JSON narration script timeline.
- **`GET /download/{job_id}`** *(Auth)*: Returns URL to the completely dubbed MP4 output.
- **`GET /my-videos`** *(Auth)*: Lists all persistent historical User jobs.

---

## 🔧 Future Road Map
* Swap out the SQLite Celery broker for a native Redis container via Docker Compose.
* Replace `gTTS` with ElevenLabs for hyper-realistic TTS cloning models.
* Enable Multi-Language detection models.
