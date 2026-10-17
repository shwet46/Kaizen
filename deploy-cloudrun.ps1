# ==============================================================================
# Kaizen - Automated Cloud Run Deployment Script (PowerShell for Windows)
# Deploys Backend (Node.js), Bot (Python), and Frontend (React/Vite) to Google Cloud Run
# ==============================================================================

[CmdletBinding()]
param (
    [string]$ProjectId = $(if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { "allknighters" }),
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Kaizen Google Cloud Run Deployment Pipeline" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

if (-not $ProjectId -or $ProjectId -eq "(unset)") {
    $ProjectId = "allknighters"
}

if (-not $ProjectId -or $ProjectId -eq "(unset)") {
    Write-Host "Error: No GCP Project ID configured." -ForegroundColor Red
    Write-Host "Please run: gcloud config set project <YOUR_PROJECT_ID>" -ForegroundColor Yellow
    Write-Host "Or pass parameter: .\deploy-cloudrun.ps1 -ProjectId <YOUR_PROJECT_ID>" -ForegroundColor Yellow
    Exit 1
}

Write-Host "Target GCP Project: $ProjectId" -ForegroundColor Green
Write-Host "Target Region:      $Region" -ForegroundColor Green
Write-Host ""

Write-Host "==> Enabling required GCP APIs (Cloud Run, Cloud Build, Artifact Registry)..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project="$ProjectId"

# ------------------------------------------------------------------------------
# 1. Deploy Node.js Backend API
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "1/3 Deploying Kaizen Backend API (Node.js Express)..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

gcloud run deploy kaizen-backend `
  --source ./backend `
  --project "$ProjectId" `
  --region "$Region" `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 5 `
  --set-env-vars NODE_ENV=production,GOOGLE_CLOUD_PROJECT_ID="$ProjectId"

$BackendUrl = (gcloud run services describe kaizen-backend --project "$ProjectId" --region "$Region" --format "value(status.url)").Trim()
Write-Host " Kaizen Backend deployed: $BackendUrl" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 2. Deploy Python Voice & Intelligence Bot
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "2/3 Deploying Kaizen Voice Bot (Python Flask)..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

gcloud run deploy kaizen-bot `
  --source ./backend/bot `
  --project "$ProjectId" `
  --region "$Region" `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 1Gi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 5 `
  --set-env-vars FLASK_ENV=production,GOOGLE_CLOUD_PROJECT_ID="$ProjectId"

$BotUrl = (gcloud run services describe kaizen-bot --project "$ProjectId" --region "$Region" --format "value(status.url)").Trim()
Write-Host " Kaizen Bot deployed: $BotUrl" -ForegroundColor Green

# ------------------------------------------------------------------------------
# 3. Deploy React / Vite Frontend UI
# ------------------------------------------------------------------------------
Write-Host ""
Write-Host "--------------------------------------------------" -ForegroundColor Cyan
Write-Host "3/3 Deploying Kaizen Frontend UI (React / Vite / Nginx)..." -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Cyan

gcloud run deploy kaizen-frontend `
  --source ./frontend `
  --project "$ProjectId" `
  --region "$Region" `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 256Mi `
  --cpu 1 `
  --min-instances 0 `
  --max-instances 5 `
  --set-env-vars "VITE_API_URL=$BackendUrl/api,VITE_BOT_API_URL=$BotUrl,VITE_VOICE_CHATBOT_API=$BotUrl"

$FrontendUrl = (gcloud run services describe kaizen-frontend --project "$ProjectId" --region "$Region" --format "value(status.url)").Trim()
Write-Host " Kaizen Frontend deployed: $FrontendUrl" -ForegroundColor Green

# Update Backend CORS with Frontend URL
Write-Host ""
Write-Host "==> Updating Backend CORS whitelist with Frontend Cloud Run URL..." -ForegroundColor Yellow
gcloud run services update kaizen-backend `
  --project "$ProjectId" `
  --region "$Region" `
  --update-env-vars "FRONTEND_URL=$FrontendUrl"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete! " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Frontend URL:  $FrontendUrl" -ForegroundColor White
Write-Host " Backend API:   $BackendUrl/api" -ForegroundColor White
Write-Host " Voice Bot API: $BotUrl" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan
