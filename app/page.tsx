import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDataTransferHorizontalIcon,
  ArrowDataTransferVerticalIcon,
  CpuIcon,
  Delete02Icon,
  File01Icon,
  FlashIcon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MAX_CONVERSION_FILE_SIZE_LABEL } from '@/lib/conversion-limits';
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

const facts = [
  {
    title: 'Supported conversions',
    text: 'Convert DOC and DOCX files to PDF, or convert PDF files into editable DOCX documents.',
  },
  {
    title: 'Browser processing',
    text: 'The conversion engine runs locally in a modern browser using WebAssembly.',
  },
  {
    title: 'No account required',
    text: 'Open the tool, choose a file, convert, and download the result without signing in.',
  },
  {
    title: 'File limit',
    text: `Each document can be up to ${MAX_CONVERSION_FILE_SIZE_LABEL}. Very complex files may take longer on slower devices.`,
  },
];

export default function Home() {
  return (
    <>
      <JsonLd
        id="home-schema"
        data={schemaGraph([
          webPageJsonLd({
            name: title,
            description,
            path: '/',
          }),
          webApplicationJsonLd(),
        ])}
      />
      <div className="min-h-screen flex flex-col bg-dot-grid-subtle">
        <Navbar />

        <main className="flex-1 pt-[8.5rem] sm:pt-[9rem]">
          <section className="px-6 pt-4 pb-16 sm:pb-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 glass-subtle rounded-full px-4 py-1.5 mb-6 border border-white/5">
                <HugeiconsIcon icon={Shield01Icon} size={14} strokeWidth={2} className="text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">
                  Browser-based &middot; up to {MAX_CONVERSION_FILE_SIZE_LABEL} &middot; free to use
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] mb-8">
                <span className="block" aria-label="docXform">
                  <span className="text-[#333333] font-semibold">doc</span>
                  <span className="text-[#2563eb] font-extrabold">X</span>
                  <span className="text-[#333333] font-semibold">form</span>
                </span>
                <span className="block mt-4 text-2xl sm:text-4xl lg:text-5xl font-semibold text-foreground">
                  Private Word and PDF converter
                </span>
              </h1>

              <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-14">
                Convert Word to PDF and PDF to Word with document processing that runs
                in your browser. Your files stay on your device during conversion.
              </p>

              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-[52rem] mx-auto">
                <Link
                  href="/pdf-to-word"
                  className="group converter-card converter-card-rose rounded-[2rem] p-6 sm:p-7 text-left shadow-[0_6px_16px_rgba(244,114,182,0.10)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(244,114,182,0.14)] hover:-translate-y-1 border md:aspect-square min-h-[18.75rem] flex flex-col"
                >
                  <div className="w-[4.5rem] h-[4.5rem] rounded-2xl icon-box-rose flex items-center justify-center mb-6">
                    <HugeiconsIcon
                      icon={ArrowDataTransferVerticalIcon}
                      size={32}
                      strokeWidth={1.5}
                      className="text-rose-400"
                    />
                  </div>
                  <h2 className="text-[1.35rem] sm:text-[1.7rem] font-semibold text-foreground leading-tight mb-3">
                    PDF to Word
                  </h2>
                  <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                    Convert PDF files to editable DOCX documents. Text, images, and
                    layout are preserved where possible and should be reviewed after conversion.
                  </p>
                  <span className="mt-auto w-fit converter-cta converter-cta-rose group-hover:gap-3 transition-all">
                    Start converting
                    <HugeiconsIcon icon={ArrowDataTransferVerticalIcon} size={18} strokeWidth={2.5} />
                  </span>
                </Link>

                <Link
                  href="/word-to-pdf"
                  className="group converter-card converter-card-blue rounded-[2rem] p-6 sm:p-7 text-left shadow-[0_6px_16px_rgba(59,130,246,0.10)] transition-all duration-300 hover:shadow-[0_12px_24px_rgba(59,130,246,0.14)] hover:-translate-y-1 border md:aspect-square min-h-[18.75rem] flex flex-col"
                >
                  <div className="w-[4.5rem] h-[4.5rem] rounded-2xl icon-box-blue flex items-center justify-center mb-6">
                    <HugeiconsIcon
                      icon={ArrowDataTransferHorizontalIcon}
                      size={32}
                      strokeWidth={1.5}
                      className="text-blue-500"
                    />
                  </div>
                  <h2 className="text-[1.35rem] sm:text-[1.7rem] font-semibold text-foreground leading-tight mb-3">
                    Word to PDF
                  </h2>
                  <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                    Save DOC and DOCX files as shareable PDFs. The converter keeps
                    margins, fonts, images, and spacing close to the source document.
                  </p>
                  <span className="mt-auto w-fit converter-cta converter-cta-blue group-hover:gap-3 transition-all">
                    Start converting
                    <HugeiconsIcon icon={ArrowDataTransferHorizontalIcon} size={18} strokeWidth={2.5} />
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <section className="px-4 sm:px-6 py-10 sm:py-12">
            <div className="max-w-[52rem] mx-auto">
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center items-stretch sm:items-center">
                <div className="feature-pill feature-pill-blue">
                  <HugeiconsIcon
                    icon={CpuIcon}
                    size={22}
                    strokeWidth={1.35}
                    className="text-blue-500 shrink-0"
                  />
                  <div className="text-center min-w-0 leading-tight">
                    <p className="font-semibold text-foreground text-[13px] sm:text-sm">
                      Browser Based
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      WebAssembly engine
                    </p>
                  </div>
                </div>
                <div className="feature-pill feature-pill-rose">
                  <HugeiconsIcon
                    icon={FlashIcon}
                    size={22}
                    strokeWidth={1.35}
                    className="text-rose-500 shrink-0"
                  />
                  <div className="text-center min-w-0 leading-tight">
                    <p className="font-semibold text-foreground text-[13px] sm:text-sm">
                      Local Results
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      Download from your device
                    </p>
                  </div>
                </div>
                <div className="feature-pill feature-pill-sky">
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    size={21}
                    strokeWidth={1.35}
                    className="text-sky-600 shrink-0"
                  />
                  <div className="text-center min-w-0 leading-tight">
                    <p className="font-semibold text-foreground text-[13px] sm:text-sm">
                      No File Upload
                    </p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                      Conversion stays local
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 pb-16 sm:pb-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                  What docXform does
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  docXform is built for common document workflows: creating PDFs
                  from Word files, extracting editable DOCX files from PDFs, and
                  keeping the conversion process on your device.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {facts.map((fact) => (
                  <div key={fact.title} className="glass-subtle rounded-2xl p-5">
                    <div className="w-10 h-10 rounded-xl icon-box-blue flex items-center justify-center mb-4">
                      <HugeiconsIcon icon={File01Icon} size={18} strokeWidth={1.5} className="text-blue-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {fact.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {fact.text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-sm font-medium">
                <Link
                  href="/faq"
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50/80"
                >
                  Read the FAQ
                </Link>
                <span className="hidden sm:inline text-muted-foreground" aria-hidden>
                  /
                </span>
                <Link
                  href="/articles"
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50/80"
                >
                  Browse conversion guides
                </Link>
                <span className="hidden sm:inline text-muted-foreground" aria-hidden>
                  /
                </span>
                <Link
                  href="/about"
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50/80"
                >
                  Learn about browser processing
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
