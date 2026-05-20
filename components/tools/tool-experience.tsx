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

export function ToolExperience({ tool, workspace }: ToolExperienceProps) {
  const tone = TONE_STYLES[getFormatTone(tool.format)];
  const infoSections = buildInfoSections(tool);
  const featureCards = [
    {
      icon: Shield01Icon,
      iconClass: tone.iconTextSubtle,
      title: 'Private by design',
      subtitle: 'No file upload',
    },
    {
      icon: FlashIcon,
      iconClass: tone.pillIcon,
      title: 'Browser based',
      subtitle: 'Runs locally',
    },
    {
      icon: SparklesIcon,
      iconClass: tone.iconTextSubtle,
      title: 'Clean output',
      subtitle: 'Ready to share',
    },
  ];

  return (
    <div className={clsx('w-full mx-auto pt-4', tool.experienceMaxWidthClass ?? 'max-w-4xl')}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 mb-6 border border-white/5">
          <HugeiconsIcon icon={Shield01Icon} size={14} strokeWidth={2} className={tone.pillIcon} />
          <span className="text-xs font-medium text-muted-foreground">
            No file upload &middot; up to {MAX_CONVERSION_FILE_SIZE_LABEL} &middot; free to use
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          <span className={`bg-gradient-to-br bg-clip-text text-transparent ${tone.gradientText}`}>
            {tool.name}
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </div>

      {workspace}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        {featureCards.map((card) => (
          <div key={card.title} className="glass-subtle rounded-xl p-5 text-center">
            <HugeiconsIcon
              icon={card.icon}
              size={20}
              strokeWidth={2}
              className={`${card.iconClass} mx-auto mb-2.5`}
            />
            <p className="text-sm font-medium text-foreground">{card.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-6">
          {tool.name} details
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {infoSections.map((section) => (
            <div key={section.title} className="glass-subtle rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${tone.iconBox} flex items-center justify-center mb-4`}>
                <HugeiconsIcon icon={File01Icon} size={18} strokeWidth={1.5} className={tone.iconText} />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{section.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-6">
          Common questions
        </h2>
        <div className="space-y-3">
          {tool.faqs.map((faq, index) => (
            <FaqDetailsCard
              key={faq.q}
              question={faq.q}
              answer={faq.a}
              defaultOpen={index === 0}
              variant="glass-subtle"
              showExpander={false}
            />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl bg-white/55 border border-border/50 p-6 text-center">
        <HugeiconsIcon
          icon={BookOpen01Icon}
          size={22}
          strokeWidth={1.5}
          className={`${tone.iconText} mx-auto mb-3`}
        />
        <h2 className="text-base font-semibold text-foreground mb-2">
          Learn more about private document workflows
        </h2>
        <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
          {SHARED_LEARN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={tone.linkText}>
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      <AdSlot variant="content" visibleClassName="mt-8" />
    </div>
  );
}
