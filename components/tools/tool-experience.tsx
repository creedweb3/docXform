import Link from 'next/link';
import clsx from 'clsx';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  File01Icon,
  FlashIcon,
  Shield01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { FaqDetailsCard } from '@/components/faq-details-card';
import { AdSlot } from '@/components/ad-slot';
import { Card } from '@/components/site/ui/card';
import { Eyebrow } from '@/components/site/ui/eyebrow';
import {
  ToolLandingSection,
  ToolLandingStat,
  ToolLandingStatGrid,
} from '@/components/site/tool-landing';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import type { ToolDefinition } from '@/lib/tools';
import { TONE_STYLES } from '@/components/tools/tone-styles';
import { getFormatTone } from '@/components/tools/tool-theme';

type ToolExperienceProps = {
  tool: ToolDefinition;
  workspace?: React.ReactNode;
};

function buildInfoSections(tool: ToolDefinition) {
  const articleClause = tool.howToSteps[0]
    ? tool.howToSteps[0]
        .replace(/^Open the?\s+/i, 'Open ')
        .replace(/\.$/, '')
    : `Open ${tool.name}`;

  return [
    {
      title: 'How it works',
      text: `${articleClause}, then run the tool. Everything happens in your browser with WebAssembly or optimized client-side code, so files never leave your device.`,
    },
    {
      title: 'Supported files',
      text: `${tool.name} accepts the formats listed on this page. Each file must be ${MAX_CONVERSION_FILE_SIZE_LABEL} or smaller.`,
    },
    {
      title: 'Privacy',
      text: `The ${tool.name.toLowerCase()} process does not upload your files to docXform servers. Nothing is stored on our side at any point.`,
    },
    {
      title: 'What you get',
      text: tool.features.length
        ? `${tool.features.join(' · ')}.`
        : 'Clean output you can preview and download from the browser session.',
    },
  ];
}

const SHARED_LEARN_LINKS = [
  { href: '/tools', label: 'Browse all tools' },
  { href: '/articles/formatting-guide', label: 'Formatting guide' },
  { href: '/faq', label: 'Read all FAQs' },
];

const linkColor =
  'text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors';

export function ToolExperience({ tool, workspace }: ToolExperienceProps) {
  const tone = TONE_STYLES[getFormatTone(tool.format)];
  const infoSections = buildInfoSections(tool);

  return (
    <div className={clsx('w-full mx-auto pt-4', tool.experienceMaxWidthClass ?? 'max-w-4xl')}>
      <header className="mb-8 text-center max-md:mb-5">
        <Eyebrow className="mx-auto w-fit">
          No file upload · up to {MAX_CONVERSION_FILE_SIZE_LABEL} · free
        </Eyebrow>
        <h1 className="mt-4 font-display text-[1.75rem] sm:text-[2.25rem] font-semibold tracking-[-0.03em] text-foreground leading-[1.1] max-md:text-2xl">
          {tool.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {tool.description}
        </p>
      </header>

      {workspace}

      <ToolLandingStatGrid>
        <ToolLandingStat
          icon={<HugeiconsIcon icon={Shield01Icon} size={20} strokeWidth={2} />}
          title="Private by design"
          subtitle="No file upload"
        />
        <ToolLandingStat
          icon={<HugeiconsIcon icon={FlashIcon} size={20} strokeWidth={2} />}
          title="Browser based"
          subtitle="Runs locally"
        />
        <ToolLandingStat
          icon={<HugeiconsIcon icon={SparklesIcon} size={20} strokeWidth={2} />}
          title="Clean output"
          subtitle="Ready to share"
        />
      </ToolLandingStatGrid>

      <ToolLandingSection title={`${tool.name} details`}>
        <div className="grid sm:grid-cols-2 gap-3">
          {infoSections.map((section) => (
            <Card key={section.title}>
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${tone.iconBox}`}
              >
                <HugeiconsIcon
                  icon={File01Icon}
                  size={18}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{section.text}</p>
            </Card>
          ))}
        </div>
      </ToolLandingSection>

      <ToolLandingSection title="Common questions">
        <div className="space-y-2 max-w-2xl mx-auto">
          {tool.faqs.map((faq, index) => (
            <FaqDetailsCard
              key={faq.q}
              question={faq.q}
              answer={faq.a}
              defaultOpen={index === 0}
              showExpander={false}
            />
          ))}
        </div>
      </ToolLandingSection>

      <Card padding="lg" className="mt-12 text-center">
        <HugeiconsIcon
          icon={BookOpen01Icon}
          size={22}
          strokeWidth={1.5}
          className="mx-auto mb-3 text-muted-foreground"
        />
        <h2 className="text-base font-semibold text-foreground mb-3">
          Learn more about private document workflows
        </h2>
        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
          {SHARED_LEARN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkColor}>
              {link.label}
            </Link>
          ))}
        </div>
      </Card>

      <AdSlot variant="content" visibleClassName="mt-8" />
    </div>
  );
}
