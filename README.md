# Cinematic Intelligence - AI Video Commentator

Cinematic Intelligence is a comprehensive full-stack application that leverages the power of generative AI to automatically analyze videos, generate contextual narrations in various styles (e.g., Documentary, Funny, Dramatic), and produce a final narrated video.

It uses a React frontend for an elegant, cinematic user experience, and a FastAPI backend empowered by the Gemini 2.5 Flash multimodal model for video understanding.

## 🚀 Features

- **Automated Video Analysis**: Frame-by-frame context extraction, scene understanding, and OCR via Gemini AI.
- **Dynamic Narration Styles**: Choose an AI persona to narrate your video (Documentary, Funny, Dramatic, Educational, or Sports Commentary).
- **Live In-Browser Playback**: View the synthesized commentary synced to the video playback using the Web Speech API (`SpeechSynthesis`).
- **Video Export**: A fully automated pipeline using Google Text-to-Speech (gTTS) and FFmpeg to mix TTS narrations seamlessly over the original video track at the appropriate timestamps.
- **Premium UI/UX**: Dark-themed, modern, glassmorphic UI built with React.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Vanilla CSS with CSS Variables for a responsive, dark-mode design
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Live Text-to-Speech**: Web Speech API (`SpeechSynthesis`)

### Backend
- **Framework**: FastAPI (Python)
- **Generative AI**: `google-genai` (Gemini 2.5 Flash model)
- **Video & Audio Processing**: `gTTS` (Text-to-Speech) and `imageio-ffmpeg` (FFmpeg binary management)
- **CORS & Static Files**: Built-in FastAPI utilities

---

## 🏗 Submodules & Architecture

### 1. The Backend (`/backend`)
The backend is a FastAPI server located in the `backend/` directory.

#### Key Endpoints:
- `POST /analyze-video`: 
  - Receives the video blob (`Multipart/form-data`) and the requested style.
  - Temporarily uploads the video to the Gemini File API.
  - Uses `gemini-2.5-flash` with a strict multimodal prompt to return a JSON array containing timestamps, context summaries, and the targeted script.
- `POST /download-video`: 
  - Receives the source video blob and the raw JSON commentary data.
  - Synthesizes audio files using Python `gTTS`.
  - Runs a complex `ffmpeg` graph (`amix`, `adelay`, `volume`) to overlay the generated voices precisely onto the original video timestamps.
  - Returns a URL to the finished, commentated video stored in `/static`.

### 2. The Frontend (`/frontend`)
The frontend is a Vite + React application located in the `frontend/` directory.

#### Core Flow:
- App initialized at `App.jsx`.
- State managed for the currently uploaded video, parsed timeline, and AI narrative result (`result`).
- A dual pane dashboard:
  - **Left**: Video player synced with a high-level summary and music mood suggestions.
  - **Right**: A scrolling list of generated script dialogue lines highlight interactively with the video clock (`currentTime`).

---

## 📦 Getting Started

### Prerequisites
- Python 3.9+
- Node.js & npm
- A valid Google Gemini API Key

### 1. Setup Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate # On Windows use: venv\Scripts\activate.ps1

# Install dependencies
pip install -r requirements.txt

# Environment Setup
# Create a .env file in the backend directory and add your GEMINI_API_KEY
# Example: GEMINI_API_KEY=AIzaSyxxxxxxxxx

# Run the backend
uvicorn main:app --reload
# It will run at http://localhost:8000
```

### 2. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
# It will run at http://localhost:5173
```

---

## 🔧 Future Enhancements
- Expand audio support to multiple languages.
- Integration with external high-fidelity Voice Generation models (e.g. ElevenLabs).
- Video stabilization and cropping pre-processing features.

## 🤝 Contributing
Open an issue or submit a pull request if you want to contribute to the Cinematic Intelligence AI tool.
