import { getEnv } from './config';

// API endpoints with environment variable configuration & fallbacks
const BACKEND_API = getEnv('VITE_API_URL', 'https://kaizen-backend-8x01.onrender.com/api').replace(/\/$/, '');
const BOT_API = (getEnv('VITE_BOT_API_URL') || getEnv('VITE_VOICE_CHATBOT_API') || 'https://kaizen-bot-awcf.onrender.com/api').replace(/\/$/, '');
// Primary API base used by the frontend
const API_BASE = BACKEND_API || BOT_API;


export async function fetchTeams() {
  const res = await fetch(`${API_BASE}/tasks/teams`);
  if (!res.ok) throw new Error('Failed to fetch teams');
  return res.json();
}

export async function fetchEmployees() {
  const res = await fetch(`${API_BASE}/tasks/employees`);
  if (!res.ok) throw new Error('Failed to fetch employees');
  return res.json();
}

export async function fetchTemplates() {
  const res = await fetch(`${API_BASE}/tasks/templates`);
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function allocateTask(taskDescription: string, taskType?: string) {
  const res = await fetch(`${API_BASE}/tasks/allocate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      task_description: taskDescription,
      task_type: taskType || undefined
    })
  });
  if (!res.ok) throw new Error('Failed to allocate task');
  return res.json();
}
