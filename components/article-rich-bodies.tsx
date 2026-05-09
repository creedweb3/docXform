import type { ReactNode } from 'react';
import Link from 'next/link';

const RICH_SLUGS = new Set([
  'word-to-pdf-without-upload',
  'pdf-to-word-scanned-ocr',
  'batch-word-to-pdf',
  'font-embedding-pdf',
  'table-heavy-pdf-to-word',
  'docx-to-pdf-legal-briefs',
  'pdf-to-word-privacy-compliance',
  'wasm-converter-troubleshooting',
  'first-load-wasm-slow-devices',
  'browser-conversion-future',
]);

export function hasArticleRichBody(slug: string): boolean {
  return RICH_SLUGS.has(slug);
}

function InlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline">
      {children}
    </Link>
  );
}

export function ArticleRichBody({ slug }: { slug: string }) {
  switch (slug) {
    case 'word-to-pdf-without-upload':
      return <WordToPdfWithoutUploadBody />;
    case 'pdf-to-word-scanned-ocr':
      return <PdfToWordScannedOcrBody />;
    case 'batch-word-to-pdf':
      return <BatchWordToPdfBody />;
    case 'font-embedding-pdf':
      return <FontEmbeddingPdfBody />;
    case 'table-heavy-pdf-to-word':
      return <TableHeavyPdfToWordBody />;
    case 'docx-to-pdf-legal-briefs':
      return <DocxToPdfLegalBriefsBody />;
    case 'pdf-to-word-privacy-compliance':
      return <PdfToWordPrivacyComplianceBody />;
    case 'wasm-converter-troubleshooting':
      return <WasmConverterTroubleshootingBody />;
    case 'first-load-wasm-slow-devices':
      return <FirstLoadSlowDevicesBody />;
    case 'browser-conversion-future':
      return <BrowserConversionFutureBody />;
    default:
      return null;
  }
}

function WordToPdfWithoutUploadBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">What &quot;no upload&quot; really means here</h2>
      <p>
        docXform turns your Word file into a PDF inside your browser. Our{' '}
        <InlineLink href="/privacy">Privacy Policy</InlineLink> says we do not upload your file to our servers to do that job. Many
        other sites send your whole document to a remote computer first. We do not work that way for the conversion step itself.
      </p>
      <p>
        You will still see normal website traffic: pages, styles, scripts, and one big download the first time - the LibreOffice
        engine packaged as <code className="text-foreground">.wasm</code> files. That download is the tool, not your letter or
        contract flying to the cloud. Ads or analytics may load too - check your network tab if you need proof for a security
        review.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Simple steps that work well</h2>
      <ol className="list-decimal pl-5 space-y-1.5">
        <li>
          Open the <InlineLink href="/word-to-pdf">Word to PDF</InlineLink> page in a recent desktop browser (Chrome, Edge, or
          Firefox are good bets).
        </li>
        <li>Close heavy tabs so the page has enough memory for big documents and pictures.</li>
        <li>Pick your file, wait until the download button appears, then open the PDF and skim the first and last pages.</li>
        <li>If you will email or file it, open the PDF once in your usual viewer to be sure page breaks look right.</li>
      </ol>
      <h2 className="text-lg font-semibold text-foreground pt-2">How to sanity-check any &quot;private&quot; tool</h2>
      <p>
        Some products still upload files even when the marketing sounds local. If someone asks you to prove it, open the browser
        developer tools, watch the Network tab, and look for a giant POST of your file to a random domain. With docXform you should
        not see your document body treated like that for conversion.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Before you send the PDF onward</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Odd fonts - zoom in and make sure letters did not swap to a different shape.</li>
        <li>Charts and screenshots - zoom to 100% and 150% so you catch blur or cut-off edges.</li>
        <li>
          If you care about screen readers, spot-check headings in the PDF reader - different export paths tag structure differently.
        </li>
      </ul>
      <p>
        For cleaning up Word before export, read the <InlineLink href="/articles/formatting-guide">formatting guide</InlineLink> and
        the <InlineLink href="/faq">FAQ</InlineLink> for file-size limits.
      </p>
    </>
  );
}

function PdfToWordScannedOcrBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">Two kinds of PDF: text versus scan</h2>
      <p>
        A <strong className="text-foreground">text PDF</strong>{' '}
        lets you highlight words with your mouse. A <strong className="text-foreground">scanned PDF</strong>{' '}
        is often just photos of each page. Turning photos into a real Word file is like reading handwriting through glass - the
        computer has to guess every letter. Messy scans, crooked pages, or tiny text make more mistakes.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">What docXform is built for</h2>
      <p>
        docXform runs LibreOffice inside the browser (see <InlineLink href="/about">About</InlineLink>). That works well for everyday
        PDFs that already contain text. Pure image PDFs are harder for every tool. Treat Word output from scans as a draft: read it
        next to the original scan and fix tables and headers by hand when it matters.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">If you control the scanner</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Use about 300 DPI when you can; avoid super-compressed JPEG on text.</li>
        <li>Straighten the page and crop big black borders.</li>
        <li>Split huge books into smaller chunks so Word stays responsive.</li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">After Word opens</h2>
      <p>
        Re-use styles instead of one-off bold buttons, rebuild the table of contents if needed, and watch for odd line breaks in
        columns. For tricky grids, see <InlineLink href="/articles/table-heavy-pdf-to-word">table-heavy PDF to Word</InlineLink>. Try
        the <InlineLink href="/pdf-to-word">PDF to Word</InlineLink> tool on a two-page sample before you bet the whole project on
        it.
      </p>
    </>
  );
}

function BatchWordToPdfBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">Why people batch in the browser</h2>
      <p>
        Turning many Word files into PDFs is boring work. Doing it locally means you are not firing each contract at a stranger&apos;s
        conversion website. The trade-off is simple: your tab pays the bill in RAM and time. If you queue fifty giant files at once,
        the browser may get tired - work in smaller groups.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">How docXform helps with many files</h2>
      <p>
        The <InlineLink href="/word-to-pdf">Word to PDF</InlineLink> page lets you line up more than one file in a session. When
        several files finish converting, you may see a ZIP download option (built in the browser with JSZip) so you hand one folder
        to records - still without us storing your document bytes for conversion.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Checklist for tidy batches</h2>
      <ol className="list-decimal pl-5 space-y-1.5">
        <li>Name files in a clear order so the ZIP matches your audit trail.</li>
        <li>Close games or heavy apps while a long batch runs.</li>
        <li>If your IT team requires it, virus-scan the ZIP like any other download.</li>
        <li>Keep a tiny spreadsheet that maps each source DOCX to its PDF if someone asks later.</li>
      </ol>
      <h2 className="text-lg font-semibold text-foreground pt-2">Speed and quality tips</h2>
      <p>
        Big pictures and rare fonts slow things down. Prep templates with the{' '}
        <InlineLink href="/articles/formatting-guide">formatting guide</InlineLink>. If the engine will not start, read{' '}
        <InlineLink href="/articles/wasm-converter-troubleshooting">WASM troubleshooting</InlineLink> and{' '}
        <InlineLink href="/articles/first-load-wasm-slow-devices">first-load tips</InlineLink>.
      </p>
    </>
  );
}

function FontEmbeddingPdfBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">Fonts in plain English</h2>
      <p>
        A PDF needs to know how each letter is drawn. If the font is not embedded, the viewer picks a close substitute from the
        computer. That can nudge line breaks and spacing. This is true for Word desktop saves too - it is not unique to browser
        tools.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">LibreOffice in the browser vs Word on the desk</h2>
      <p>
        docXform&apos;s Word-to-PDF path uses LibreOffice in WASM. It may not embed fonts exactly the same way Microsoft Word does
        when you pick &quot;Save as PDF&quot; on the desktop. Always peek at the font list inside your PDF reader and compare page
        breaks to Word&apos;s print preview when pixel-perfect layout matters.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Before you hit convert</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Stick to common office fonts when you can - fewer surprises.</li>
        <li>Drop duplicate font families that only bloat the file.</li>
        <li>If policy says &quot;embed everything,&quot; check the PDF itself, not only the Word file.</li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">Quick validation</h2>
      <p>
        Open the PDF on another user account or machine to catch substitution. For email size limits, pair with{' '}
        <InlineLink href="/articles/pdf-optimization">PDF optimization</InlineLink>, knowing heavy compression can hurt tiny text
        inside images. Run one sample through <InlineLink href="/word-to-pdf">Word to PDF</InlineLink> before you mail a whole
        bundle.
      </p>
    </>
  );
}

function TableHeavyPdfToWordBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">Why tables feel magical and messy</h2>
      <p>
        A PDF is a pile of draw instructions: text here, a line there, maybe a mask. Word wants a real table: rows, columns, merged
        cells, styles. Any PDF-to-Word step has to guess the grid. LibreOffice (what docXform runs) does a decent job, but noisy
        layouts fool it. Budget time to fix money-grade spreadsheets by hand.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">If you still control the PDF source</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Prefer a real vector table over a screenshot of Excel.</li>
        <li>Remove decorative lines that pretend to be cell borders.</li>
        <li>Keep wide tables on one page orientation so page breaks stay predictable.</li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">Cleaning up inside Word</h2>
      <ol className="list-decimal pl-5 space-y-1.5">
        <li>If you got tabs instead of a table, select the block and use Word&apos;s text-to-table tool.</li>
        <li>Apply a table style and turn on repeat header rows for long tables.</li>
        <li>Re-check numbers - never trust pasted totals until formulas match your source.</li>
      </ol>
      <p>
        Test one representative page in <InlineLink href="/pdf-to-word">PDF to Word</InlineLink> first. For scans, pair with{' '}
        <InlineLink href="/articles/pdf-to-word-scanned-ocr">scan limitations</InlineLink>.
      </p>
    </>
  );
}

function DocxToPdfLegalBriefsBody() {
  return (
    <>
      <p className="text-xs text-muted-foreground border-l-2 border-amber-200 pl-3 py-1 my-2">
        Not legal advice. Courts differ - confirm margins, fonts, redaction, and metadata rules with your clerk or litigation support
        before you file.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Treat the PDF as the thing you file</h2>
      <p>
        What you see in Word is not always what the PDF engine prints. Section breaks, styles, tables of authorities, and stray
        comments can change pagination. Make a test PDF early and walk it against your checklist page by page.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Checks teams often forget</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Paper size, margins, and required captions match the court PDF.</li>
        <li>Refresh tables of contents or authorities after edits so page numbers stay honest.</li>
        <li>Look for hidden comments, track changes, or ghost text in boxes.</li>
        <li>Click through bookmarks after any security flattening your portal applies.</li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">Fonts</h2>
      <p>
        Follow local font rules, then open the font panel inside your PDF reader. Read{' '}
        <InlineLink href="/articles/font-embedding-pdf">font embedding and fidelity</InlineLink> for how LibreOffice-based export
        can differ from Word desktop.
      </p>
      <p>
        Use <InlineLink href="/word-to-pdf">Word to PDF</InlineLink> as one step - your e-filing test upload and preflight tools still
        belong in the workflow.
      </p>
    </>
  );
}

function PdfToWordPrivacyComplianceBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">What really changes in the browser</h2>
      <p>
        Our <InlineLink href="/privacy">Privacy Policy</InlineLink> says the file you pick is not uploaded to our servers for
        conversion. That tackles the worry about your document body riding to a vendor bucket - the classic cloud-converter story.
      </p>
      <p>
        It does not mean zero internet use. The app still downloads HTML, JavaScript, and the large LibreOffice engine files over
        HTTPS. Ads or analytics may load too - read those sections in the policy. Count those paths separately from the conversion
        itself.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Controls teams write down</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Approved browser versions, disk encryption, and screen lock on machines that touch sensitive PDFs.</li>
        <li>
          Whether OneDrive, Google Drive, or similar clients auto-copy every download - that is another place copies can appear.
        </li>
        <li>Retention: we do not keep a conversion history of your files, but your ticketing system or SIEM might log actions.</li>
        <li>
          Vendor homework: read <InlineLink href="/articles/modern-word-security">WASM security</InlineLink> and{' '}
          <InlineLink href="/about">About</InlineLink>, then repeat the network check inside your own VPN.
        </li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">Compliance in one paragraph</h2>
      <p>
        GDPR, HIPAA-style programs, and similar rules are bigger than a checkbox. They cover contracts, logging, access, and breach
        playbooks. Local conversion can reduce some subprocessors and cross-border hops tied to cloud OCR APIs, but it is not
        automatic compliance. Involve counsel, test with fake data first, then roll out.
      </p>
      <p>
        When you are ready, run <InlineLink href="/pdf-to-word">PDF to Word</InlineLink> on the same network path your users will
        use, including VPN or inspected TLS if that applies.
      </p>
    </>
  );
}

function WasmConverterTroubleshootingBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">First visit: downloading the engine</h2>
      <p>
        The LibreOffice engine inside WASM is large. The first time you convert, the browser pulls <code className="text-foreground">.wasm</code>{' '}
        and helper data over HTTPS, usually from this site&apos;s <code className="text-foreground">/wasm/</code> folder. If the
        primary copy fails, production can fall back to a CDN for those binary chunks - still not your document as an upload.
        Corporate proxies or strict filters sometimes block those files; the Network tab shows a 404 or blocked host fast. For a
        gentler explanation of slow first visits, read{' '}
        <InlineLink href="/articles/first-load-wasm-slow-devices">first-load tips for slow setups</InlineLink>.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Memory, storage, private windows</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Huge DOCX or image PDFs can exhaust tab memory - close other tabs or split the job.</li>
        <li>Private browsing can shrink storage quotas - try a normal window if loading never finishes.</li>
        <li>Low disk space breaks downloads - free a few gigabytes and retry.</li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">When the output looks wrong</h2>
      <p>
        That is usually a layout or font limitation, not a random crash. Cross-check{' '}
        <InlineLink href="/articles/formatting-guide">formatting</InlineLink>,{' '}
        <InlineLink href="/articles/font-embedding-pdf">fonts</InlineLink>, and{' '}
        <InlineLink href="/articles/table-heavy-pdf-to-word">tables</InlineLink>. If one file fails, delete half the content in a
        copy until you find the shape that triggers the bug.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Still stuck?</h2>
      <p>
        Note your browser version, OS, rough file size, and whether it fails during download or during conversion. Reach out via the{' '}
        <InlineLink href="/contact">contact page</InlineLink>. Try the same file on{' '}
        <InlineLink href="/word-to-pdf">Word to PDF</InlineLink> and <InlineLink href="/pdf-to-word">PDF to Word</InlineLink> to see
        if only one direction breaks.
      </p>
    </>
  );
}

function FirstLoadSlowDevicesBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">Think of the first visit like installing an app once</h2>
      <p>
        The converter is not a tiny button. The first time your browser loads it, it downloads a serious chunk of software (the
        LibreOffice engine as WASM). That is a one-time cost per browser profile until the cache fills or you clear data. Slow
        Wi-Fi or an older laptop makes that chunk feel long even when nothing is wrong.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">What usually helps</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Use a wired connection or sit closer to the router if Wi-Fi bars are weak.</li>
        <li>Let the tab stay in the foreground until the progress indicator finishes - background tabs throttle downloads.</li>
        <li>Try once on a phone hotspot to see if office filtering is the culprit.</li>
        <li>After the first success, the same machine often feels much faster - the heavy pieces are cached.</li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">What to expect later</h2>
      <p>
        Home internet speeds and average laptop RAM keep climbing. Browsers also keep improving how they compile WASM. That means
        the &quot;first open&quot; story should keep getting easier for most people even though the engine itself stays large. If
        you want the deeper technical list, read <InlineLink href="/articles/wasm-converter-troubleshooting">WASM troubleshooting</InlineLink>{' '}
        next.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Mindset for teams rolling this out</h2>
      <p>
        Tell users to open the tool once on a good connection before a deadline rush. Pair that with the plain-language future view
        in <InlineLink href="/articles/browser-conversion-future">browser conversion and the next few years</InlineLink> so people
        know why the approach exists.
      </p>
    </>
  );
}

function BrowserConversionFutureBody() {
  return (
    <>
      <h2 className="text-lg font-semibold text-foreground pt-2">Why browsers keep winning for sensitive files</h2>
      <p>
        Sending a contract to someone else&apos;s server is simple, but it adds copies you cannot see. Running conversion locally
        means the heavy lifting stays on the device you already trust. The trade-off used to be &quot;my laptop feels slow.&quot; As
        chips and broadband improve, that trade-off shrinks for more people every year.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">What gets better over time</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Faster average download speeds shrink the pain of the first engine download.</li>
        <li>More RAM in everyday laptops means big documents choke less often.</li>
        <li>Browser vendors keep tuning WASM performance, so the same code tends to run quicker on newer releases.</li>
        <li>CDN coverage widens, so redundant copies of the engine live closer to users worldwide.</li>
      </ul>
      <h2 className="text-lg font-semibold text-foreground pt-2">What does not magically disappear</h2>
      <p>
        You still need a machine that can hold the document in memory and a network path that can fetch the engine files. Very cheap
        hardware or heavily filtered networks will always need extra patience. That is why we also publish{' '}
        <InlineLink href="/articles/first-load-wasm-slow-devices">first-load tips for slow setups</InlineLink>.
      </p>
      <h2 className="text-lg font-semibold text-foreground pt-2">Why we still believe in this direction</h2>
      <p>
        The internet is not going to get slower. Devices are not going to lose RAM. Tools that respect privacy by default should
        feel normal, not niche. docXform is betting on that curve - local conversion today, smoother first launches tomorrow, same
        promise about your file staying off our conversion servers.
      </p>
    </>
  );
}
