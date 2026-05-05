import { JsonLd } from '@/components/json-ld';
import { faqPageJsonLd, schemaGraph } from '@/lib/seo';
import { SITE_FAQS, type SiteFaq } from '@/lib/site-faqs';

interface FAQSchemaProps {
  faqs?: SiteFaq[];
  path?: string;
}

export function FAQSchema({ faqs = SITE_FAQS, path = '/faq' }: FAQSchemaProps) {
  return <JsonLd id="faq-schema" data={schemaGraph([faqPageJsonLd(faqs, path)])} />;
}
