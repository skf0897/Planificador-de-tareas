import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, CheckSquare, Plus, ChevronLeft, ChevronRight, X, ListTodo, LayoutGrid, LogIn, LogOut } from 'lucide-react';
import { Auth, Tasks, Recurring } from './api.js';
import RulesView from './RulesView.jsx';
import { startOfWeek, addDays, addMonths, formatISO, monthLabel, dayLabel, getMonthMatrix } from './utils.js';

const Button = ({ className = '', variant = 'default', ...props }) => (
  <button
    className={[
      'px-3 py-2 rounded-2xl text-sm font-medium shadow-sm transition',
      variant === 'default' && 'bg-black text-white hover:opacity-90',
      variant === 'ghost' && 'bg-transparent hover:bg-gray-100',
      variant === 'outline' && 'border border-gray-300 bg-white hover:bg-gray-50',
      className,
    ].filter(Boolean).join(' ')}
    {...props}
  />
);

const Chip = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={[
      'px-3 py-1 rounded-full text-xs font-medium border transition',
      active ? 'bg-black text-white border-black' : 'bg-white border-gray-300 hover:bg-gray-50',
    ].join(' ')}
  >{children}</button>
);

const Dialog = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{title}</h3>
            <Button variant="ghost" className="rounded-full" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const res = await Auth.me();
    setUser(res.user);
    setLoading(false);
  })(); }, []);

  if (loading) return <div className='min-h-screen grid place-items-center text-gray-500'>Cargando…</div>;

  return user ? <CalendarApp user={user} setUser={setUser} /> : <AuthView setUser={setUser} />;
}

function AuthView({ setUser }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demodemo');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const api = mode === 'login' ? Auth.login : Auth.register;
      const res = await api(email, password);
      setUser(res.user);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className='min-h-screen grid place-items-center p-6 bg-gradient-to-b from-gray-50 to-gray-100'>
      <div className='w-full max-w-sm bg-white border rounded-2xl shadow-sm p-6'>
        <div className='flex items-center gap-2 mb-4'>
          <div className='w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md'>
            <LogIn className='w-5 h-5' />
          </div>
          <div>
            <h1 className='text-xl font-bold'>Planner 3D</h1>
            <p className='text-xs text-gray-500'>Accede o crea tu cuenta</p>
          </div>
        </div>
        <form className='space-y-3' onSubmit={submit}>
          <input className='w-full border rounded-xl px-3 py-2' placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} />
          <input className='w-full border rounded-xl px-3 py-2' placeholder='Password' type='password' value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div className='text-red-600 text-sm'>{error}</div>}
          <Button className='w-full'>{mode==='login' ? 'Entrar' : 'Crear cuenta'}</Button>
        </form>
        <div className='text-xs text-gray-500 mt-3'>
          {mode==='login' ? (
            <>¿No tienes cuenta? <button className='underline' onClick={()=>setMode('register')}>Regístrate</button></>
          ) : (
            <>¿Ya tienes cuenta? <button className='underline' onClick={()=>setMode('login')}>Inicia sesión</button></>
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarApp({ user, setUser }) {
  const [current, setCurrent] = useState(new Date());
  const [view, setView] = useState('week');
  const [activeDate, setActiveDate] = useState(null);
  const [newItem, setNewItem] = useState('');
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [tasksByDate, setTasksByDate] = useState({}); // { 'YYYY-MM-DD': [tasks] }
  const [loading, setLoading] = useState(false);

  const weekDays = useMemo(() => {
    const start = startOfWeek(current);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [current]);

  const openDay = (d) => setActiveDate(new Date(d));
  const closeDay = () => { setActiveDate(null); setNewItem(''); };

  const itemsFor = (d) => tasksByDate[formatISO(d)] || [];

  const setItemsFor = (d, arr) => {
    const key = formatISO(d);
    setTasksByDate((s) => ({ ...s, [key]: arr }));
  };

  const fetchRange = async (start, end) => {
    setLoading(true);
    try {
      const res = await Tasks.range(formatISO(start), formatISO(end));
      const map = {};
      for (const t of res.tasks) {
        if (!map[t.date]) map[t.date] = [];
        map[t.date].push(t);
      }
      setTasksByDate(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'week') {
      const start = startOfWeek(current);
      const end = addDays(start, 6);
      fetchRange(start, end);
    } else if (view === 'month') {
      const first = new Date(current.getFullYear(), current.getMonth(), 1);
      const last = new Date(current.getFullYear(), current.getMonth()+1, 0);
      fetchRange(first, last);
    } else if (view === 'year') {
      const first = new Date(current.getFullYear(), 0, 1);
      const last = new Date(current.getFullYear(), 11, 31);
      fetchRange(first, last);
    }
  }, [current, view]);

  const addItem = async () => {
    if (!newItem.trim()) return;
    const date = formatISO(activeDate);
    if (repeatWeekly) {
      // Crear regla recurrente
      const weekday = new Date(date).getDay();
      await Recurring.create({ text: newItem.trim(), weekday, startDate: date });
      // Refetch para verlas expandidas
      if (view === 'week') { const s = startOfWeek(current); const e = addDays(s, 6); fetchRange(s, e); }
      if (view === 'month') { const first = new Date(current.getFullYear(), current.getMonth(), 1); const last = new Date(current.getFullYear(), current.getMonth()+1, 0); fetchRange(first, last); }
      if (view === 'year') { const first = new Date(current.getFullYear(), 0, 1); const last = new Date(current.getFullYear(), 11, 31); fetchRange(first, last); }
    } else {
      const res = await Tasks.create(date, newItem.trim());
      setItemsFor(activeDate, [...itemsFor(activeDate), res.task]);
    }
    setNewItem(''); setRepeatWeekly(false);
  };

  const toggleItem = async (task) => {
    if (task.virtual && task.fromRecurring) {
      const res = await Tasks.materialize(task.fromRecurring, task.date, !task.done, task.text);
      setItemsFor(activeDate, itemsFor(activeDate).map(it => it._id === task._id ? res.task : it));
    } else {
      const res = await Tasks.update(task._id, { done: !task.done });
      setItemsFor(activeDate, itemsFor(activeDate).map(it => it._id === res.task._id ? res.task : it));
    }
  };

  const removeItem = async (task) => {
    await Tasks.remove(task._id);
    setItemsFor(activeDate, itemsFor(activeDate).filter(it => it._id !== task._id));
  };

  const goPrev = () => setCurrent((d) => view === 'year' ? addMonths(d, -12) : view === 'month' ? addMonths(d, -1) : addDays(d, -7));
  const goNext = () => setCurrent((d) => view === 'year' ? addMonths(d, 12) : view === 'month' ? addMonths(d, 1) : addDays(d, 7));
  const resetToday = () => setCurrent(new Date());

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6'>
      <div className='mx-auto max-w-7xl'>
        <div className='flex flex-wrap items-center gap-3 justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md'>
              <CalendarIcon className='w-5 h-5' />
            </div>
            <div>
              <h1 className='text-2xl font-bold leading-none'>Planner 3D</h1>
              <p className='text-sm text-gray-500'>Hola, {user.email}</p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Chip active={view==='week'} onClick={()=>setView('week')}>Semana</Chip>
            <Chip active={view==='month'} onClick={()=>setView('month')}>Mes</Chip>
            <Chip active={view==='year'} onClick={()=>setView('year')}>Año</Chip>
            <Chip active={view==='rules'} onClick={()=>setView('rules')}>Reglas</Chip>
            <Button variant='ghost' onClick={async()=>{ await Auth.logout(); setUser(null); }} title='Salir'>
              <LogOut className='w-4 h-4' />
            </Button>
          </div>
        </div>

        {view!=='rules' ? (
          <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
            <div className='flex items-center gap-2'>
              <Button variant='outline' onClick={goPrev} aria-label='Anterior'><ChevronLeft className='w-4 h-4' /></Button>
              <div className='px-4 py-2 rounded-2xl bg-white border text-sm font-semibold shadow-sm'>
                {view==='year' ? current.getFullYear() : monthLabel(current)}
              </div>
              <Button variant='outline' onClick={goNext} aria-label='Siguiente'><ChevronRight className='w-4 h-4' /></Button>
              <Button variant='ghost' onClick={resetToday}>Hoy</Button>
            </div>

            <div className='flex items-center gap-2'>
              <Button onClick={() => setActiveDate(new Date())}><Plus className='w-4 h-4 mr-1 inline'/>Nueva tarea hoy</Button>
              <Button variant='outline' onClick={()=>{ window.location.href = (import.meta.env.VITE_API_URL || (window.location.hostname==='localhost' ? 'http://localhost:4000' : '')) + '/api/auth/google'; }}>Conectar Google</Button>
            </div>
          </div>
        ) : null}

        {loading && <div className='text-sm text-gray-500 mb-2'>Actualizando…</div>}

        {view==='week' && (
          <WeekView days={weekDays} openDay={openDay} itemsFor={itemsFor} />
        )}
        {view==='month' && (
          <MonthView date={current} openDay={openDay} itemsFor={itemsFor} />
        )}
        {view==='year' && (
          <YearView year={current.getFullYear()} openDay={openDay} itemsFor={itemsFor} />
        )}
        {view==='rules' && (
          <div className='mt-2'>
            <RulesView />
          </div>
        )}
      </div>

      <Dialog open={!!activeDate} onClose={()=>{ closeDay(); }} title={activeDate ? dayLabel(activeDate) : ''}>
        {activeDate && (
          <div className='space-y-4'>
            <div className='flex gap-2 items-center'>
              <input className='flex-1 border rounded-xl px-3 py-2' placeholder='Agregar tarea…' value={newItem} onChange={e=>setNewItem(e.target.value)} onKeyDown={e=> e.key==='Enter' && addItem()} />
              <label className='text-xs flex items-center gap-1 whitespace-nowrap'><input type='checkbox' className='w-4 h-4' checked={repeatWeekly} onChange={e=>setRepeatWeekly(e.target.checked)} /> Repetir cada semana</label>
              <Button onClick={addItem}><Plus className='w-4 h-4 mr-1 inline'/>Agregar</Button>
            </div>
            <ul className='divide-y rounded-xl border overflow-hidden'>
              {itemsFor(activeDate).length===0 && (
                <li className='p-4 text-sm text-gray-500 flex items-center gap-2'><ListTodo className='w-4 h-4'/>Sin tareas aún.</li>
              )}
              {itemsFor(activeDate).map((it) => (
                <li key={it._id} className='p-3 flex items-center gap-3 bg-white'>
                  <input type='checkbox' checked={it.done} onChange={()=>toggleItem(it)} className='w-4 h-4' />
                  <span className={['flex-1 text-sm', it.done && 'line-through text-gray-400'].filter(Boolean).join(' ')}>{it.text}</span>
                  {!it.virtual && (<Button variant='ghost' onClick={()=>removeItem(it)} aria-label='Eliminar'><X className='w-4 h-4' /></Button>)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Dialog>

      <footer className='mt-10 text-center text-xs text-gray-500'>Hecho con ❤️ en React + Tailwind. Autenticación con cookie httpOnly.</footer>
    </div>
  );
}

function WeekView({ days, openDay, itemsFor }) {
  const weekdays = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  return (
    <div className='grid grid-cols-7 gap-3'>
      {days.map((d, i) => (
        <motion.div key={i} whileHover={{ rotateX: 2, rotateY: -2, translateZ: 6 }} style={{ perspective: 1000 }} className='group'>
          <div onClick={()=>openDay(d)} className='cursor-pointer bg-white border rounded-2xl shadow-sm p-4 min-h-[140px] flex flex-col transition transform group-hover:shadow-xl group-hover:-translate-y-0.5'>
            <div className='flex items-center justify-between mb-2'>
              <div>
                <p className='text-xs uppercase tracking-wide text-gray-400'>{weekdays[i]}</p>
                <p className='text-xl font-semibold leading-none'>{d.getDate()}</p>
              </div>
              <CheckSquare className='w-5 h-5 text-gray-400' />
            </div>
            <ul className='space-y-1 mt-2'>
              {itemsFor(d).slice(0,3).map((it)=> (
                <li key={it._id} className='text-xs flex items-center gap-2'>
                  <span className={['w-2 h-2 rounded-full inline-block', it.done ? 'bg-gray-400' : 'bg-black'].join(' ')} />
                  <span className={['truncate', it.done && 'line-through text-gray-400'].filter(Boolean).join(' ')}>{it.text}</span>
                </li>
              ))}
            </ul>
            {itemsFor(d).length > 3 && (<p className='text-[11px] text-gray-400 mt-auto'>+{itemsFor(d).length - 3} más…</p>)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MonthView({ date, openDay, itemsFor }) {
  const weeks = getMonthMatrix(date);
  const monthIndex = date.getMonth();
  return (
    <div className='bg-white border rounded-2xl shadow-sm'>
      <div className='grid grid-cols-7 text-xs font-semibold text-gray-500 px-4 pt-3'>
        {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d) => (<div key={d} className='p-2'>{d}</div>))}
      </div>
      <div className='grid grid-cols-7 gap-2 p-4'>
        {weeks.flat().map((d, idx) => {
          const isOther = d.getMonth() !== monthIndex;
          return (
            <div key={idx} className='aspect-square'>
              <div onClick={()=>openDay(d)} className={['w-full h-full rounded-xl border p-2 cursor-pointer flex flex-col text-xs transition hover:shadow-md', isOther ? 'bg-gray-50 text-gray-400' : 'bg-white'].join(' ')}>
                <div className='flex items-center justify-between'>
                  <span className='font-semibold'>{d.getDate()}</span>
                  {itemsFor(d).length > 0 && <span className='text-[10px] px-2 py-0.5 rounded-full bg-black text-white'>{itemsFor(d).length}</span>}
                </div>
                <div className='mt-1 space-y-1 overflow-hidden'>
                  {itemsFor(d).slice(0,2).map((it) => (<div key={it._id} className={['truncate', it.done && 'text-gray-400 line-through'].filter(Boolean).join(' ')}>{it.text}</div>))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YearView({ year, openDay, itemsFor }) {
  const months = Array.from({ length: 12 }, (_, m) => new Date(year, m, 1));
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
      {months.map((m, idx) => (
        <div key={idx} className='bg-white border rounded-2xl shadow-sm p-3'>
          <div className='flex items-center justify-between mb-2'>
            <h3 className='font-semibold text-sm'>{m.toLocaleString(undefined,{ month: 'long', year: 'numeric' })}</h3>
            <LayoutGrid className='w-4 h-4 text-gray-400'/>
          </div>
          <MiniMonth monthDate={m} openDay={openDay} itemsFor={itemsFor} />
        </div>
      ))}
    </div>
  );
}

function MiniMonth({ monthDate, openDay, itemsFor }) {
  const weeks = getMonthMatrix(monthDate);
  const monthIndex = monthDate.getMonth();
  return (
    <div className='grid grid-cols-7 gap-1 text-[10px]'>
      {['L','M','X','J','V','S','D'].map((d) => (<div key={d} className='text-center text-gray-400'>{d}</div>))}
      {weeks.flat().map((d, idx) => {
        const isOther = d.getMonth() !== monthIndex;
        const count = itemsFor(d).length;
        return (
          <button key={idx} onClick={()=>openDay(d)} className={['aspect-square rounded-md border flex items-center justify-center', isOther ? 'bg-gray-50 text-gray-300' : 'bg-white', count>0 && 'border-black'].filter(Boolean).join(' ')} title={`${d.toDateString()} • ${count} tareas`}>
            <span className='leading-none'>{d.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}

// Nota: Para listar eventos, llama a /api/calendar/list desde una vista propia si lo prefieres.
