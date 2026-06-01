import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import {
  HackerPage,
  TermFrame,
  TermLink,
} from '@/components/site/console/console-ui';
import { SiteShell } from '@/components/site/site-shell';
import type { ToolDefinition } from '@/lib/tools';
import { Button } from '@/components/site/ui/button';

type ToolComingSoonProps = {
  tool: ToolDefinition;
};

export function ToolComingSoon({ tool }: ToolComingSoonProps) {
  const path = `/tools/${tool.slug}`;

  return (
    <SiteShell>
      <HackerPage
        path={path}
        title={tool.name}
        description={`${tool.description} · Coming soon.`}
        mode="product"
      >
        <TermFrame label="status">
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <p className="inline-flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:justify-start">
              <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={2} aria-hidden />
              Coming soon
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              We&apos;re finishing the workspace and polish. Browse other tools on the index, or try
              PDF Split which is available now.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground transition-colors hover:border-[hsl(var(--brand-copper)/0.35)]"
              >
                <HugeiconsIcon icon={ArrowLeft02Icon} size={14} strokeWidth={2} aria-hidden />
                All tools
              </Link>
              <Button href="/tools/pdf-split" variant="primary" size="sm">
                Try PDF Split
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
              <TermLink href="/tools">Tools index</TermLink>
              <TermLink href="/faq">FAQ</TermLink>
            </div>
          </div>
        </TermFrame>
      </HackerPage>
    </SiteShell>
  );
}
