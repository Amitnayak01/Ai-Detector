import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import multer from 'multer';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Error:', { message: err.message, stack: err.stack });

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'File too large. Maximum size is 5MB.', code: 'FILE_TOO_LARGE' });
      return;
    }
    res.status(400).json({ error: err.message, code: 'UPLOAD_ERROR' });
    return;
  }

  if (err.message === 'INVALID_TYPE') {
    res.status(422).json({
      error: 'Invalid file type. Allowed: JPEG, PNG, WEBP, GIF',
      code: 'INVALID_TYPE',
    });
    return;
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  });
}
