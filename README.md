# 🌿 CropX AI — Crop Disease Diagnosis & Management System

CropX AI is a production-ready, full-stack artificial intelligence application engineered for crop disease diagnosis, severity assessment, and treatment planning in Indian agriculture. 

It combines an **Ensemble MobileNetV3 Deep Learning Pipeline** with a **FastAPI backend** and a **Next.js 15 / React 19 / Tailwind CSS frontend**.

---

## 🌟 Key Features

- **AI Crop Leaf Scanner**: Drag & drop or upload leaf images for instant 57-class plant disease detection.
- **Dual-Model Ensemble Pipeline**: Uses an ensemble of two fine-tuned MobileNetV3 architectures with averaged softmax probabilities for enhanced diagnostic confidence.
- **Indian Agricultural Localization**: Auto-tags current Indian cropping season (*Kharif*, *Rabi*, *Zaid*) based on real-time calendar dates.
- **Real-Time Weather Integration**: Live weather conditions and 3-day forecast powered by Open-Meteo API.
- **Farmer Community Forum**: Discussion platform with post creation, commenting, and liking capabilities.
- **Scan History Tracking**: Persisted diagnostic history with severity badges, treatments, and localized field metadata.
- **Complete Authentication**: JWT token-based authentication with signup, login, session persistence, and guest preview mode.
- **Dark Mode Support**: Persisted light/dark theme toggle without layout shift or flicker.

---

## 🏗️ System Architecture

```
CropX-Ai/
├── backend/                       # Python FastAPI Backend
│   ├── models/                    # Keras Deep Learning Model Files (.keras)
│   │   ├── CropX_MobileNetV3_Final.keras
│   │   └── CropX_MobileNetV3_Final1.keras
│   ├── routers/                   # API Route Handlers
│   │   ├── auth.py                # User Signup & JWT Login
│   │   ├── prediction.py          # AI Image Inference & Database Persistence
│   │   ├── history.py             # User Scan History & Deletion
│   │   ├── dashboard.py           # Real-Time Dashboard Statistics
│   │   ├── profile.py             # User Profile Management
│   │   ├── weather.py             # Open-Meteo Weather Service Integration
│   │   └── community.py           # Farmer Discussion Forum
│   ├── services/                  # Business Logic & ML Pipeline
│   │   ├── model_service.py       # Ensemble Model Loader & Inference Engine
│   │   └── weather_service.py     # Weather & Season Computation
│   ├── app.py                     # Main FastAPI Application Entrypoint
│   ├── class_names.py             # 57-Class Label Definitions & Metadata
│   ├── config.py                  # Environment & Pydantic Configuration
│   ├── database.py                # SQLAlchemy SQLite Engine & Session
│   ├── models.py                  # SQLAlchemy Database Models (User, Scan, Post, Comment)
│   ├── preprocess.py              # MobileNetV3 Normalization & Image Processing
│   ├── requirements.txt           # Backend Python Dependencies
│   └── test_backend.py            # Comprehensive Backend Endpoint Test Suite
├── src/                           # Next.js 15 Frontend
│   ├── app/                       # App Router Pages
│   │   ├── ai-scan/               # AI Disease Scanning Interface
│   │   ├── community/             # Farmer Community Discussion Forum
│   │   ├── disease-reports/       # Disease Outbreak Summary Reports
│   │   ├── home-dashboard/        # Main Dashboard with Weather & Metrics
│   │   ├── profile/               # Farmer Profile Settings
│   │   ├── scan-history/          # Past Diagnostic Records & Modal View
│   │   ├── settings/              # Application Preferences & Theme Toggle
│   │   └── sign-up-login-screen/  # Authentication Screen (SignIn/SignUp)
│   ├── components/                # Reusable React UI Components
│   ├── context/                   # React Context Providers (AuthContext, ScanContext)
│   ├── services/                  # Frontend API Client Layer (api.ts)
│   ├── styles/                    # Tailwind CSS & Global Design Tokens
│   └── types/                     # TypeScript Type Definitions
├── package.json                   # Frontend Node.js Dependencies & Scripts
├── tsconfig.json                  # TypeScript Compiler Configuration
└── next.config.mjs                # Next.js Configuration
```

---

## 💻 Prerequisites

Ensure you have the following installed on your system:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Python**: v3.10.0 or higher (v3.11/v3.12 compatible)
- **pip**: Latest version

---

## ⚡ Quick Start Guide

### 1. Clone & Set Up Project

```bash
git clone <repository-url>
cd CropX-Ai
```

---

### 2. Set Up & Start Backend (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install required Python packages
pip install -r requirements.txt

# Run backend test suite to verify installation
python test_backend.py

# Start FastAPI server
python app.py
# Server will run on: http://localhost:8000
# Interactive API docs available at: http://localhost:8000/docs
```

---

### 3. Set Up & Start Frontend (Next.js)

Open a new terminal window in the project root (`CropX-Ai/`):

```bash
# Install Node.js dependencies
npm install

# Start Next.js development server
npm run dev

# Open http://localhost:4028 in your web browser
```

---

## ⚙️ Environment Variables

### Frontend (`.env`)

| Variable | Default Value | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend URL |

### Backend (`backend/.env`)

| Variable | Default Value | Description |
|---|---|---|
| `PROJECT_NAME` | `CropX AI Backend` | Application title |
| `SECRET_KEY` | `cropx_secret_key...` | JWT token signature key |
| `DATABASE_URL` | `sqlite:///./cropx.db` | SQLAlchemy database URI |
| `UPLOADS_DIR` | `uploads` | Image upload storage directory |
| `GOOGLE_CLIENT_ID` | `""` | Optional Google OAuth Client ID |
| `FACEBOOK_APP_ID` | `""` | Optional Facebook OAuth App ID |

---

## 🧪 Verification & Building

### Run Backend Endpoint Test Suite

```bash
cd backend
python test_backend.py
```

### Run Frontend Production Build & Type Check

```bash
npm run type-check
npm run build
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).