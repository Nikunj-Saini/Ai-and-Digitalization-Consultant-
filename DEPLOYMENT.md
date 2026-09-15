# AI & Digitalization Consultant - 100% Free Deployment Guide

This guide details how to deploy the **AI & Digitalization Consultant** application **100% FOR FREE** using Netlify and Render:

```
              ┌──────────────┐ 
              │   GitHub     │ 
              │ Source Code  │ 
              └──────┬───────┘ 
                     │ 
          ┌──────────┴──────────┐ 
          ▼                     ▼ 
      Netlify                 Render 
      React (Free)          FastAPI (Free)
        │                      │ 
        └──── API ─────────────┘ 
                               │ 
                               ▼ 
                         Sqlite (Free)
```

---

## 🏗️ Architecture Overview (100% Free Tier)

| Component | Technology | Hosting Platform | Cost | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React (Vite) | **Netlify** | **$0 / Free** | Static SPA deployment from `frontend/` |
| **Backend** | FastAPI (Python) | **Render** | **$0 / Free** | Web Service on Render Free Plan (`plan: free`) |
| **Database** | SQLite | **Render Local Disk** | **$0 / Free** | Embedded SQLite database file `./digitalization_advisor.db` |
| **LLM Provider** | Google Gemini API | Cloud API | **$0 / Free** | Free tier API key from Google AI Studio |

---

## 🚀 Step 1: Push Code to GitHub

```bash
git add .
git commit -m "Update render.yaml to 100% free tier"
git push origin main
```

---

## 🐍 Step 2: Deploy Backend on Render (100% Free)

1. Go to [Render Dashboard](https://dashboard.render.com/) -> Click **New +** -> **Blueprint**.
2. Connect your GitHub repository `Nikunj-Saini/Ai-and-Digitalization-Consultant-`.
3. Render will auto-detect [`render.yaml`](file:///c:/Users/DELL/Desktop/Ai%20and%20Digital%20%20Consultance/render.yaml) which is configured for the **Free Plan** (`plan: free`).
4. Enter your `GEMINI_API_KEY` under Environment Variables.
5. Click **Apply**. Render will deploy your FastAPI backend **100% free with 0 credit card requirement**!

---

## ⚛️ Step 3: Deploy Frontend on Netlify (100% Free)

1. Go to [Netlify Dashboard](https://app.netlify.com/) -> Click **Add new site** -> **Import an existing project**.
2. Select **GitHub** and choose `Nikunj-Saini/Ai-and-Digitalization-Consultant-`.
3. Build Settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://<your-render-app-name>.onrender.com/api`
5. Click **Deploy site**.

---

## 🛠️ Local Development

```bash
.\run.bat
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`
