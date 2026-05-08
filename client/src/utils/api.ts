import axios from 'axios';
import { ScanResult, HistoryResponse } from '../types';

const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: BASE,
  timeout: 60000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Network error';
    const code = err.response?.data?.code || 'NETWORK_ERROR';
    return Promise.reject({ message, code, status: err.response?.status });
  }
);

export async function uploadImage(
  file: File,
  onProgress: (pct: number) => void
): Promise<ScanResult> {
  const form = new FormData();
  form.append('image', file);

  const { data } = await api.post<ScanResult>('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
}

export async function getHistory(page = 1, limit = 10): Promise<HistoryResponse> {
  const { data } = await api.get<HistoryResponse>('/history', { params: { page, limit } });
  return data;
}

export async function deleteScan(id: string): Promise<void> {
  await api.delete(`/history/${id}`);
}

export async function clearHistory(): Promise<void> {
  await api.delete('/history');
}
