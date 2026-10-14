const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api';
  }
  return 'https://kaizen-backend-8x01.onrender.com/api';
};

const API_BASE = getApiBase();

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
