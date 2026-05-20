import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import type { ToolDefinition } from '@/lib/tools';
import { TONE_STYLES } from '@/components/tools/tone-styles';
import { getFormatTone } from '@/lib/format-tone';
import { ToolIcon } from '@/components/tools/tool-icon';

type ToolComingSoonProps = {
  tool: ToolDefinition;
};

export function ToolComingSoon({ tool }: ToolComingSoonProps) {
  const tone = TONE_STYLES[getFormatTone(tool.format)];

  return (
    <div className={`w-full mx-auto pt-4 ${tool.experienceMaxWidthClass ?? 'max-w-4xl'}`}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 mb-6 border border-white/5">
          <HugeiconsIcon icon={Clock01Icon} size={14} strokeWidth={2} className={tone.pillIcon} />
          <span className="text-xs font-medium text-muted-foreground">Coming soon</span>
        </div>
        <div className="flex justify-center mb-5">
          <ToolIcon pair={tool.iconPair} tone={getFormatTone(tool.format)} label={`${tool.name} icon`} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          <span className={`bg-gradient-to-br bg-clip-text text-transparent ${tone.gradientText}`}>
            {tool.name}
          </span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">{tool.description}</p>
      </div>

      <div
        className={`mx-auto max-w-md rounded-2xl border p-8 text-center backdrop-blur-md ${tone.mainCard}`}
      >
        <p className="text-base font-semibold text-foreground">This tool isn&apos;t open yet</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We&apos;re finishing the workspace and polish. Browse other tools on the index, or try PDF Split
          which is available now.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={16} strokeWidth={2} />
            All tools
          </Link>
          <Link
            href="/tools/pdf-split"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm bg-gradient-to-br ${tone.primaryButton}`}
          >
            Try PDF Split
          </Link>
        </div>
      </div>
    </div>
  );
}
