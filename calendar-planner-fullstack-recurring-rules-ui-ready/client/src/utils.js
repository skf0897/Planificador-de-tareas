export const startOfWeek = (date) => {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Monday=0
  d.setDate(d.getDate() - day);
  d.setHours(0,0,0,0);
  return d;
};
export const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate()+n); return d; };
export const addMonths = (date, n) => { const d = new Date(date); d.setMonth(d.getMonth()+n); return d; };
export const formatISO = (d) => new Date(d).toISOString().slice(0,10);
export const monthLabel = (d) => new Date(d).toLocaleString(undefined, { month: 'long', year: 'numeric' });
export const dayLabel = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
export const getMonthMatrix = (date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = startOfWeek(first);
  const weeks = [];
  let cursor = start;
  for (let w=0; w<6; w++) {
    const week = [];
    for (let i=0; i<7; i++) { week.push(new Date(cursor)); cursor = addDays(cursor, 1); }
    weeks.push(week);
  }
  return weeks;
};
