# 🌐 24/7 Live Deployment Guide for Code Quest

This guide shows you how to take Code Quest live on the public internet so it runs **24/7 for free**.

---

## 🚀 Recommended Setup: Vercel (Frontend) + Render (Backend)

| Component | Platform | Free Tier Benefits |
| :--- | :--- | :--- |
| **Frontend (React/Vite)** | [Vercel](https://vercel.com) | 100% Free, Global Edge CDN, Zero downtime, SSL HTTPS |
| **Backend (FastAPI)** | [Render](https://render.com) | Free Web Service, auto-deploy from GitHub |
| **Database** | [Neon](https://neon.tech) or [Supabase](https://supabase.com) | Free serverless PostgreSQL, permanent data retention |
| **24/7 Keep-Alive** | GitHub Actions or [UptimeRobot](https://uptimerobot.com) | Keeps Render awake 24/7 with zero cold starts |

---

## Step 1: Deploy Backend to Render (5 Minutes)

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** > **Web Service**.
3. Select your repository: `sanyamk28/CODE-QUEST`.
4. Configure the service settings:
   - **Name**: `codequest-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Add Environment Variables under **Advanced**:
   - `ENV_MODE`: `production`
   - `PYTHON_VERSION`: `3.11.9`
   - `USE_SQLITE`: `true` *(or set `DATABASE_URL` with a free Neon/Supabase PostgreSQL connection string for permanent multi-instance storage)*
   - `SECRET_KEY`: *(Click generate or enter a long random string)*
6. Click **Deploy Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://codequest-api.onrender.com`).
   - You can test it in your browser: `https://codequest-api.onrender.com/api/v1/health` (should return `{"status": "healthy"}`).

---

## Step 2: Deploy Frontend to Vercel (3 Minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and sign in with GitHub.
2. Click **Add New...** > **Project**.
3. Select `sanyamk28/CODE-QUEST`.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and set to `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://codequest-api.onrender.com/api/v1` *(replace with your real Render backend URL from Step 1)*
6. Click **Deploy**.
7. Vercel will build and give you a live production URL: `https://code-quest-xxx.vercel.app`.

---

## Step 3: Prevent Render Cold Starts (Keep Backend Awake 24/7)

Render's free tier spins down if no request is received for 15 minutes. To keep it **alive 24/7 with zero sleep**:

### Option A: Using the built-in GitHub Actions workflow (Included)
1. Go to your GitHub repository: `https://github.com/sanyamk28/CODE-QUEST/settings/secrets/actions`
2. Click **New repository secret**.
3. Name: `BACKEND_URL`
4. Value: `https://codequest-api.onrender.com` *(your backend URL without trailing slash)*
5. The scheduled GitHub Action (`.github/workflows/keep-alive.yml`) will automatically ping your server every 12 minutes so it never goes to sleep.

### Option B: Using UptimeRobot (Free Forever)
1. Sign up for free at [UptimeRobot](https://uptimerobot.com).
2. Click **Add New Monitor**.
3. Monitor Type: `HTTP(s)`
4. Friendly Name: `Code Quest API`
5. URL: `https://codequest-api.onrender.com/api/v1/health`
6. Monitoring Interval: `10 minutes`
7. Click **Create Monitor**. Your backend will now stay awake 24/7!

---

## Step 4 (Optional): All-in-One Deployment via Render Blueprint

If you prefer to host both Frontend and Backend on Render using a single click:
1. In Render, click **New +** > **Blueprint**.
2. Connect `sanyamk28/CODE-QUEST`.
3. Render will automatically read `render.yaml` and provision both:
   - `codequest-api` (FastAPI backend)
   - `codequest-web` (React/Vite static frontend)

---

## Local Verification Commands

To verify builds before pushing:
```bash
# Frontend build check
cd frontend && npm run build

# Backend verification
cd backend && python -c "import fastapi, uvicorn; print('Backend OK')"
```
