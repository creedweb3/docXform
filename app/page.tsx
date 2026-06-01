import { CreativeHome } from '@/components/creative/CreativeHome';
import { SiteShell } from '@/components/site/site-shell';
import { JsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';
import {
  createPageMetadata,
  schemaGraph,
  webApplicationJsonLd,
  webPageJsonLd,
} from '@/lib/seo';

const title = 'docXform | Private Word to PDF and PDF to Word Converter';
const description =
  'Convert Word to PDF and PDF to Word in your browser. docXform keeps document processing on your device with no file uploads.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/',
  keywords: [
    'PDF to Word converter online',
    'Word to PDF converter online',
    'convert PDF to Word',
    'convert Word to PDF',
    'browser-based document converter',
    'private file converter',
    'secure document conversion',
    'no upload PDF converter',
    'Word to PDF without upload',
    'PDF to Word without upload',
    'client-side PDF converter',
  ],
});

export default function Home() {
  return (
    <>
      <JsonLd
        id="home-schema"
        data={schemaGraph([
          webPageJsonLd({ name: title, description, path: '/' }),
          webApplicationJsonLd(),
        ])}
      />
      <SiteShell boot="full">
        <CreativeHome />
      </SiteShell>
    </>
  );
}
