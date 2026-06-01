import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  File01Icon,
  FlashIcon,
  Shield01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import { SiteShell } from '@/components/site/site-shell';
import { Container } from '@/components/site/ui/container';
import { Card } from '@/components/site/ui/card';
import {
  ToolLandingHero,
  ToolLandingSection,
  ToolLandingStat,
  ToolLandingStatGrid,
} from '@/components/site/tool-landing';
import { FaqDetailsCard } from '@/components/faq-details-card';
import { AdSlot } from '@/components/ad-slot';
import type { SiteFaq } from '@/lib/site-faqs';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';

type InfoSection = { title: string; text: string };

type ConverterLandingPageProps = {
  accent: 'blue' | 'rose';
  eyebrow: string;
  title: string;
  description: string;
  converter: React.ReactNode;
  infoSections: InfoSection[];
  faqs: SiteFaq[];
  learnTitle: string;
  learnLinks: { href: string; label: string }[];
};

export function ConverterLandingPage({
  accent,
  eyebrow,
  title,
  description,
  converter,
  infoSections,
  faqs,
  learnTitle,
  learnLinks,
}: ConverterLandingPageProps) {
  const iconBox = accent === 'blue' ? 'icon-box-blue' : 'icon-box-rose';
  const linkColor = 'text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors';

  return (
    <SiteShell plain>
      <ToolLandingHero
        accent={accent}
        eyebrow={`${eyebrow} · up to ${MAX_CONVERSION_FILE_SIZE_LABEL} · free`}
        title={title}
        description={description}
      />
      <section className="pb-24">
        <Container size="lg">
          {converter}
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
              title="Quality output"
              subtitle="Review before sharing"
            />
          </ToolLandingStatGrid>

          <ToolLandingSection title="How it works">
            <div className="grid sm:grid-cols-2 gap-3">
              {infoSections.map((section) => (
                <Card key={section.title}>
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg border ${iconBox}`}
                  >
                    <HugeiconsIcon icon={File01Icon} size={18} strokeWidth={1.5} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{section.text}</p>
                </Card>
              ))}
            </div>
          </ToolLandingSection>

          <ToolLandingSection title="Common questions">
            <div className="space-y-2 max-w-2xl mx-auto">
              {faqs.map((faq, index) => (
                <FaqDetailsCard
                  key={faq.question}
                  question={faq.question}
                  answer={faq.answer}
                  defaultOpen={index === 0}
                  showExpander={false}
                />
              ))}
            </div>
          </ToolLandingSection>

          <Card padding="lg" className="mt-12 text-center">
            <HugeiconsIcon icon={BookOpen01Icon} size={22} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground mb-3">{learnTitle}</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
              {learnLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkColor}>
                  {link.label}
                </Link>
              ))}
            </div>
          </Card>

          <AdSlot variant="content" visibleClassName="mt-8" />
        </Container>
      </section>
    </SiteShell>
  );
}
