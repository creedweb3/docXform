import { JsonLd } from '@/components/json-ld';
import { ToolComingSoon } from '@/components/tools/tool-coming-soon';
import { ToolLandingPage } from '@/components/tools/tool-landing-page';
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
      {available ? (
        <ToolLandingPage tool={tool} workspace={workspace} />
      ) : (
        <ToolComingSoon tool={tool} />
      )}
    </>
  );
}
