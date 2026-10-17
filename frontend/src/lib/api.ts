// Hardcoded API endpoints using logical OR for fallback
// Backend API
const BACKEND_API = 'https://kaizen-backend-8x01.onrender.com/api';
// Bot API
const BOT_API = 'https://kaizen-bot-awcf.onrender.com/api';
// Primary API base used by the frontend (fallback to bot API if backend API is unavailable)
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
