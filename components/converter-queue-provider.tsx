'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { ConversionMode } from '@/lib/client-file-validation';
import type { QueuedFile } from '@/lib/converter-queue-types';

type QueuesState = Record<ConversionMode, QueuedFile[]>;

const initialQueues: QueuesState = {
  'word-to-pdf': [],
  'pdf-to-word': [],
  'pptx-to-pdf': [],
  'docx-to-pptx': [],
};

type Store = {
  queues: QueuesState;
  setQueueItems: (mode: ConversionMode, updater: SetStateAction<QueuedFile[]>) => void;
};

const ConverterQueueContext = createContext<Store | null>(null);

export function ConverterQueueProvider({ children }: { children: ReactNode }) {
  const [queues, setQueues] = useState<QueuesState>(initialQueues);

  const setQueueItems = useCallback((mode: ConversionMode, updater: SetStateAction<QueuedFile[]>) => {
    setQueues((prev) => ({
      ...prev,
      [mode]:
        typeof updater === 'function'
          ? (updater as (current: QueuedFile[]) => QueuedFile[])(prev[mode])
          : updater,
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      queues,
      setQueueItems,
    }),
    [queues, setQueueItems]
  );

  return (
    <ConverterQueueContext.Provider value={value}>{children}</ConverterQueueContext.Provider>
  );
}

export function useConverterQueue(
  mode: ConversionMode
): [QueuedFile[], Dispatch<SetStateAction<QueuedFile[]>>] {
  const ctx = useContext(ConverterQueueContext);
  if (!ctx) {
    throw new Error('useConverterQueue must be used within ConverterQueueProvider');
  }

  const setItems = useCallback(
    (updater: SetStateAction<QueuedFile[]>) => {
      ctx.setQueueItems(mode, updater);
    },
    [ctx, mode]
  );

  return [ctx.queues[mode], setItems];
}
