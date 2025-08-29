import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import Recurring from '../models/Recurring.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function datesBetween(start, end) {
  const out = [];
  const s = new Date(start);
  const e = new Date(end);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate()+1)) {
    out.push(new Date(d));
  }
  return out;
}
function iso(d){ return new Date(d).toISOString().slice(0,10); }

// Obtener tareas por rango de fechas (expande recurrentes)
router.get('/', requireAuth, 
  query('start').optional().isISO8601(),
  query('end').optional().isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { start, end } = req.query;
    const userId = req.user.id;
    const filter = { userId };
    if (start && end) {
      filter.date = { $gte: start, $lte: end };
    }
    const tasks = await Task.find(filter).sort({ date: 1, createdAt: 1 });

    // Reglas recurrentes dentro del rango
    let expanded = [...tasks];
    if (start && end) {
      const rules = await Recurring.find({
        userId,
        $or: [
          { endDate: null },
          { endDate: { $gte: start } }
        ],
        startDate: { $lte: end },
      });

      const realByDateAndRule = new Set(tasks.filter(t => t.fromRecurring).map(t => `${t.date}|${t.fromRecurring}`));

      const allDates = datesBetween(start, end);
      for (const rule of rules) {
        const rs = new Date(rule.startDate);
        const re = rule.endDate ? new Date(rule.endDate) : null;
        for (const d of allDates) {
          if (d.getDay() !== rule.weekday) continue;
          if (d < rs) continue;
          if (re && d > re) continue;
          const key = `${iso(d)}|${rule._id}`;
          if (realByDateAndRule.has(key)) continue; // ya hay instancia real
          expanded.push({
            _id: `recurring:${rule._id}:${iso(d)}`,
            userId,
            date: iso(d),
            text: rule.text,
            done: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            virtual: true,
            fromRecurring: rule._id,
          });
        }
      }
    }
    expanded.sort((a,b)=> (a.date===b.date ? 0 : (a.date<b.date?-1:1)));
    res.json({ tasks: expanded });
  }
);

// Obtener tareas de un día específico (expande recurrentes)
router.get('/:date', requireAuth, param('date').isISO8601(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const userId = req.user.id;
  const date = req.params.date;
  const tasks = await Task.find({ userId, date }).sort({ createdAt: 1 });

  const rules = await Recurring.find({
    userId,
    $or: [{ endDate: null }, { endDate: { $gte: date } }],
    startDate: { $lte: date },
    weekday: new Date(date).getDay(),
  });

  const realByRule = new Set(tasks.filter(t => t.fromRecurring).map(t => String(t.fromRecurring)));
  const expanded = [...tasks];
  for (const r of rules) {
    if (realByRule.has(String(r._id))) continue;
    expanded.push({
      _id: `recurring:${r._id}:${date}`,
      userId, date, text: r.text, done:false, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(),
      virtual:true, fromRecurring:r._id
    });
  }
  res.json({ tasks: expanded });
});

// Crear tarea normal
router.post('/', requireAuth, 
  body('date').isISO8601(),
  body('text').isString().isLength({ min: 1, max: 300 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const userId = req.user.id;
    const { date, text, fromRecurring } = req.body;
    const task = await Task.create({ userId, date, text, done: false, fromRecurring: fromRecurring || null });
    res.status(201).json({ task });
  }
);

// Materializar instancia desde regla recurrente
router.post('/materialize', requireAuth,
  body('recurringId').isString(),
  body('date').isISO8601(),
  body('done').optional().isBoolean(),
  body('text').optional().isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const userId = req.user.id;
    const { recurringId, date, done=false, text } = req.body;
    const rule = await Recurring.findOne({ _id: recurringId, userId });
    if (!rule) return res.status(404).json({ error: 'Regla no encontrada' });
    const t = await Task.create({ userId, date, text: text || rule.text, done, fromRecurring: rule._id });
    res.status(201).json({ task: t });
  }
);

// Actualizar tarea
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const update = {};
  if (typeof req.body.text === 'string') update.text = req.body.text;
  if (typeof req.body.done === 'boolean') update.done = req.body.done;
  const task = await Task.findOneAndUpdate({ _id: id, userId }, { $set: update }, { new: true });
  if (!task) return res.status(404).json({ error: 'No encontrado' });
  res.json({ task });
});

// Eliminar tarea
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const task = await Task.findOneAndDelete({ _id: id, userId });
  if (!task) return res.status(404).json({ error: 'No encontrado' });
  res.json({ ok: true });
});

export default router;
