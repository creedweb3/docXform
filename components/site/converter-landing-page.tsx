import {
  HackerPageBody,
  TermKeyGroup,
  TermKeyRow,
  TermLink,
  TermModule,
  TermSection,
  TermSectionStack,
} from '@/components/site/console/console-ui';
import { ConversionProductShell } from '@/components/site/conversion-product-shell';
import { SiteShell } from '@/components/site/site-shell';
import { FaqDetailsCard } from '@/components/faq-details-card';
import { AdSlot } from '@/components/ad-slot';
import type { SiteFaq } from '@/lib/site-faqs';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import { TERM_LIST_STACK, TERM_MODULE_GRID } from '@/lib/site-design';

type InfoSection = { title: string; text: string };

type ConverterLandingPageProps = {
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  converter: React.ReactNode;
  infoSections: InfoSection[];
  faqs: SiteFaq[];
  learnTitle: string;
  learnLinks: { href: string; label: string }[];
};

const TRUST_SIGNALS = [
  { key: 'uploads', value: 'No file upload', status: 'ok' as const },
  { key: 'runtime', value: 'Browser WASM', status: 'ok' as const },
  { key: 'output', value: 'Download when ready', status: 'ok' as const },
];

export function ConverterLandingPage({
  path,
  eyebrow,
  title,
  description,
  converter,
  infoSections,
  faqs,
  learnTitle,
  learnLinks,
}: ConverterLandingPageProps) {
  const pageDescription = `${eyebrow} · up to ${MAX_CONVERSION_FILE_SIZE_LABEL} · free. ${description}`;

  return (
    <SiteShell>
      <ConversionProductShell
        productTitle={title}
        productPath={path}
        pageTitle={title}
        pageDescription={pageDescription}
        trustSignals={
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
        }
        workspace={converter}
        marketing={
          <HackerPageBody>
            <TermSectionStack>
              <TermSection path="how-it-works" hint="What happens on this page">
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
                  {faqs.map((faq, index) => (
                    <FaqDetailsCard
                      key={faq.question}
                      question={faq.question}
                      answer={faq.answer}
                      defaultOpen={index === 0}
                      variant="terminal"
                    />
                  ))}
                </div>
              </TermSection>

              <TermSection path="read-more" hint={learnTitle}>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {learnLinks.map((link) => (
                    <TermLink key={link.href} href={link.href}>
                      {link.label}
                    </TermLink>
                  ))}
                </div>
              </TermSection>

              <AdSlot variant="content" />
            </TermSectionStack>
          </HackerPageBody>
        }
      />
    </SiteShell>
  );
}
