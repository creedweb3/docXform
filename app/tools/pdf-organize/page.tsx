import { PdfOrganizeTool } from '@/components/tools/pdf-organize-tool';
import { getToolBySlug } from '@/lib/tools';
import { ToolExperience } from '@/components/tools/tool-experience';
import { breadcrumbJsonLd, createPageMetadata, softwareApplicationJsonLd, webPageJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const slug = 'pdf-organize';
const tool = getToolBySlug(slug);

export const metadata =
  tool &&
  createPageMetadata({
    title: tool.metaTitle,
    description: tool.metaDescription,
    path: `/tools/${slug}`,
    keywords: tool.keywords,
  });

export default function PdfOrganizePage() {
  if (!tool) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <JsonLd
          id="pdf-organize-schema"
          data={{
            software: softwareApplicationJsonLd({
              name: tool.name,
              description: tool.metaDescription,
              path: `/tools/${slug}`,
              featureList: tool.features,
            }),
            webpage: webPageJsonLd({
              name: tool.metaTitle,
              description: tool.metaDescription,
              path: `/tools/${slug}`,
            }),
            breadcrumb: breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Tools', path: '/tools' },
              { name: tool.name, path: `/tools/${slug}` },
            ]),
          }}
        />
        <ToolExperience tool={tool} workspace={<PdfOrganizeTool />} />
      </main>
      <Footer />
    </div>
  );
}
