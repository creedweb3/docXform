import { WordToPdfConverter } from '@/components/word-to-pdf-converter';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AdSlot } from '@/components/ad-slot';
import { JsonLd } from '@/components/json-ld';
import { FaqDetailsCard } from '@/components/faq-details-card';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  BookOpen01Icon,
  File01Icon,
  FlashIcon,
  Shield01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';
import Link from 'next/link';
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
          webPageJsonLd({
            name: title,
            description,
            path: '/word-to-pdf',
          }),
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
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center px-6 pt-[8.5rem] sm:pt-[9rem] pb-12">
          <div className="w-full max-w-4xl mx-auto pt-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 mb-6 border border-white/5">
                <HugeiconsIcon icon={Shield01Icon} size={14} strokeWidth={2} className="text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  No file upload &middot; up to {MAX_CONVERSION_FILE_SIZE_LABEL} &middot; free to use
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                <span className="gradient-text-blue">Word to PDF converter</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Convert DOC and DOCX files into downloadable PDFs in your browser.
              </p>
            </div>
            <WordToPdfConverter />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="glass-subtle rounded-xl p-5 text-center">
                <HugeiconsIcon icon={Shield01Icon} size={20} strokeWidth={2} className="text-blue-400 mx-auto mb-2.5" />
                <p className="text-sm font-medium text-foreground">Private by design</p>
                <p className="text-xs text-muted-foreground mt-1">No file upload</p>
              </div>
              <div className="glass-subtle rounded-xl p-5 text-center">
                <HugeiconsIcon icon={FlashIcon} size={20} strokeWidth={2} className="text-amber-500 mx-auto mb-2.5" />
                <p className="text-sm font-medium text-foreground">Browser based</p>
                <p className="text-xs text-muted-foreground mt-1">Runs locally</p>
              </div>
              <div className="glass-subtle rounded-xl p-5 text-center">
                <HugeiconsIcon icon={SparklesIcon} size={20} strokeWidth={2} className="text-emerald-500 mx-auto mb-2.5" />
                <p className="text-sm font-medium text-foreground">Formatted output</p>
                <p className="text-xs text-muted-foreground mt-1">Review before sharing</p>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-6">
                Word to PDF details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {infoSections.map((section) => (
                  <div key={section.title} className="glass-subtle rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl icon-box-blue flex items-center justify-center mb-4">
                      <HugeiconsIcon icon={File01Icon} size={18} strokeWidth={1.5} className="text-blue-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {section.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {section.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-6">
                Common questions
              </h2>
              <div className="space-y-3">
                {toolFaqs.map((faq, index) => (
                  <FaqDetailsCard
                    key={faq.question}
                    question={faq.question}
                    answer={faq.answer}
                    defaultOpen={index === 0}
                    variant="glass-subtle"
                    showExpander={false}
                  />
                ))}
              </div>
            </section>

            <section className="mt-12 rounded-2xl bg-white/55 border border-border/50 p-6 text-center">
              <HugeiconsIcon icon={BookOpen01Icon} size={22} strokeWidth={1.5} className="text-blue-500 mx-auto mb-3" />
              <h2 className="text-base font-semibold text-foreground mb-2">
                Learn more about clean Word to PDF conversion
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
                <Link href="/articles/formatting-guide" className="text-blue-600 hover:text-blue-700">
                  DOCX formatting guide
                </Link>
                <Link href="/articles/docx-standards" className="text-blue-600 hover:text-blue-700">
                  DOCX standards
                </Link>
                <Link href="/faq" className="text-blue-600 hover:text-blue-700">
                  Read all FAQs
                </Link>
              </div>
            </section>

            <AdSlot variant="content" visibleClassName="mt-8" />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
