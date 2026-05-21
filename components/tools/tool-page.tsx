import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import { ToolComingSoon } from '@/components/tools/tool-coming-soon';
import { ToolExperience } from '@/components/tools/tool-experience';
import { isToolPageAvailable } from '@/lib/tool-availability';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  schemaGraph,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from '@/lib/seo';
import { toolFaqsForJsonLd, type ToolDefinition } from '@/lib/tools';

type ToolPageProps = {
  tool: ToolDefinition;
  workspace: React.ReactNode;
};

export function ToolPage({ tool, workspace }: ToolPageProps) {
  const path = `/tools/${tool.slug}`;
  const available = isToolPageAvailable(tool.slug);

  return (
    <>
      <JsonLd
        id={`${tool.slug}-schema`}
        data={schemaGraph([
          webPageJsonLd({
            name: tool.metaTitle,
            description: tool.metaDescription,
            path,
          }),
          softwareApplicationJsonLd({
            name: tool.name,
            description: tool.metaDescription,
            path,
            featureList: tool.features,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: tool.name, path },
          ]),
          faqPageJsonLd(toolFaqsForJsonLd(tool), path),
        ])}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center px-4 pt-[7.75rem] pb-10 max-md:px-3 max-md:pt-[7rem] max-md:pb-safe sm:px-6 sm:pt-[9rem] sm:pb-12">
          {available ? (
            <ToolExperience tool={tool} workspace={workspace} />
          ) : (
            <ToolComingSoon tool={tool} />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
