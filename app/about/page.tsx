import { SiteShell } from '@/components/site/site-shell';
import { HackerPage, TermProse } from '@/components/site/console/console-ui';
import { JsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  breadcrumbJsonLd,
  createPageMetadata,
  OG_IMAGES,
  schemaGraph,
  webPageJsonLd,
} from '@/lib/seo';

const title = 'About docXform - Browser-Based Document Conversion';
const description =
  'Learn how docXform converts Word and PDF documents in your browser with WebAssembly, no account requirement, and no file upload for conversion.';

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: '/about',
  image: OG_IMAGES.about,
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        id="about-schema"
        data={schemaGraph([
          webPageJsonLd({ type: 'AboutPage', name: title, description, path: '/about' }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
        ])}
      />
      <SiteShell>
        <HackerPage
          path="/about"
          title="About docXform"
          description="Browser-based Word and PDF tools built for privacy and everyday document work."
        >
          <TermProse>
            <p>
              docXform is a collection of document utilities that run in your web browser. The goal
              is simple: help you convert, edit, and prepare Word and PDF files without handing them
              to a remote conversion server.
            </p>
            <p>
              When you use our Word to PDF or PDF to Word converters, processing happens on your
              device. We ship LibreOffice compiled to WebAssembly so the engine loads into the tab,
              reads your file locally, and produces a download from there. No account is required for
              the core tools.
            </p>

            <h2>How we are different</h2>
            <p>
              Most online converters work by uploading your file to their infrastructure, converting
              it on their servers, and sending the result back. That model is convenient, but it
              means your document leaves your machine. docXform is built for people who want the
              conversion step to stay local.
            </p>
            <p>
              You can open your browser&apos;s developer tools during a conversion and confirm that
              the file is not being posted to a docXform conversion endpoint. Site assets,
              analytics, and advertising still load over the network like any other website, but the
              document itself is not part of that upload path.
            </p>

            <h2>What you can do here</h2>
            <p>
              Beyond the flagship Word and PDF converters, docXform includes tools to merge and split
              PDFs, compress files, rotate pages, extract text, scrub DOCX metadata, convert images
              to PDF, and more. Each tool page explains what it does and whether it runs entirely in
              the browser.
            </p>
            <p>
              We add utilities when they fit the same local-first model. If a job truly requires a
              server, we say so on the tool page rather than implying it runs locally.
            </p>

            <h2>What we prioritize</h2>
            <ul>
              <li>
                <strong>Privacy</strong> — keep conversion on your device whenever the tool supports
                it.
              </li>
              <li>
                <strong>Clarity</strong> — plain language about what happens to your files and what
                still uses the network.
              </li>
              <li>
                <strong>Utility</strong> — practical tools for real document work, not a single
                one-off converter buried in ads.
              </li>
              <li>
                <strong>Access</strong> — no sign-up wall for everyday use of the core converters.
              </li>
            </ul>

            <h2>Limits and expectations</h2>
            <p>
              Browser-based conversion depends on your device, browser, and file complexity. Very
              large files, unusual fonts, scanned PDFs, or intricate layouts may need manual
              cleanup after export. We publish file-size limits and format notes on the{' '}
              <Link href="/faq">FAQ</Link> so you know what to expect before you start.
            </p>
            <p>
              The first visit in a browser profile downloads the WebAssembly engine, which can take a
              moment on slower connections. Later visits in the same profile reuse the cached binary.
            </p>

            <h2>How we sustain the project</h2>
            <p>
              docXform is independent and supported by advertising on some pages. We do not sell the
              contents of files you convert. The contact form is for business and partnership
              inquiries only; it does not process documents.
            </p>
            <p>
              If you have questions about privacy, formats, or output quality, the FAQ is the best
              place to start. For business or press inquiries, use the{' '}
              <Link href="/contact">contact page</Link>.
            </p>
          </TermProse>
        </HackerPage>
      </SiteShell>
    </>
  );
}
