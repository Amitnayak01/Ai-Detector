import { Router, Request, Response, NextFunction } from 'express';
import { Scan } from '../models/Scan';
import { cloudinary } from '../config/cloudinary';
import { logger } from '../config/logger';

const router = Router();

// GET /api/history?page=1&limit=10
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      Scan.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Scan.countDocuments(),
    ]);

    res.json({
      scans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/history/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const scan = await Scan.findById(req.params.id);
    if (!scan) {
      res.status(404).json({ error: 'Scan not found', code: 'NOT_FOUND' });
      return;
    }

    await Promise.all([
      cloudinary.uploader.destroy(scan.publicId),
      Scan.findByIdAndDelete(req.params.id),
    ]);

    logger.info('Scan deleted', { id: req.params.id, publicId: scan.publicId });
    res.json({ message: 'Scan deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/history - clear all
router.delete('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const scans = await Scan.find().select('publicId').lean();
    const publicIds = scans.map((s) => s.publicId).filter(Boolean);

    // Delete from Cloudinary in batches
    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    await Scan.deleteMany({});
    logger.info('All scans cleared', { count: scans.length });
    res.json({ message: `Cleared ${scans.length} scans` });
  } catch (err) {
    next(err);
  }
});

export default router;
