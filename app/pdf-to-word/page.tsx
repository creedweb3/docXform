import { PdfToWordConverter } from '@/components/pdf-to-word-converter';
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

const title = 'PDF to Word Converter - Free PDF to DOCX | docXform';
const description =
  'Convert PDF files to editable DOCX documents in your browser. docXform runs PDF to Word conversion locally with no file upload required.';

const toolFaqs: SiteFaq[] = [
  {
    question: 'How do I convert PDF to Word with docXform?',
    answer:
      'Open the PDF to Word tool, choose or drop a PDF file, wait for browser-based conversion to finish, and download the editable DOCX file.',
  },
  {
    question: 'Are PDF files uploaded during conversion?',
    answer:
      'No. PDF to Word conversion runs in your browser with WebAssembly, so the selected PDF file stays on your device during conversion.',
  },
  {
    question: 'What kind of Word file does docXform create?',
    answer:
      'docXform creates a DOCX file that can be opened in Microsoft Word, Google Docs, LibreOffice, and other compatible editors.',
  },
  {
    question: 'Will the DOCX look exactly like the PDF?',
    answer:
      'docXform preserves text, images, and layout where possible. Scanned PDFs, complex tables, custom fonts, and layered designs can require manual cleanup after conversion.',
  },
];

const infoSections = [
  {
    title: 'How it works',
    text: 'Select a PDF file, let the browser convert it through a local WebAssembly workflow, then download the generated DOCX.',
  },
  {
    title: 'Supported files',
    text: `PDF files are supported. Each file must be ${MAX_CONVERSION_FILE_SIZE_LABEL} or smaller.`,
  },
  {
    title: 'Privacy',
    text: 'The PDF conversion process does not upload your file to docXform servers.',
  },
  {
    title: 'Output review',
    text: 'Editable DOCX output can vary by PDF structure, so review important documents before reuse.',
  },
];

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/pdf-to-word',
  image: OG_IMAGES.pdfToWord,
  keywords: [
    'PDF to Word converter',
    'PDF to DOCX converter',
    'convert PDF to Word online',
    'PDF to Word without upload',
    'editable Word converter',
  ],
});

export default function PdfToWordPage() {
  return (
    <>
      <JsonLd
        id="pdf-to-word-schema"
        data={schemaGraph([
          webPageJsonLd({ name: title, description, path: '/pdf-to-word' }),
          softwareApplicationJsonLd({
            name: 'docXform PDF to Word Converter',
            description,
            path: '/pdf-to-word',
            featureList: [
              'Convert PDF to DOCX',
              'Editable Word output',
              'Browser-based conversion',
              `Supports files up to ${MAX_CONVERSION_FILE_SIZE_LABEL}`,
            ],
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'PDF to Word', path: '/pdf-to-word' },
          ]),
          faqPageJsonLd(toolFaqs, '/pdf-to-word'),
        ])}
      />
      <ConverterLandingPage
        accent="rose"
        eyebrow="No file upload"
        title="PDF to Word converter"
        description="Convert PDF files into editable DOCX documents in your browser."
        converter={<PdfToWordConverter />}
        infoSections={infoSections}
        faqs={toolFaqs}
        learnTitle="Learn more about private PDF workflows"
        learnLinks={[
          { href: '/articles/modern-word-security', label: 'Browser document security' },
          { href: '/articles/formatting-guide', label: 'Formatting guide' },
          { href: '/faq', label: 'Read all FAQs' },
        ]}
      />
    </>
  );
}
