// API helper (respeta VITE_DEMO si existe)
const isDemo = import.meta.env.VITE_DEMO === '1';
const REAL_API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000' : '/api');
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }

// DEMO backend
const DEMO = {
  me: async()=>({ user:{ id:'demo', email:'demo@example.com' } }),
  register: async(e,p)=>({ ok:true, user:{ id:'demo', email:e } }),
  login: async(e,p)=>({ ok:true, user:{ id:'demo', email:e } }),
  logout: async()=>({ ok:true }),
  map(){ try { return JSON.parse(localStorage.getItem('demo_tasks')||'{}'); } catch { return {}; } },
  set(m){ localStorage.setItem('demo_tasks', JSON.stringify(m)); },
  async range(start,end){ await delay(50); const m=this.map(); const tasks=[]; for(let d=new Date(start); d<=new Date(end); d.setDate(d.getDate()+1)){ const k=d.toISOString().slice(0,10); (m[k]||[]).forEach(t=>tasks.push(t)); } return { tasks }; },
  async byDate(date){ await delay(20); const m=this.map(); return { tasks: m[date]||[] }; },
  async create(date,text){ await delay(20); const m=this.map(); const t={ _id:crypto.randomUUID(), date, text, done:false, createdAt:new Date().toISOString() }; m[date]=(m[date]||[]).concat(t); this.set(m); return { task:t }; },
  async update(id,data){ await delay(20); const m=this.map(); for(const k of Object.keys(m)){ const i=m[k].findIndex(x=>x._id===id); if(i>=0){ m[k][i]={...m[k][i],...data}; this.set(m); return { task:m[k][i] }; } } throw new Error('No encontrado'); },
  async remove(id){ await delay(20); const m=this.map(); for(const k of Object.keys(m)){ const n=(m[k]||[]).filter(x=>x._id!==id); if(n.length!==(m[k]||[]).length){ m[k]=n; this.set(m); return { ok:true }; } } return { ok:true }; },
  async materialize(recurringId,date,done){ return this.create(date, '[REP] '+date); },
  async recList(){ return { rules: JSON.parse(localStorage.getItem('demo_rec')||'[]') }; },
  async recCreate(payload){ const arr=JSON.parse(localStorage.getItem('demo_rec')||'[]'); const rule={ ...payload, _id: crypto.randomUUID() }; arr.push(rule); localStorage.setItem('demo_rec', JSON.stringify(arr)); return { rule }; },
  async recDelete(id){ const arr=JSON.parse(localStorage.getItem('demo_rec')||'[]').filter(r=>r._id!==id); localStorage.setItem('demo_rec', JSON.stringify(arr)); return { ok:true }; },
};

export async function api(path, options = {}) {
  if (isDemo) throw new Error('api() no disponible en DEMO');
  const res = await fetch(`${REAL_API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    let msg='Error'; try { const j=await res.json(); msg=j.error||JSON.stringify(j);} catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const Auth = {
  me: () => isDemo ? DEMO.me() : api('/api/auth/me'),
  register: (email, password) => isDemo ? DEMO.register(email,password) : api('/api/auth/register', { method:'POST', body: JSON.stringify({ email, password }) }),
  login: (email, password) => isDemo ? DEMO.login(email,password) : api('/api/auth/login', { method:'POST', body: JSON.stringify({ email, password }) }),
  logout: () => isDemo ? DEMO.logout() : api('/api/auth/logout', { method:'POST' }),
};

export const Tasks = {
  range: (start, end) => isDemo ? DEMO.range(start,end) : api(`/api/tasks?start=${start}&end=${end}`),
  byDate: (date) => isDemo ? DEMO.byDate(date) : api(`/api/tasks/${date}`),
  create: (date, text, fromRecurring=null) => isDemo ? DEMO.create(date,text) : api('/api/tasks', { method:'POST', body: JSON.stringify({ date, text, fromRecurring }) }),
  update: (id, data) => isDemo ? DEMO.update(id,data) : api(`/api/tasks/${id}`, { method:'PATCH', body: JSON.stringify(data) }),
  remove: (id) => isDemo ? DEMO.remove(id) : api(`/api/tasks/${id}`, { method:'DELETE' }),
  materialize: (recurringId, date, done=false, text) => isDemo ? DEMO.materialize(recurringId,date,done) : api('/api/tasks/materialize', { method:'POST', body: JSON.stringify({ recurringId, date, done, text }) }),
};

export const Recurring = {
  list: () => isDemo ? DEMO.recList() : api('/api/recurring'),
  create: (payload) => isDemo ? DEMO.recCreate(payload) : api('/api/recurring', { method:'POST', body: JSON.stringify(payload) }),
  delete: (id) => isDemo ? DEMO.recDelete(id) : api(`/api/recurring/${id}`, { method:'DELETE' }),
};
