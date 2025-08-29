// Fake API for demo (offline preview)
// Stores data in localStorage, no backend required.

function load(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let todos = load('demo_tasks');

export const Auth = {
  me: async () => ({ user: { id: 'demo', email: 'demo@offline.local' } }),
  register: async () => ({ user: { id: 'demo', email: 'demo@offline.local' } }),
  login: async () => ({ user: { id: 'demo', email: 'demo@offline.local' } }),
  logout: async () => ({ ok: true })
};

export const Tasks = {
  range: async (start, end) => {
    return { tasks: Object.values(todos).flat() };
  },
  byDate: async (date) => {
    return { tasks: todos[date] || [] };
  },
  create: async (date, text) => {
    const task = { _id: Math.random().toString(36).slice(2), date, text, done: false };
    todos[date] = todos[date] || []; todos[date].push(task); save('demo_tasks', todos);
    return { task };
  },
  update: async (id, data) => {
    for (const d in todos) {
      todos[d] = todos[d].map(t => t._id === id ? { ...t, ...data } : t);
    }
    save('demo_tasks', todos);
    const found = Object.values(todos).flat().find(t => t._id === id);
    return { task: found };
  },
  remove: async (id) => {
    for (const d in todos) {
      todos[d] = todos[d].filter(t => t._id !== id);
    }
    save('demo_tasks', todos);
    return { ok: true };
  }
};
