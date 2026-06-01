import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import type { ToolDefinition } from '@/lib/tools';
import { getFormatTone } from '@/lib/format-tone';
import { ToolIcon } from '@/components/tools/tool-icon';
import { Card } from '@/components/site/ui/card';
import { Eyebrow } from '@/components/site/ui/eyebrow';
import { Button } from '@/components/site/ui/button';
import { WORKSPACE_SECONDARY_SURFACE } from '@/lib/site-design';

type ToolComingSoonProps = {
  tool: ToolDefinition;
};

export function ToolComingSoon({ tool }: ToolComingSoonProps) {
  return (
    <div className={`w-full mx-auto pt-4 ${tool.experienceMaxWidthClass ?? 'max-w-4xl'}`}>
      <header className="mb-8 text-center">
        <Eyebrow className="mx-auto w-fit gap-2">
          <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={2} className="text-muted-foreground" />
          Coming soon
        </Eyebrow>
        <div className="flex justify-center mt-5 mb-4">
          <ToolIcon pair={tool.iconPair} tone={getFormatTone(tool.format)} label={`${tool.name} icon`} />
        </div>
        <h1 className="font-display text-[1.75rem] sm:text-[2.25rem] font-semibold tracking-[-0.03em] text-foreground">
          {tool.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {tool.description}
        </p>
      </header>

      <Card padding="lg" className="mx-auto max-w-md text-center">
        <p className="text-base font-semibold text-foreground">This tool isn&apos;t open yet</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We&apos;re finishing the workspace and polish. Browse other tools on the index, or try PDF Split
          which is available now.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/tools"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${WORKSPACE_SECONDARY_SURFACE}`}
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} strokeWidth={2} />
            All tools
          </Link>
          <Button href="/tools/pdf-split" variant="primary" size="md">
            Try PDF Split
          </Button>
        </div>
      </Card>
    </div>
  );
}
