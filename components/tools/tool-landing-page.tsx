import {
  HackerPage,
  HackerPageBody,
  TermFrame,
  TermKeyGroup,
  TermKeyRow,
  TermLink,
  TermModule,
  TermSection,
  TermSectionStack,
} from '@/components/site/console/console-ui';
import { SiteShell } from '@/components/site/site-shell';
import { FaqDetailsCard } from '@/components/faq-details-card';
import { AdSlot } from '@/components/ad-slot';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import type { ToolDefinition } from '@/lib/tools';
import { TERM_LIST_STACK, TERM_MODULE_GRID } from '@/lib/site-design';

const TRUST_SIGNALS = [
  { key: 'uploads', value: 'No file upload', status: 'ok' as const },
  { key: 'runtime', value: 'Browser WASM', status: 'ok' as const },
  { key: 'output', value: 'Download when ready', status: 'ok' as const },
];

const LEARN_LINKS = [
  { href: '/tools', label: 'Browse all tools' },
  { href: '/articles/formatting-guide', label: 'Formatting guide' },
  { href: '/faq', label: 'Read all FAQs' },
];

function buildInfoSections(tool: ToolDefinition) {
  const articleClause = tool.howToSteps[0]
    ? tool.howToSteps[0]
        .replace(/^Open the?\s+/i, 'Open ')
        .replace(/\.$/, '')
    : `Open ${tool.name}`;

  return [
    {
      title: 'How it works',
      text: `${articleClause}, then run the tool. Processing stays in your browser with WebAssembly or optimized client-side code.`,
    },
    {
      title: 'Supported files',
      text: `${tool.name} accepts the formats listed on this page. Each file must be ${MAX_CONVERSION_FILE_SIZE_LABEL} or smaller.`,
    },
    {
      title: 'Privacy',
      text: `The ${tool.name.toLowerCase()} flow does not upload your files to docXform servers.`,
    },
    {
      title: 'What you get',
      text: tool.features.length
        ? `${tool.features.join(' · ')}.`
        : 'Output you can preview and download from the browser session.',
    },
  ];
}

type ToolLandingPageProps = {
  tool: ToolDefinition;
  workspace: React.ReactNode;
};

export function ToolLandingPage({ tool, workspace }: ToolLandingPageProps) {
  const path = `/tools/${tool.slug}`;
  const pageDescription = `${tool.description} · up to ${MAX_CONVERSION_FILE_SIZE_LABEL} · free.`;
  const infoSections = buildInfoSections(tool);

  return (
    <SiteShell>
      <HackerPage
        path={path}
        title={tool.name}
        description={pageDescription}
        mode="product"
        separatorAfter
        className="[&_.container]:max-w-[80rem]"
      >
        <TermFrame label="workspace" className="border-0 bg-transparent p-0 sm:p-0">
          {workspace}
        </TermFrame>
        <TermKeyGroup data-trust-signals className="term-trust-signals">
          {TRUST_SIGNALS.map((signal) => (
            <TermKeyRow
              key={signal.key}
              keyName={signal.key}
              value={signal.value}
              status={signal.status}
            />
          ))}
        </TermKeyGroup>
      </HackerPage>

      <HackerPageBody className="[&_.container]:max-w-[80rem]">
        <TermSectionStack>
          <TermSection path="details" hint={`${tool.name} reference`}>
            <div className={TERM_MODULE_GRID}>
              {infoSections.map((section, index) => (
                <TermModule
                  key={section.title}
                  id={String(index + 1).padStart(2, '0')}
                  title={section.title}
                  detail={section.text}
                />
              ))}
            </div>
          </TermSection>

          <TermSection path="faq" hint="Common questions">
            <div className={TERM_LIST_STACK}>
              {tool.faqs.map((faq, index) => (
                <FaqDetailsCard
                  key={faq.q}
                  question={faq.q}
                  answer={faq.a}
                  defaultOpen={index === 0}
                  variant="terminal"
                />
              ))}
            </div>
          </TermSection>

          <TermSection path="read-more" hint="Learn more">
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {LEARN_LINKS.map((link) => (
                <TermLink key={link.href} href={link.href}>
                  {link.label}
                </TermLink>
              ))}
            </div>
          </TermSection>

          <AdSlot variant="content" />
        </TermSectionStack>
      </HackerPageBody>
    </SiteShell>
  );
}
