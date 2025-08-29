import { Router } from 'express';
import { body, validationResult, param } from 'express-validator';
import Recurring from '../models/Recurring.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const rules = await Recurring.find({ userId }).sort({ createdAt: -1 });
  res.json({ rules });
});

router.post('/', requireAuth,
  body('text').isString().isLength({ min: 1, max: 300 }),
  body('weekday').isInt({ min: 0, max: 6 }),
  body('startDate').isISO8601(),
  body('endDate').optional().isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const userId = req.user.id;
    const rule = await Recurring.create({ userId, ...req.body });
    res.status(201).json({ rule });
  }
);

router.delete('/:id', requireAuth, param('id').isString(), async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const rule = await Recurring.findOneAndDelete({ _id: id, userId });
  if (!rule) return res.status(404).json({ error: 'No encontrado' });
  res.json({ ok: true });
});

export default router;
