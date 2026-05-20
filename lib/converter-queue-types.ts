import type { ConvertedDocument } from '@/lib/client-document-converter';

type QueueStatus = 'queued' | 'converting' | 'converted' | 'failed';

export interface QueuedFile {
  id: string;
  file: File;
  status: QueueStatus;
  progress: number;
  message?: string;
  error?: string;
  output?: ConvertedDocument;
}
