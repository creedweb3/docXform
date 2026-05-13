import Link from 'next/link';
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

type ToolExperienceProps = {
  tool: ToolDefinition;
  workspace?: React.ReactNode;
};

type ToneStyle = {
  gradientText: string;
  pillIcon: string;
  iconBox: string;
  iconText: string;
  iconTextSubtle: string;
  linkText: string;
};

const TONE_STYLES: Record<ToolDefinition['tone'], ToneStyle> = {
  emerald: {
    gradientText: 'from-emerald-500 to-teal-400',
    pillIcon: 'text-emerald-500',
    iconBox: 'icon-box-emerald',
    iconText: 'text-emerald-500',
    iconTextSubtle: 'text-emerald-400',
    linkText: 'text-emerald-600 hover:text-emerald-700',
  },
  amber: {
    gradientText: 'from-amber-500 to-yellow-400',
    pillIcon: 'text-amber-500',
    iconBox: 'icon-box-amber',
    iconText: 'text-amber-500',
    iconTextSubtle: 'text-amber-400',
    linkText: 'text-amber-600 hover:text-amber-700',
  },
  teal: {
    gradientText: 'from-teal-500 to-cyan-400',
    pillIcon: 'text-teal-500',
    iconBox: 'icon-box-teal',
    iconText: 'text-teal-500',
    iconTextSubtle: 'text-teal-400',
    linkText: 'text-teal-600 hover:text-teal-700',
  },
  purple: {
    gradientText: 'from-purple-500 to-violet-400',
    pillIcon: 'text-purple-500',
    iconBox: 'icon-box-purple',
    iconText: 'text-purple-500',
    iconTextSubtle: 'text-purple-400',
    linkText: 'text-purple-600 hover:text-purple-700',
  },
  cyan: {
    gradientText: 'from-cyan-500 to-sky-400',
    pillIcon: 'text-cyan-500',
    iconBox: 'icon-box-cyan',
    iconText: 'text-cyan-500',
    iconTextSubtle: 'text-cyan-400',
    linkText: 'text-cyan-600 hover:text-cyan-700',
  },
  orange: {
    gradientText: 'from-orange-500 to-amber-400',
    pillIcon: 'text-orange-500',
    iconBox: 'icon-box-orange',
    iconText: 'text-orange-500',
    iconTextSubtle: 'text-orange-400',
    linkText: 'text-orange-600 hover:text-orange-700',
  },
  indigo: {
    gradientText: 'from-indigo-500 to-blue-400',
    pillIcon: 'text-indigo-500',
    iconBox: 'icon-box-indigo',
    iconText: 'text-indigo-500',
    iconTextSubtle: 'text-indigo-400',
    linkText: 'text-indigo-600 hover:text-indigo-700',
  },
  slate: {
    gradientText: 'from-slate-600 to-gray-400',
    pillIcon: 'text-slate-500',
    iconBox: 'icon-box-slate',
    iconText: 'text-slate-600',
    iconTextSubtle: 'text-slate-400',
    linkText: 'text-slate-700 hover:text-slate-900',
  },
  rose: {
    gradientText: 'from-rose-400 to-pink-400',
    pillIcon: 'text-rose-500',
    iconBox: 'icon-box-rose',
    iconText: 'text-rose-500',
    iconTextSubtle: 'text-rose-400',
    linkText: 'text-rose-600 hover:text-rose-700',
  },
  sky: {
    gradientText: 'from-sky-500 to-cyan-400',
    pillIcon: 'text-sky-500',
    iconBox: 'icon-box-sky',
    iconText: 'text-sky-500',
    iconTextSubtle: 'text-sky-400',
    linkText: 'text-sky-600 hover:text-sky-700',
  },
  violet: {
    gradientText: 'from-violet-500 to-purple-400',
    pillIcon: 'text-violet-500',
    iconBox: 'icon-box-violet',
    iconText: 'text-violet-500',
    iconTextSubtle: 'text-violet-400',
    linkText: 'text-violet-600 hover:text-violet-700',
  },
  lime: {
    gradientText: 'from-lime-500 to-green-400',
    pillIcon: 'text-lime-500',
    iconBox: 'icon-box-lime',
    iconText: 'text-lime-600',
    iconTextSubtle: 'text-lime-500',
    linkText: 'text-lime-600 hover:text-lime-700',
  },
  fuchsia: {
    gradientText: 'from-fuchsia-500 to-pink-400',
    pillIcon: 'text-fuchsia-500',
    iconBox: 'icon-box-fuchsia',
    iconText: 'text-fuchsia-500',
    iconTextSubtle: 'text-fuchsia-400',
    linkText: 'text-fuchsia-600 hover:text-fuchsia-700',
  },
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
  const tone = TONE_STYLES[tool.tone];
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
      iconClass: 'text-amber-500',
      title: 'Browser based',
      subtitle: 'Runs locally',
    },
    {
      icon: SparklesIcon,
      iconClass: 'text-emerald-500',
      title: 'Clean output',
      subtitle: 'Ready to share',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto pt-4">
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
