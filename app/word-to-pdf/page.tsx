import { WordToPdfConverter } from '@/components/word-to-pdf-converter';
import { ConverterLandingPage } from '@/components/site/converter-landing-page';
import { JsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  faqPageJsonLd,
  OG_IMAGES,
  schemaGraph,
  softwareApplicationJsonLd,
  webPageJsonLd,
} from '@/lib/seo';
import type { SiteFaq } from '@/lib/site-faqs';

const title = 'Word to PDF Converter - Free DOC and DOCX to PDF | docXform';
const description =
  'Convert DOC and DOCX files to PDF in your browser. docXform runs Word to PDF conversion locally with no file upload required.';

const toolFaqs: SiteFaq[] = [
  {
    question: 'How do I convert Word to PDF with docXform?',
    answer:
      'Open the Word to PDF tool, choose or drop a DOC or DOCX file, wait for browser-based conversion to finish, and download the generated PDF.',
  },
  {
    question: 'Are Word files uploaded during conversion?',
    answer:
      'No. Word to PDF conversion runs in your browser with WebAssembly, so the selected DOC or DOCX file stays on your device during conversion.',
  },
  {
    question: 'Which Word formats are supported?',
    answer:
      `The Word to PDF converter accepts DOC and DOCX files up to ${MAX_CONVERSION_FILE_SIZE_LABEL} each.`,
  },
  {
    question: 'Will the PDF match my Word document?',
    answer:
      'docXform keeps margins, fonts, images, and layout close to the source document where possible. Review important files after conversion, especially documents with uncommon fonts or complex embedded objects.',
  },
];

const infoSections = [
  {
    title: 'How it works',
    text: 'Select a DOC or DOCX file, let the WebAssembly converter run in your browser, then download the generated PDF from your device.',
  },
  {
    title: 'Supported files',
    text: `DOC and DOCX files are supported. Each file must be ${MAX_CONVERSION_FILE_SIZE_LABEL} or smaller.`,
  },
  {
    title: 'Privacy',
    text: 'The document conversion process does not upload your Word file to docXform servers.',
  },
  {
    title: 'Output review',
    text: 'Most everyday files convert cleanly, but legal, brand, or print-ready documents should be reviewed before sharing.',
  },
];

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/word-to-pdf',
  image: OG_IMAGES.wordToPdf,
  keywords: [
    'Word to PDF converter',
    'DOCX to PDF converter',
    'DOC to PDF converter',
    'convert Word to PDF online',
    'Word to PDF without upload',
  ],
});

export default function WordToPdfPage() {
  return (
    <>
      <JsonLd
        id="word-to-pdf-schema"
        data={schemaGraph([
          webPageJsonLd({ name: title, description, path: '/word-to-pdf' }),
          softwareApplicationJsonLd({
            name: 'docXform Word to PDF Converter',
            description,
            path: '/word-to-pdf',
            featureList: [
              'Convert DOCX to PDF',
              'Convert DOC to PDF',
              'Browser-based conversion',
              `Supports files up to ${MAX_CONVERSION_FILE_SIZE_LABEL}`,
            ],
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Word to PDF', path: '/word-to-pdf' },
          ]),
          faqPageJsonLd(toolFaqs, '/word-to-pdf'),
        ])}
      />
      <ConverterLandingPage
        path="/word-to-pdf"
        eyebrow="No file upload"
        title="Word to PDF converter"
        description="Convert DOC and DOCX files into downloadable PDFs in your browser."
        converter={<WordToPdfConverter />}
        infoSections={infoSections}
        faqs={toolFaqs}
        learnTitle="Learn more about clean Word to PDF conversion"
        learnLinks={[
          { href: '/articles/formatting-guide', label: 'DOCX formatting guide' },
          { href: '/articles/docx-standards', label: 'DOCX standards' },
          { href: '/faq', label: 'Read all FAQs' },
        ]}
      />
    </>
  );
}
