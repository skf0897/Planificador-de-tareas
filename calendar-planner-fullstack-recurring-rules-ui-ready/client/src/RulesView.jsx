import React, { useEffect, useMemo, useState } from 'react';
import { Recurring } from './api.js';
import { formatISO } from './utils.js';

const weekdays = [
  { label: 'Domingo', value: 0 },
  { label: 'Lunes', value: 1 },
  { label: 'Martes', value: 2 },
  { label: 'Miércoles', value: 3 },
  { label: 'Jueves', value: 4 },
  { label: 'Viernes', value: 5 },
  { label: 'Sábado', value: 6 },
];

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

export default function RulesView() {
  const todayISO = useMemo(()=> formatISO(new Date()), []);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [weekday, setWeekday] = useState(new Date().getDay());
  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await Recurring.list();
      setList(res.rules || []);
    } catch (e) {
      setError(e.message || 'Error cargando reglas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRules(); }, []);

  const createRule = async (e) => {
    e?.preventDefault();
    setError('');
    try {
      if (!text.trim()) return setError('Escribe una descripción');
      const payload = { text: text.trim(), weekday: Number(weekday), startDate };
      if (endDate) payload.endDate = endDate;
      await Recurring.create(payload);
      setText(''); setEndDate('');
      fetchRules();
    } catch (e) {
      setError(e.message || 'Error creando regla');
    }
  };

  const deleteRule = async (id) => {
    if (!confirm('¿Eliminar esta regla?')) return;
    await Recurring.delete(id);
    setList(list => list.filter(r => r._id !== id));
  };

  return (
    <div className='space-y-6'>
      <div className='bg-white border rounded-2xl shadow-sm p-4'>
        <h2 className='font-semibold mb-2'>Crear regla semanal</h2>
        <form className='grid md:grid-cols-5 gap-2 items-center' onSubmit={createRule}>
          <input className='md:col-span-2 border rounded-xl px-3 py-2' placeholder='Descripción de la tarea' value={text} onChange={e=>setText(e.target.value)} />
          <select className='border rounded-xl px-3 py-2' value={weekday} onChange={e=>setWeekday(e.target.value)}>
            {weekdays.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>
          <input type='date' className='border rounded-xl px-3 py-2' value={startDate} onChange={e=>setStartDate(e.target.value)} />
          <div className='flex gap-2'>
            <input type='date' className='border rounded-xl px-3 py-2 flex-1' placeholder='Fin (opcional)' value={endDate} onChange={e=>setEndDate(e.target.value)} />
            <Button type='submit'>Agregar</Button>
          </div>
        </form>
        {error && <div className='text-red-600 text-sm mt-2'>{error}</div>}
      </div>

      <div className='bg-white border rounded-2xl shadow-sm'>
        <div className='px-4 py-3 border-b font-semibold'>Reglas activas</div>
        {loading ? (
          <div className='p-4 text-sm text-gray-500'>Cargando…</div>
        ) : list.length === 0 ? (
          <div className='p-4 text-sm text-gray-500'>No tienes reglas aún.</div>
        ) : (
          <ul className='divide-y'>
            {list.map((r) => (
              <li key={r._id} className='p-3 flex items-center gap-3'>
                <div className='flex-1'>
                  <div className='font-medium text-sm'>{r.text}</div>
                  <div className='text-xs text-gray-500'>
                    {weekdays.find(w => w.value === r.weekday)?.label} • desde {r.startDate}{r.endDate ? ` • hasta ${r.endDate}` : ''}
                  </div>
                </div>
                <Button variant='outline' onClick={()=>deleteRule(r._id)}>Eliminar</Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
