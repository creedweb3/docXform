'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isConverterSessionReady, warmConverter } from '@/lib/client-document-converter';
import { cn } from '@/lib/utils';

type EngineState = 'idle' | 'loading' | 'ready' | 'error';

export function HomeWasmProof() {
  const [state, setState] = useState<EngineState>(() =>
    isConverterSessionReady() ? 'ready' : 'idle'
  );
  const [line, setLine] = useState('wasm · standby');

  useEffect(() => {
    if (isConverterSessionReady()) {
      setState('ready');
      setLine('wasm · ready');
      return;
    }

    let cancelled = false;
    setState('loading');
    setLine('wasm · fetching');

    warmConverter(({ message: progressMessage }) => {
      if (!cancelled && progressMessage) {
        const short = progressMessage.split(' ').slice(0, 4).join(' ').toLowerCase();
        setLine(`wasm · ${short}`);
      }
    })
      .then(() => {
        if (!cancelled) {
          setState('ready');
          setLine('wasm · ready');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState('error');
          setLine('wasm · blocked');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="sheet-inset px-3 py-2.5 font-mono text-[11px] leading-relaxed">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'inline-block h-1.5 w-1.5 rounded-full',
            state === 'ready' && 'bg-[hsl(var(--brand-sage))]',
            state === 'loading' && 'bg-[hsl(var(--brand-copper))] animate-pulse',
            state === 'error' && 'bg-amber-500/90',
            state === 'idle' && 'bg-muted-foreground/40'
          )}
          aria-hidden
        />
        <span className="text-foreground">{line}</span>
      </div>
      <Link
        href="/word-to-pdf"
        className="mt-2 inline-block text-[hsl(var(--brand-copper))] hover:text-foreground transition-colors"
      >
        run converter_
      </Link>
    </div>
  );
}
