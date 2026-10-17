#!/bin/sh
set -e

# Dynamically generate runtime env-config.js from container environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-}",
  VITE_BOT_API_URL: "${VITE_BOT_API_URL:-}",
  VITE_VOICE_CHATBOT_API: "${VITE_VOICE_CHATBOT_API:-}",
  VITE_GEMINI_API_KEY: "${VITE_GEMINI_API_KEY:-}"
};
EOF
