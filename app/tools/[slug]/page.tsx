import { notFound } from 'next/navigation';
import { createPageMetadata, breadcrumbJsonLd, webPageJsonLd, softwareApplicationJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { getToolBySlug, type ToolDefinition } from '@/lib/tools';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { ToolExperienceClient } from '@/components/tools/tool-experience-client';

type ToolPageProps = { params: { slug: string } };

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateMetadata({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};

  return createPageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/tools/${tool.slug}`,
    keywords: tool.keywords,
  });
}

function ToolSchemas({ tool }: { tool: ToolDefinition }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: tool.name,
    description: tool.metaDescription,
    step: tool.howToSteps.map((s, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: s,
    })),
  };

  return (
    <JsonLd
      id={`${tool.slug}-schema`}
      data={{
        faq: faqSchema,
        howto: howToSchema,
        software: softwareApplicationJsonLd({
          name: tool.name,
          description: tool.metaDescription,
          path: `/tools/${tool.slug}`,
          featureList: tool.features,
        }),
        webpage: webPageJsonLd({
          name: tool.metaTitle,
          description: tool.metaDescription,
          path: `/tools/${tool.slug}`,
          type: 'WebPage',
        }),
        breadcrumb: breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          { name: tool.name, path: `/tools/${tool.slug}` },
        ]),
      }}
    />
  );
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.slug);
  if (!tool) return notFound();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <ToolSchemas tool={tool} />
        <ToolExperienceClient tool={tool} />
      </main>
      <Footer />
    </div>
  );
}
