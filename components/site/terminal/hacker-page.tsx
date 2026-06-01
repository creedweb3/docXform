import { CreativeReveal } from '@/components/creative/CreativeReveal';
import { Container } from '@/components/site/ui/container';
import {
  HackerTerminal,
  type HackerTab,
  type TerminalMode,
  type TerminalPresentation,
} from '@/components/site/terminal/hacker-terminal';
import { TermCmd, TermComment, TermOut } from '@/components/site/terminal/hacker-primitives';
import { cn } from '@/lib/utils';

type HackerPageProps = {
  path: string;
  title: string;
  description?: string;
  /** Shell mode only — fake prompt command. */
  command?: string;
  children?: React.ReactNode;
  tabs?: HackerTab[];
  defaultTabId?: string;
  status?: string[];
  mode?: TerminalMode;
  /** `page` = normal site copy in terminal frame. `shell` = prompt/log aesthetic. */
  presentation?: TerminalPresentation;
  className?: string;
  footer?: React.ReactNode;
};

export function HackerPage({
  path,
  title,
  description,
  command,
  children,
  tabs,
  defaultTabId,
  status,
  mode = 'content',
  presentation = 'page',
  className,
  footer,
}: HackerPageProps) {
  const header =
    presentation === 'shell' ? (
      <>
        {command ? <TermCmd>{command}</TermCmd> : null}
        <TermOut tone="copper" className="text-sm sm:text-[15px]">
          {title}
        </TermOut>
        {description ? <TermComment>{description}</TermComment> : null}
      </>
    ) : (
      <>
        <h1 className="font-display text-2xl text-foreground sm:text-3xl text-balance">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </>
    );

  return (
    <>
      <section className={cn('border-b border-border/60 pt-16 pb-12 sm:pt-20 sm:pb-14', className)}>
        <Container size="lg">
          <CreativeReveal>
            <HackerTerminal
              path={path}
              header={header}
              tabs={tabs}
              defaultTabId={defaultTabId}
              status={status}
              mode={mode}
              presentation={presentation}
            >
              {children}
            </HackerTerminal>
          </CreativeReveal>
        </Container>
      </section>
      {footer}
    </>
  );
}

export function HackerPageBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('pb-20 sm:pb-24', className)}>
      <Container size="lg" className="w-full">
        <CreativeReveal delay={0.06}>{children}</CreativeReveal>
      </Container>
    </section>
  );
}
