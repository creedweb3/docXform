'use client';

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from 'framer-motion';
import { PrecisionCursor } from '@/components/creative/PrecisionCursor';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

const BOOT_STORAGE_KEY = 'docxform-creative-boot-v4';
const MASK_EXIT_EASE = [0.85, 0, 0.15, 1] as const;
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const GLOW_SPRING = { stiffness: 120, damping: 40, mass: 0.8 };

type CreativeEngineContextValue = {
  pointerFine: boolean;
  reducedMotion: boolean;
  mouseX: number;
  mouseY: number;
};

const CreativeEngineContext = createContext<CreativeEngineContextValue>({
  pointerFine: false,
  reducedMotion: false,
  mouseX: 0,
  mouseY: 0,
});

export function useCreativeEngine() {
  return useContext(CreativeEngineContext);
}

export type CreativeBootMode = 'full' | 'once' | 'off';

export type CreativeLayoutMode = 'flow' | 'canvas';

type CreativeEngineProps = {
  children: ReactNode;
  bootWord?: string;
  className?: string;
  bootMode?: CreativeBootMode;
  /** flow = normal document scroll (no clip); canvas = locked viewport deck */
  layoutMode?: CreativeLayoutMode;
};

function resolveInteractiveLabel(element: Element | null): { active: boolean; label: string } {
  if (!element) {
    return { active: false, label: '' };
  }

  const tagged = element.closest('[data-interactive-mode]');
  if (tagged instanceof HTMLElement) {
    const label = (tagged.getAttribute('data-cursor-label') ?? 'OPEN').toUpperCase();
    return { active: true, label };
  }

  if (element.closest('a, button, [role="button"], input, textarea, select, summary, .interactive-trigger')) {
    return { active: true, label: 'OPEN' };
  }

  return { active: false, label: '' };
}

function CinematicBoot({
  active,
  word,
  onDismiss,
  onComplete,
}: {
  active: boolean;
  word: string;
  onDismiss: () => void;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [tracking, setTracking] = useState('0.12em');

  useEffect(() => {
    if (!active) {
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 2200;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.min(100, Math.floor(eased * 100)));
      setTracking(`${(0.12 + eased * 0.32).toFixed(3)}em`);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        window.setTimeout(() => onDismiss(), 180);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, onDismiss]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {active ? (
        <motion.div
          key="creative-boot"
          className="fixed inset-0 z-[20000] flex items-center justify-center bg-background"
          exit={{ y: '-100%' }}
          transition={{ duration: 1.05, ease: MASK_EXIT_EASE }}
        >
          <div className="flex w-full max-w-4xl flex-col gap-5 px-6">
            <div className="flex items-end justify-between gap-6">
              <span className="font-mono text-5xl tabular-nums text-foreground sm:text-6xl">
                {String(progress).padStart(2, '0')}%
              </span>
              <span
                className="font-display text-2xl font-semibold uppercase text-muted-foreground sm:text-4xl"
                style={{ letterSpacing: tracking }}
              >
                {word}
              </span>
            </div>
            <div className="h-px bg-border">
              <motion.div
                className="h-full origin-left bg-[hsl(var(--brand-copper))]"
                style={{ scaleX: progress / 100 }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MouseGlow({
  x,
  y,
  enabled,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  enabled: boolean;
}) {
  const background = useMotionTemplate`radial-gradient(560px circle at ${x}px ${y}px, hsl(26 72% 48% / 0.11), transparent 70%)`;

  if (!enabled) {
    return null;
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[0]"
      style={{ background }}
    />
  );
}

function MuseumOverlays() {
  return (
    <>
      <svg
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[90] h-full w-full opacity-[0.015]"
      >
        <filter id="creative-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#creative-noise)" />
      </svg>
    </>
  );
}

export default function CreativeEngine({
  children,
  bootWord = 'DOCXFORM',
  className,
  bootMode = 'once',
  layoutMode = 'flow',
}: CreativeEngineProps) {
  const reducedMotion = useReducedMotion();
  const [pointerFine, setPointerFine] = useState(false);
  const [booting, setBooting] = useState(false);
  const [ready, setReady] = useState(false);
  const [cursorHover, setCursorHover] = useState(false);
  const [cursorLabel, setCursorLabel] = useState('');

  const pointerRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotInnerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const dotRafRef = useRef<number>(0);
  const dotState = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const lastPointerRef = useRef({ x: 0, y: 0, t: 0 });
  const dotIdleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springGlowX = useSpring(glowX, GLOW_SPRING);
  const springGlowY = useSpring(glowY, GLOW_SPRING);
  const [mouseReport, setMouseReport] = useState({ x: 0, y: 0 });

  const paintDot = useCallback(() => {
    const el = dotInnerRef.current;
    if (!el) return;
    const { x, y } = dotState.current;
    el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0)`;
  }, []);

  const tickDot = useCallback(() => {
    const s = dotState.current;
    const ease = 0.28;
    s.x += (s.tx - s.x) * ease;
    s.y += (s.ty - s.y) * ease;
    paintDot();

    const settling =
      Math.hypot(s.tx - s.x, s.ty - s.y) > 0.08 || Math.hypot(s.x, s.y) > 0.08;
    if (settling) {
      dotRafRef.current = requestAnimationFrame(tickDot);
    } else {
      s.x = s.tx;
      s.y = s.ty;
      paintDot();
      dotRafRef.current = 0;
    }
  }, [paintDot]);

  const scheduleDotTick = useCallback(() => {
    if (!dotRafRef.current) {
      dotRafRef.current = requestAnimationFrame(tickDot);
    }
  }, [tickDot]);

  const completeBoot = useCallback(() => {
    setReady(true);
    try {
      sessionStorage.setItem(BOOT_STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const finishBoot = useCallback(() => {
    setBooting(false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const update = () => setPointerFine(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion || bootMode === 'off') {
      setReady(true);
      return;
    }
    if (bootMode === 'once') {
      try {
        if (sessionStorage.getItem(BOOT_STORAGE_KEY)) {
          setReady(true);
          return;
        }
      } catch {
        setReady(true);
        return;
      }
    }
    if (bootMode === 'full') {
      try {
        sessionStorage.removeItem(BOOT_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    setBooting(true);
  }, [reducedMotion, bootMode]);

  useEffect(() => {
    if (!pointerFine || reducedMotion) {
      document.documentElement.classList.remove('creative-cursor-active');
      return;
    }

    document.documentElement.classList.add('creative-cursor-active');

    const apply = () => {
      const { x, y } = pointerRef.current;
      glowX.set(x);
      glowY.set(y);
      setMouseReport({ x, y });
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      rafRef.current = 0;
    };

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      const last = lastPointerRef.current;
      const dt = last.t > 0 ? Math.max(now - last.t, 1) : 16;
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      lastPointerRef.current = { x: event.clientX, y: event.clientY, t: now };

      const vx = (dx / dt) * 1000;
      const vy = (dy / dt) * 1000;
      const mag = Math.hypot(vx, vy);
      const maxOffset = 10;
      if (mag > 40) {
        const amount = Math.min(mag / 120, maxOffset);
        dotState.current.tx = (vx / mag) * amount;
        dotState.current.ty = (vy / mag) * amount;
        scheduleDotTick();
      }

      if (dotIdleRef.current) {
        clearTimeout(dotIdleRef.current);
      }
      dotIdleRef.current = setTimeout(() => {
        dotState.current.tx = 0;
        dotState.current.ty = 0;
        scheduleDotTick();
      }, 100);

      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(apply);
      }
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const { active, label } = resolveInteractiveLabel(target);
      setCursorHover(active);
      setCursorLabel(label);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });

    return () => {
      document.documentElement.classList.remove('creative-cursor-active');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (dotIdleRef.current) {
        clearTimeout(dotIdleRef.current);
      }
      if (dotRafRef.current) {
        cancelAnimationFrame(dotRafRef.current);
      }
    };
  }, [pointerFine, reducedMotion, glowX, glowY, scheduleDotTick]);

  const showCursor = pointerFine && !reducedMotion && ready;

  const rootClass =
    layoutMode === 'canvas'
      ? 'creative-root fixed inset-0 h-[100dvh] w-screen overflow-hidden'
      : 'relative min-h-screen w-full overflow-x-hidden';

  return (
    <CreativeEngineContext.Provider
      value={{
        pointerFine,
        reducedMotion: Boolean(reducedMotion),
        mouseX: mouseReport.x,
        mouseY: mouseReport.y,
      }}
    >
      <div className={cn(rootClass, className)}>
        <MuseumOverlays />
        <MouseGlow x={springGlowX} y={springGlowY} enabled={!reducedMotion && ready} />
        <PrecisionCursor
          enabled={showCursor}
          cursorRef={cursorRef}
          dotInnerRef={dotInnerRef}
          hovering={cursorHover}
          label={cursorLabel}
        />
        <CinematicBoot active={booting} word={bootWord} onDismiss={finishBoot} onComplete={completeBoot} />

        <motion.div
          className={cn('relative', layoutMode === 'canvas' ? 'z-10 h-full w-full' : 'z-[1]')}
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 0.65, ease: REVEAL_EASE }}
        >
          {children}
        </motion.div>
      </div>
    </CreativeEngineContext.Provider>
  );
}
