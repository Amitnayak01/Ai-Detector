import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { upload } from '../middleware/upload';
import { cloudinary } from '../config/cloudinary';
import { Scan } from '../models/Scan';
import { mapVerdict } from '../utils/verdict';
import { logger } from '../config/logger';

const router = Router();

interface SightengineResponse {
  status: string;
  request: { id: string; timestamp: number; operations: number };
  type: { ai_generated: number };  // genai model returns here
  media: { deepfake: number };
  faces: Array<{ id: number }>;
  error?: { type: string; message: string };
}

async function uploadToCloudinary(
  buffer: Buffer,
  mimetype: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ai-detector',
        resource_type: 'image',
        format: mimetype.split('/')[1],
      },
      (error, result) => {
        if (error || !result) return reject(error || new Error('Cloudinary upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    uploadStream.end(buffer);
  });
}

async function analyzeWithSightengine(imageUrl: string): Promise<SightengineResponse> {
  try {
    // Sightengine expects query params for URL-based checks
    const response = await axios.get<SightengineResponse>(
      'https://api.sightengine.com/1.0/check.json',
      {
        params: {
          url: imageUrl,
          models: 'genai,deepfake,faces',
          api_user: process.env.SIGHTENGINE_API_USER,
          api_secret: process.env.SIGHTENGINE_API_SECRET,
        },
        timeout: 30000,
      }
    );

    if (response.data.status === 'failure') {
      logger.error('Sightengine returned failure', response.data.error);
      throw new Error(`Sightengine error: ${response.data.error?.message || 'Unknown error'}`);
    }

    return response.data;
  } catch (err: any) {
    // Log the actual Sightengine error response body
    if (err.response?.data) {
      logger.error('Sightengine API error body', err.response.data);
      throw new Error(`Sightengine: ${err.response.data?.error?.message || JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
}

router.post('/', upload.single('image'), async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file provided', code: 'NO_FILE' });
    return;
  }

  const startTime = Date.now();
  let publicId = '';

  try {
    logger.info('Starting upload', { filename: req.file.originalname, size: req.file.size });

    // Upload to Cloudinary
    const { secure_url, public_id } = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    publicId = public_id;
    logger.info('Cloudinary upload complete', { public_id });

    // Analyze with Sightengine
    const analysis = await analyzeWithSightengine(secure_url);
    logger.info('Sightengine analysis complete', { analysis });

    const aiScore = analysis.type?.ai_generated ?? 0;
    const deepfakeScore = analysis.media?.deepfake ?? 0;
    const faceCount = analysis.faces?.length ?? 0;
    const verdict = mapVerdict(aiScore);
    const scanTime = Date.now() - startTime;

    const scan = await Scan.create({
      imageUrl: secure_url,
      publicId: public_id,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      verdict,
      confidence_ai: aiScore,
      confidence_real: 1 - aiScore,
      is_deepfake: deepfakeScore > 0.5,
      deepfake_score: deepfakeScore,
      face_count: faceCount,
      scan_time_ms: scanTime,
    });

    logger.info('Scan saved', { id: scan._id, verdict });

    res.json({
      id: scan._id,
      imageUrl: secure_url,
      verdict,
      confidence_ai: aiScore,
      confidence_real: 1 - aiScore,
      is_deepfake: deepfakeScore > 0.5,
      deepfake_score: deepfakeScore,
      face_count: faceCount,
      scan_time_ms: scanTime,
      createdAt: scan.createdAt,
    });
  } catch (err) {
    // Cleanup Cloudinary on failure
    if (publicId) {
      cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    next(err);
  }
});

export default router;