import { CreativeReveal } from '@/components/creative/CreativeReveal';

import { Container } from '@/components/site/ui/container';

import { ZoneSeparator } from '@/components/site/ui/zone-separator';

import {

  HackerTerminal,

  type HackerTab,

  type TerminalMode,

  type TerminalPresentation,

} from '@/components/site/terminal/hacker-terminal';

import { TermCmd, TermComment, TermOut } from '@/components/site/terminal/hacker-primitives';

import { ZONE_GAP_AFTER, ZONE_GAP_BEFORE, ZONE_NAV_TOP } from '@/lib/marketing-layout';

import { cn } from '@/lib/utils';



type HackerPageProps = {

  path: string;

  title: string;

  description?: string;

  command?: string;

  children?: React.ReactNode;

  tabs?: HackerTab[];

  defaultTabId?: string;

  status?: string[];

  mode?: TerminalMode;

  presentation?: TerminalPresentation;

  className?: string;

  footer?: React.ReactNode;

  /** When a {@link HackerPageBody} (or similar) follows — adds rule + half gap below hero. */

  separatorAfter?: boolean;

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

  separatorAfter = false,

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

          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px] sm:leading-relaxed">

            {description}

          </p>

        ) : null}

      </>

    );



  return (

    <>

      <section

        className={cn(ZONE_NAV_TOP, ZONE_GAP_AFTER, className)}

        data-marketing-zone="hero"

      >

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

      {separatorAfter ? <ZoneSeparator /> : null}

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

    <section

      className={cn(ZONE_GAP_BEFORE, ZONE_GAP_AFTER, className)}

      data-marketing-zone="body"

    >

      <Container size="lg" className="w-full">

        <CreativeReveal delay={0.06}>{children}</CreativeReveal>

      </Container>

    </section>

  );

}

