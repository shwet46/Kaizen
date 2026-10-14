# 🚀 Render Deployment Guide for Kaizen

This guide covers deploying the **Kaizen Express Backend** and the **Python Voice & Intelligence Bot Backend** to [Render](https://render.com).

---

## 🏗️ Architecture Overview

| Service | Directory | Tech Stack | Port (Render) | Health Check |
|---|---|---|---|---|
| **Kaizen Backend** | `backend/` | Node.js / Express / Mongoose | `$PORT` (10000) | `GET /health` |
| **Kaizen Bot** | `backend/bot/` | Python 3 / Flask / Gunicorn | `$PORT` (10000) | `GET /health` |
| **Kaizen Frontend** | `frontend/` | React / Vite / TypeScript | Static Site | N/A |

---

## 🌟 Method 1: Automated Blueprint Deployment (Recommended)

Kaizen includes a ready-to-use [`render.yaml`](file:///d:/github/Kaizen/render.yaml) Blueprint file.

1. Push your repository to **GitHub** or **GitLab**.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Select your **Kaizen** repository.
5. Render will detect `render.yaml` and configure:
   - **`kaizen-backend`** (Node.js Web Service)
   - **`kaizen-bot`** (Python Web Service)
   - **`kaizen-frontend`** (Static Site with automated service URL linking)
6. Supply the required environment variables prompted in the setup screen (e.g. `MONGODB_URI`, `GEMINI_API_KEY`).
7. Click **Apply**.

---

## 🛠️ Method 2: Manual Deployment Step-by-Step

### 1. Deploy the Express Backend (`kaizen-backend`)

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name**: `kaizen-backend`
   - **Language**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Expand **Advanced**:
   - **Health Check Path**: `/health`
5. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://<your-frontend>.onrender.com
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.ozeo411.mongodb.net/mern-app?retryWrites=true&w=majority
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_jwt_secret_key
   ```
   *(Optional Integrations: `JIRA_*`, `GITHUB_*`, `NEO4J_*`)*
6. Click **Create Web Service**.

---

### 2. Deploy the Python Voice Bot Backend (`kaizen-bot`)

1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect the same repository.
3. Configure settings:
   - **Name**: `kaizen-bot`
   - **Language**: `Python`
   - **Root Directory**: `backend/bot`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**:
     ```bash
     gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120
     ```
   - **Plan**: `Free`
4. Expand **Advanced**:
   - **Health Check Path**: `/health`
5. Under **Environment Variables**, add:
   ```env
   FLASK_ENV=production
   PORT=10000
   BOT_PORT=10000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.ozeo411.mongodb.net/mern-app?retryWrites=true&w=majority
   GEMINI_API_KEY=your_gemini_api_key
   ```
6. Click **Create Web Service**.

---

## 🔑 Google Cloud Credentials on Render

For Speech-to-Text (STT) and Text-to-Speech (TTS) on both backends, you have two options:

### Option A: Direct JSON Environment Variable (Easiest)
Copy the full JSON text of your `gcloud-service-account.json` file and paste it into an environment variable named:
- **Key**: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- **Value**: `{"type":"service_account","project_id":...}`

*Both backends are already programmed to auto-detect and parse this environment variable!*

### Option B: Render Secret Files
1. In your Render Web Service dashboard, go to **Environment** → **Secret Files**.
2. Add a new secret file:
   - **Filename**: `gcloud-service-account.json`
   - **Contents**: Paste the contents of `gcloud-service-account.json`.
3. Set the environment variable:
   - `GOOGLE_APPLICATION_CREDENTIALS=/etc/secrets/gcloud-service-account.json`

---

## 🌐 MongoDB Atlas Network Access

Because Render Free/Starter tier uses dynamic outgoing IP addresses:
1. Open your [MongoDB Atlas Dashboard](https://cloud.mongodb.com).
2. Go to **Network Access** → **IP Access List**.
3. Add IP Address: `0.0.0.0/0` (Allow Access from Anywhere).
4. Ensure your user has read/write privileges on the database (`mern-app`).

---

## 🔗 Connecting Frontend to Backends

When deploying the frontend (or running locally against Render):
- Set `VITE_API_URL` to `https://kaizen-backend.onrender.com/api`
- Set `VITE_VOICE_CHATBOT_API` to `https://kaizen-bot.onrender.com`

---

## ✅ Health Checks & Verification

After deployment, test the services in your browser or with curl:

- **Express Backend Health**:
  ```bash
  curl https://kaizen-backend.onrender.com/health
  # Response: {"status":"ok","service":"kaizen-backend","uptime":...}
  ```

- **Express API Health**:
  ```bash
  curl https://kaizen-backend.onrender.com/api/health
  # Response: {"status":"ok","db":"connected"}
  ```

- **Python Voice Bot Health**:
  ```bash
  curl https://kaizen-bot.onrender.com/health
  # Response: {"status":"healthy","service":"kaizen-bot"}
  ```

- **Python Voice Bot API Health**:
  ```bash
  curl https://kaizen-bot.onrender.com/api/health
  # Response: {"status":"healthy","services":{"sarvam":"connected","mongodb":"connected","insights":"ready"}}
  ```
