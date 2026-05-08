import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { UploadState, ScanResult } from '../types';
import { uploadImage, api as _ } from '../utils/api';
import { resizeImage } from '../utils/verdict';

type Action =
  | { type: 'SET_FILE'; file: File; preview: string }
  | { type: 'SET_PROGRESS'; progress: number }
  | { type: 'SET_ANALYZING' }
  | { type: 'SET_RESULT'; result: ScanResult }
  | { type: 'SET_ERROR'; message: string; code?: string }
  | { type: 'RESET' };

function reducer(_state: UploadState, action: Action): UploadState {
  switch (action.type) {
    case 'SET_FILE':
      return { stage: 'selecting', file: action.file, preview: action.preview };
    case 'SET_PROGRESS':
      if (_state.stage === 'selecting' || _state.stage === 'uploading') {
        return { stage: 'uploading', progress: action.progress, file: (_state as any).file, preview: (_state as any).preview };
      }
      return _state;
    case 'SET_ANALYZING':
      if (_state.stage === 'uploading') {
        return { stage: 'analyzing', file: _state.file, preview: _state.preview };
      }
      return _state;
    case 'SET_RESULT':
      return { stage: 'done', result: action.result };
    case 'SET_ERROR':
      return { stage: 'error', message: action.message, code: action.code };
    case 'RESET':
      return { stage: 'idle' };
    default:
      return _state;
  }
}

interface UploadContextValue {
  state: UploadState;
  selectFile: (file: File) => void;
  submitUpload: () => Promise<void>;
  reset: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { stage: 'idle' });

  const selectFile = useCallback((file: File) => {
    const preview = URL.createObjectURL(file);
    dispatch({ type: 'SET_FILE', file, preview });
  }, []);

  const submitUpload = useCallback(async () => {
    if (state.stage !== 'selecting' && state.stage !== 'uploading') return;
    const { file } = state as any;

    try {
      dispatch({ type: 'SET_PROGRESS', progress: 0 });

      const resized = await resizeImage(file, 1200);

      const result = await uploadImage(resized, (pct) => {
        const mapped = Math.round(pct * 0.5); // 0–50% upload phase
        dispatch({ type: 'SET_PROGRESS', progress: mapped });
        if (pct === 100) {
          setTimeout(() => dispatch({ type: 'SET_ANALYZING' }), 200);
        }
      });

      dispatch({ type: 'SET_RESULT', result });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', message: err.message || 'Upload failed', code: err.code });
    }
  }, [state]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <UploadContext.Provider value={{ state, selectFile, submitUpload, reset }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error('useUpload must be used within UploadProvider');
  return ctx;
}
