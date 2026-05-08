import mongoose, { Document, Schema } from 'mongoose';

export type Verdict = 'AI_GENERATED' | 'LIKELY_AI' | 'UNCERTAIN' | 'LIKELY_REAL' | 'REAL';

export interface IScan extends Document {
  imageUrl: string;
  publicId: string;
  originalName: string;
  fileSize: number;
  verdict: Verdict;
  confidence_ai: number;
  confidence_real: number;
  is_deepfake: boolean;
  deepfake_score: number;
  face_count: number;
  scan_time_ms: number;
  createdAt: Date;
}

const ScanSchema = new Schema<IScan>(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    verdict: {
      type: String,
      enum: ['AI_GENERATED', 'LIKELY_AI', 'UNCERTAIN', 'LIKELY_REAL', 'REAL'],
      required: true,
    },
    confidence_ai: { type: Number, required: true, min: 0, max: 1 },
    confidence_real: { type: Number, required: true, min: 0, max: 1 },
    is_deepfake: { type: Boolean, default: false },
    deepfake_score: { type: Number, default: 0 },
    face_count: { type: Number, default: 0 },
    scan_time_ms: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ScanSchema.index({ createdAt: -1 });

export const Scan = mongoose.model<IScan>('Scan', ScanSchema);
