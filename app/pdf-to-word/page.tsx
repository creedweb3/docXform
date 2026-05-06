import { PdfToWordConverter } from '@/components/pdf-to-word-converter';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AdSlot } from '@/components/ad-slot';
import { JsonLd } from '@/components/json-ld';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Shield01Icon,
  FlashIcon,
  SparklesIcon,
  File01Icon,
  BookOpen01Icon,
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
          webPageJsonLd({
            name: title,
            description,
            path: '/pdf-to-word',
          }),
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
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center px-6 pt-[8.5rem] sm:pt-[9rem] pb-12">
          <div className="w-full max-w-4xl mx-auto pt-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 mb-6 border border-white/5">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  size={14}
                  strokeWidth={2}
                  className="text-rose-500"
                />
                <span className="text-xs font-medium text-muted-foreground">
                  No file upload &middot; up to {MAX_CONVERSION_FILE_SIZE_LABEL} &middot; free to use
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                <span className="gradient-text-rose">PDF to Word converter</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Convert PDF files into editable DOCX documents in your browser.
              </p>
            </div>
            <PdfToWordConverter />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="glass-subtle rounded-xl p-5 text-center">
                <HugeiconsIcon
                  icon={Shield01Icon}
                  size={20}
                  strokeWidth={2}
                  className="text-rose-400 mx-auto mb-2.5"
                />
                <p className="text-sm font-medium text-foreground">Private by design</p>
                <p className="text-xs text-muted-foreground mt-1">No file upload</p>
              </div>
              <div className="glass-subtle rounded-xl p-5 text-center">
                <HugeiconsIcon
                  icon={FlashIcon}
                  size={20}
                  strokeWidth={2}
                  className="text-amber-500 mx-auto mb-2.5"
                />
                <p className="text-sm font-medium text-foreground">Browser based</p>
                <p className="text-xs text-muted-foreground mt-1">Runs locally</p>
              </div>
              <div className="glass-subtle rounded-xl p-5 text-center">
                <HugeiconsIcon
                  icon={SparklesIcon}
                  size={20}
                  strokeWidth={2}
                  className="text-emerald-500 mx-auto mb-2.5"
                />
                <p className="text-sm font-medium text-foreground">Editable DOCX</p>
                <p className="text-xs text-muted-foreground mt-1">Review before reuse</p>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="text-2xl font-bold tracking-tight text-foreground text-center mb-6">
                PDF to Word details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {infoSections.map((section) => (
                  <div key={section.title} className="glass-subtle rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl icon-box-rose flex items-center justify-center mb-4">
                      <HugeiconsIcon
                        icon={File01Icon}
                        size={18}
                        strokeWidth={1.5}
                        className="text-rose-500"
                      />
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
                  <details key={faq.question} className="glass-subtle rounded-2xl p-5" open={index === 0}>
                    <summary className="font-medium text-sm text-foreground list-none cursor-pointer">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section className="mt-12 rounded-2xl bg-white/55 border border-border/50 p-6 text-center">
              <HugeiconsIcon
                icon={BookOpen01Icon}
                size={22}
                strokeWidth={1.5}
                className="text-rose-500 mx-auto mb-3"
              />
              <h2 className="text-base font-semibold text-foreground mb-2">
                Learn more about private PDF workflows
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-medium">
                <Link href="/articles/modern-word-security" className="text-rose-600 hover:text-rose-700">
                  Browser document security
                </Link>
                <Link href="/articles/formatting-guide" className="text-rose-600 hover:text-rose-700">
                  Formatting guide
                </Link>
                <Link href="/faq" className="text-rose-600 hover:text-rose-700">
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
