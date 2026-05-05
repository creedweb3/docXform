export interface SiteFaq {
  question: string;
  answer: string;
}

export const SITE_FAQS: SiteFaq[] = [
  {
    question: 'Is DocXform free to use?',
    answer:
      'Yes. DocXform is free to use, with no account required for Word to PDF or PDF to Word conversion.',
  },
  {
    question: 'Where are my documents processed?',
    answer:
      'Document conversion runs in your browser using WebAssembly. The converter reads the file locally, processes it on your device, and creates the download in the browser.',
  },
  {
    question: 'Are my files uploaded to DocXform servers?',
    answer:
      'No. The Word, PDF, DOC, and DOCX files you convert are not uploaded to DocXform servers. The contact form is separate and only sends the message details you submit.',
  },
  {
    question: 'What file formats does DocXform support?',
    answer:
      'DocXform supports Word to PDF conversion for DOCX and DOC files, and PDF to Word conversion that creates editable DOCX files.',
  },
  {
    question: 'What is the file size limit?',
    answer:
      'Each uploaded document must be 100 MB or smaller. Large or highly complex files can still take longer because the conversion runs on your own device.',
  },
  {
    question: 'Will formatting be preserved?',
    answer:
      'DocXform aims to preserve layout, fonts, images, and spacing where the source document allows it. Very complex layouts, uncommon fonts, scanned PDFs, or embedded objects can require manual review after conversion.',
  },
  {
    question: 'Do I need to install software?',
    answer:
      'No installation is required. DocXform works in modern browsers including Chrome, Edge, Firefox, and Safari, as long as WebAssembly is available.',
  },
];
