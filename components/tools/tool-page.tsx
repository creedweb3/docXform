import { SiteShell } from '@/components/site/site-shell';
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
      <SiteShell plain>
        <div className="flex flex-col items-center px-4 pb-10 max-md:px-3 max-md:pb-safe sm:px-6 sm:pb-12">
          {available ? (
            <ToolExperience tool={tool} workspace={workspace} />
          ) : (
            <ToolComingSoon tool={tool} />
          )}
        </div>
      </SiteShell>
    </>
  );
}
