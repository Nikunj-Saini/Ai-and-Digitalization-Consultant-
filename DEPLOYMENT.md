# AI & Digitalization Consultant - Deployment Guide

This guide details how to deploy the **AI & Digitalization Consultant** application using the architecture specified below:

```
              ┌──────────────┐ 
              │   GitHub     │ 
              │ Source Code  │ 
              └──────┬───────┘ 
                     │ 
          ┌──────────┴──────────┐ 
          ▼                     ▼ 
      Netlify                 Render 
      React                  FastAPI 
        │                      │ 
        └──── API ─────────────┘ 
                               │ 
                               ▼ 
                         Sqlite
```

---

## 🏗️ Architecture Overview

| Component | Technology | Hosting Platform | Config / Details |
| :--- | :--- | :--- | :--- |
| **Frontend** | React (Vite) | **Netlify** | Static SPA deployment from `frontend/` directory |
| **Backend** | FastAPI (Python 3.11+) | **Render** | Web Service deployment from `backend/` directory |
| **Database** | SQLite | **Render Persistent Disk** | Stored at `/var/data/digitalization_advisor.db` |
| **LLM Provider** | Google Gemini API | Cloud API | Configured via `GEMINI_API_KEY` |

---

## 🚀 Step 1: Push Project to GitHub

1. Commit and push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Configure production deployment for Netlify and Render"
   git push origin main
   ```

---

## 🐍 Step 2: Deploy Backend (FastAPI + SQLite) on Render

### Option A: Automatic Blueprint Deployment (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
2. Connect your GitHub repository `Nikunj-Saini/Ai-and-Digitalization-Consultant-`.
3. Render will auto-detect [`render.yaml`](file:///c:/Users/DELL/Desktop/Ai%20and%20Digital%20%20Consultance/render.yaml).
4. Fill in your `GEMINI_API_KEY` under Environment Variables.
5. Click **Apply**. Render will automatically build the backend service and mount a 1GB Persistent Disk at `/var/data` for SQLite!

### Option B: Manual Web Service Setup
If you prefer setting up manually on Render:
1. Click **New +** -> **Web Service**.
2. Connect your repository.
3. Configure the following properties:
   - **Name**: `digitalization-advisor-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   - `DATABASE_URL`: `sqlite:////var/data/digitalization_advisor.db`
   - `EXPORTS_DIR`: `/var/data/exports`
   - `ALLOWED_ORIGINS`: `*` (or your Netlify URL e.g. `https://your-app.netlify.app`)
   - `GEMINI_API_KEY`: `your_actual_gemini_api_key`
   - `GEMINI_MODEL`: `gemini-2.0-flash`
5. Add **Persistent Disk**:
   - **Name**: `sqlite-data`
   - **Mount Path**: `/var/data`
   - **Size**: `1 GB`
6. Click **Create Web Service**. Note down your backend URL (e.g., `https://digitalization-advisor-backend.onrender.com`).

---

## ⚛️ Step 3: Deploy Frontend (React) on Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** -> **Import an existing project**.
2. Select **GitHub** and authorize your repository.
3. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Expand **Environment variables** and add:
   - `VITE_API_BASE_URL` = `https://<your-render-backend-name>.onrender.com/api`
5. Click **Deploy site**.

---

## 🔗 Step 4: Verify Full End-to-End Flow

1. Open your Netlify site URL (e.g. `https://your-app-name.netlify.app`).
2. Test submitting a business problem statement (e.g. *"Efforts wasted in managing PPT presentations"*).
3. Confirm that the frontend communicates seamlessly with Render FastAPI, fetches solution recommendations, generates solution documents, and persists data in SQLite.

---

## 🛠️ Local Development Quickstart

To run the application locally:
```bash
# Double click run.bat OR run from terminal:
.\run.bat
```
- Frontend Web UI: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`
