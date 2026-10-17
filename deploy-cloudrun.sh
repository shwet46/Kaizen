#!/usr/bin/env bash
# ==============================================================================
# Kaizen - Automated Cloud Run Deployment Script
# Deploys Backend (Node.js), Bot (Python), and Frontend (React/Vite) to Google Cloud Run
# ==============================================================================

set -e

# Default settings (override via command line arguments or environment variables)
PROJECT_ID="${GCP_PROJECT_ID:-allknighters}"
REGION="${GCP_REGION:-us-central1}"

echo "=================================================="
echo "  Kaizen Google Cloud Run Deployment Pipeline"
echo "=================================================="

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "(unset)" ]; then
  echo "Error: No GCP Project ID configured."
  echo "Please run: gcloud config set project <YOUR_PROJECT_ID>"
  echo "Or run: GCP_PROJECT_ID=<YOUR_PROJECT_ID> ./deploy-cloudrun.sh"
  exit 1
fi

echo "Target GCP Project: $PROJECT_ID"
echo "Target Region:      $REGION"
echo ""

# Enable required Google Cloud APIs
echo "==> Enabling required GCP APIs (Cloud Run, Cloud Build, Artifact Registry)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project="$PROJECT_ID"

# ------------------------------------------------------------------------------
# 1. Deploy Node.js Backend API
# ------------------------------------------------------------------------------
echo ""
echo "--------------------------------------------------"
echo "1/3 Deploying Kaizen Backend API (Node.js Express)..."
echo "--------------------------------------------------"

gcloud run deploy kaizen-backend \
  --source ./backend \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT_ID="$PROJECT_ID"

BACKEND_URL=$(gcloud run services describe kaizen-backend --project "$PROJECT_ID" --region "$REGION" --format 'value(status.url)')
echo " Kaizen Backend deployed successfully: $BACKEND_URL"

# ------------------------------------------------------------------------------
# 2. Deploy Python Voice & Intelligence Bot
# ------------------------------------------------------------------------------
echo ""
echo "--------------------------------------------------"
echo "2/3 Deploying Kaizen Voice Bot (Python Flask)..."
echo "--------------------------------------------------"

gcloud run deploy kaizen-bot \
  --source ./backend/bot \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars FLASK_ENV=production,GOOGLE_CLOUD_PROJECT_ID="$PROJECT_ID"

BOT_URL=$(gcloud run services describe kaizen-bot --project "$PROJECT_ID" --region "$REGION" --format 'value(status.url)')
echo " Kaizen Bot deployed successfully: $BOT_URL"

# ------------------------------------------------------------------------------
# 3. Deploy React / Vite Frontend UI
# ------------------------------------------------------------------------------
echo ""
echo "--------------------------------------------------"
echo "3/3 Deploying Kaizen Frontend UI (React / Vite / Nginx)..."
echo "--------------------------------------------------"

# Pass Backend & Bot Cloud Run URLs into build & runtime
gcloud run deploy kaizen-frontend \
  --source ./frontend \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "VITE_API_URL=${BACKEND_URL}/api,VITE_BOT_API_URL=${BOT_URL},VITE_VOICE_CHATBOT_API=${BOT_URL}"

FRONTEND_URL=$(gcloud run services describe kaizen-frontend --project "$PROJECT_ID" --region "$REGION" --format 'value(status.url)')
echo " Kaizen Frontend deployed successfully: $FRONTEND_URL"

# Update Backend CORS with Frontend URL
echo ""
echo "==> Updating Backend CORS whitelist with Frontend Cloud Run URL..."
gcloud run services update kaizen-backend \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --update-env-vars "FRONTEND_URL=${FRONTEND_URL}"

echo ""
echo "=================================================="
echo "  Deployment Complete! "
echo "=================================================="
echo " Frontend URL:  $FRONTEND_URL"
echo " Backend API:   $BACKEND_URL/api"
echo " Voice Bot API: $BOT_URL"
echo "=================================================="
