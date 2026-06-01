'use client';

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
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

const INTRO_STORAGE_KEY = 'docxform-premium-intro-v1';
const CURSOR_SPRING = { stiffness: 420, damping: 38, mass: 0.35 };
const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
const INTRO_EXIT_EASE = [0.76, 0, 0.24, 1] as const;

type PremiumLayoutProps = {
  children: ReactNode;
  className?: string;
  /** Cinematic intro on first visit per browser session. */
  enableIntro?: boolean;
  introTitle?: string;
  introSubtitle?: string;
};

type PremiumMotionContextValue = {
  reducedMotion: boolean;
  pointerFine: boolean;
};

const PremiumMotionContext = createContext<PremiumMotionContextValue>({
  reducedMotion: false,
  pointerFine: false,
});

export function usePremiumMotion() {
  return useContext(PremiumMotionContext);
}

function usePointerFine() {
  const [pointerFine, setPointerFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const update = () => setPointerFine(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return pointerFine;
}

function isInteractiveTarget(node: EventTarget | null) {
  if (!(node instanceof Element)) return false;
  return Boolean(
    node.closest(
      'a, button, [role="button"], input, textarea, select, label, summary, .interactive-trigger, [data-interactive]'
    )
  );
}

function LiquidCursor({
  x,
  y,
  scale,
  blend,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  blend: MotionValue<number>;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[10002] mix-blend-difference"
      style={{ x, y, scale, opacity: blend }}
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40 bg-white will-change-transform"
        style={{ width: 12, height: 12 }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20 will-change-transform"
        style={{ width: 40, height: 40 }}
      />
    </motion.div>
  );
}

function AmbientGlow({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  const background = useMotionTemplate`radial-gradient(720px circle at ${x}px ${y}px, hsl(26 72% 48% / 0.14), transparent 62%)`;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] will-change-[background]"
      style={{ background }}
    />
  );
}

function FilmGrain() {
  return <div className="premium-grain" aria-hidden />;
}

function CinematicIntro({
  active,
  title,
  subtitle,
  onComplete,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onComplete: () => void;
}) {
  return (
    <AnimatePresence onExitComplete={onComplete}>
      {active ? (
        <motion.div
          key="premium-intro"
          className="fixed inset-0 z-[10003] flex items-center justify-center overflow-hidden bg-background"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 1.15, ease: INTRO_EXIT_EASE }}
        >
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,hsl(26_72%_48%/0.14),transparent)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.08 }}
          />
          <div className="relative z-[1] px-6 text-center">
            <motion.p
              className="label-mono mb-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: REVEAL_EASE }}
            >
              {subtitle}
            </motion.p>
            <motion.h1
              className="kinetic-display mx-auto max-w-lg"
              initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.85, delay: 0.24, ease: REVEAL_EASE }}
            >
              {title}
            </motion.h1>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function PremiumReveal({
  children,
  className,
  delay = 0,
  y = 56,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(reducedMotion === true);

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-6% 0px -6% 0px', threshold: 0.12 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.95, delay, ease: REVEAL_EASE }}
    >
      {children}
    </motion.div>
  );
}

export default function PremiumLayout({
  children,
  className,
  enableIntro = true,
  introTitle = 'docXform',
  introSubtitle = 'Imprint · local instruments',
}: PremiumLayoutProps) {
  const reducedMotion = useReducedMotion();
  const pointerFine = usePointerFine();
  const [introActive, setIntroActive] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  const mouseX = useMotionValue(-200);
  const mouseY = useMotionValue(-200);
  const cursorX = useSpring(mouseX, CURSOR_SPRING);
  const cursorY = useSpring(mouseY, CURSOR_SPRING);
  const cursorScale = useSpring(1, { stiffness: 500, damping: 32 });
  const cursorBlend = useSpring(1, { stiffness: 400, damping: 30 });

  const { scrollYProgress } = useScroll();
  const contentScale = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.97, 0.94]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 32]);
  const contentRotateX = useTransform(scrollYProgress, [0, 1], [0, 2.5]);

  const handleIntroComplete = useCallback(() => {
    setContentReady(true);
    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (reducedMotion || !enableIntro) {
      setContentReady(true);
      return;
    }
    try {
      if (sessionStorage.getItem(INTRO_STORAGE_KEY)) {
        setContentReady(true);
        return;
      }
    } catch {
      setContentReady(true);
      return;
    }
    setIntroActive(true);
    const timer = window.setTimeout(() => setIntroActive(false), 1650);
    return () => window.clearTimeout(timer);
  }, [reducedMotion, enableIntro]);

  useEffect(() => {
    if (!pointerFine || reducedMotion) return;

    document.documentElement.classList.add('premium-cursor-active');

    const onMove = (event: MouseEvent) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    const onOver = (event: MouseEvent) => {
      const interactive = isInteractiveTarget(event.target);
      cursorScale.set(interactive ? 2.4 : 1);
      cursorBlend.set(interactive ? 0.85 : 1);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver, { passive: true });

    return () => {
      document.documentElement.classList.remove('premium-cursor-active');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, [pointerFine, reducedMotion, mouseX, mouseY, cursorScale, cursorBlend]);

  const showCursor = pointerFine && !reducedMotion && contentReady;

  return (
    <PremiumMotionContext.Provider
      value={{ reducedMotion: Boolean(reducedMotion), pointerFine }}
    >
      <div className={cn('premium-layout-root relative isolate min-h-screen', className)}>
        <FilmGrain />
        {!reducedMotion ? <AmbientGlow x={mouseX} y={mouseY} /> : null}
        {showCursor ? (
          <LiquidCursor x={cursorX} y={cursorY} scale={cursorScale} blend={cursorBlend} />
        ) : null}

        <CinematicIntro
          active={introActive}
          title={introTitle}
          subtitle={introSubtitle}
          onComplete={handleIntroComplete}
        />

        <div
          className="premium-perspective-host relative z-[2]"
          style={{ perspective: reducedMotion ? undefined : '1400px' }}
        >
          <motion.div
            className="premium-scroll-stage will-change-transform"
            style={
              reducedMotion
                ? undefined
                : {
                    scale: contentScale,
                    y: contentY,
                    rotateX: contentRotateX,
                    transformOrigin: '50% 0%',
                  }
            }
          >
            <motion.div
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: contentReady ? 1 : 0 }}
              transition={{ duration: 0.65, ease: REVEAL_EASE }}
            >
              {children}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PremiumMotionContext.Provider>
  );
}
