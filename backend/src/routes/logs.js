import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/logs
 * Add a new fluid log entry (INTAKE or OUTPUT)
 * 
 * Body: { type: "INTAKE" | "OUTPUT", amount: number }
 */
router.post('/', async (req, res, next) => {
  try {
    const { type, amount } = req.body;

    // Validation
    if (!type || !['INTAKE', 'OUTPUT'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be INTAKE or OUTPUT.' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const log = await prisma.fluidLog.create({
      data: {
        userId: req.userId,
        type,
        amount: Math.round(amount),
      },
    });

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/logs/daily
 * Fetch today's total intake and output for the authenticated user.
 * 
 * Returns: { totalIntake: number, totalOutput: number, logs: FluidLog[] }
 */
router.get('/daily', async (req, res, next) => {
  try {
    // Get start of today (midnight UTC)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all logs for today
    const logs = await prisma.fluidLog.findMany({
      where: {
        userId: req.userId,
        timestamp: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Calculate totals
    const totalIntake = logs
      .filter((log) => log.type === 'INTAKE')
      .reduce((sum, log) => sum + log.amount, 0);

    const totalOutput = logs
      .filter((log) => log.type === 'OUTPUT')
      .reduce((sum, log) => sum + log.amount, 0);

    res.json({
      totalIntake,
      totalOutput,
      logs,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
