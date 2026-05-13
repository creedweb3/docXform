import {
  Files01Icon,
  SplitIcon,
  Image01Icon,
  ImageDownloadIcon,
  Presentation02Icon,
  Presentation01Icon,
  Shield01Icon,
} from '@hugeicons/core-free-icons';

export type ToolDefinition = {
  slug: string;
  name: string;
  description: string;
  accentClass: string;
  badgeClass: string;
  buttonClass: string;
  icon: typeof Files01Icon;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  howToSteps: string[];
  faqs: { q: string; a: string }[];
  features: string[];
};

export const toolDefinitions: ToolDefinition[] = [
  {
    slug: 'pdf-merge',
    name: 'PDF Merge',
    description: 'Combine multiple PDFs in-browser; no upload, keep order.',
    accentClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    badgeClass: 'text-emerald-700 bg-emerald-100',
    buttonClass: 'from-emerald-600 to-emerald-500',
    icon: Files01Icon,
    keywords: ['merge pdf', 'combine pdf', 'offline pdf merge'],
    metaTitle: 'PDF Merge – combine PDFs in your browser | docXform',
    metaDescription: 'Merge PDFs locally with no uploads. Keep page order, privacy-first, WebAssembly fast.',
    howToSteps: [
      'Open the PDF Merge tool and add your PDF files',
      'Arrange files in the order you want',
      'Click Process locally to merge without uploading',
      'Download your combined PDF',
    ],
    faqs: [
      { q: 'Do you upload my PDFs?', a: 'No. Merging runs in your browser via WebAssembly; files stay on your device.' },
      { q: 'Can I reorder files?', a: 'Yes. Add files, then arrange before processing.' },
      { q: 'Is there a size limit?', a: 'Large PDFs work, but memory is limited by your browser; start with fewer/lighter files if constrained.' },
      { q: 'Will bookmarks be kept?', a: 'Basic structure is preserved when possible; complex outlines may vary.' },
    ],
    features: ['Local-only processing', 'Reorder before merge', 'No signup, no watermark'],
  },
  {
    slug: 'pdf-split',
    name: 'PDF Split',
    description: 'Extract or split PDF ranges locally with page selection.',
    accentClass: 'bg-amber-50 text-amber-700 border-amber-100',
    badgeClass: 'text-amber-700 bg-amber-100',
    buttonClass: 'from-amber-500 to-amber-400',
    icon: SplitIcon,
    keywords: ['split pdf', 'extract pdf pages', 'split pdf offline'],
    metaTitle: 'Split PDF – extract pages locally | docXform',
    metaDescription: 'Split PDF pages without uploads. Choose ranges, extract in-browser, privacy-first.',
    howToSteps: [
      'Open the PDF Split tool and add your PDF',
      'Enter page ranges or choose split-by ranges',
      'Click Process locally to split without uploading',
      'Download your split PDFs',
    ],
    faqs: [
      { q: 'Is my PDF uploaded?', a: 'No. Splitting runs in your browser; files remain on your device.' },
      { q: 'Can I pick exact pages?', a: 'Yes. Use ranges like 1-3,5,8 or even/odd patterns.' },
      { q: 'Do links or bookmarks remain?', a: 'Basic links usually stay; complex outlines may change after split.' },
    ],
    features: ['Custom ranges', 'Even/odd options', 'Local processing'],
  },
  {
    slug: 'pdf-compress',
    name: 'PDF Compress',
    description: 'Shrink PDFs with on-device compression presets.',
    accentClass: 'bg-teal-50 text-teal-700 border-teal-100',
    badgeClass: 'text-teal-700 bg-teal-100',
    buttonClass: 'from-teal-600 to-teal-500',
    icon: Files01Icon,
    keywords: ['compress pdf', 'reduce pdf size', 'shrink pdf offline'],
    metaTitle: 'Compress PDF – reduce size locally | docXform',
    metaDescription: 'Compress PDFs on-device with quality presets. No uploads, keep privacy intact.',
    howToSteps: [
      'Open the PDF Compress tool and add your PDF',
      'Choose a quality preset (smaller vs higher quality)',
      'Click Process locally to compress without uploading',
      'Download the compressed PDF',
    ],
    faqs: [
      { q: 'Are my PDFs uploaded?', a: 'No. Compression runs locally in your browser; nothing leaves your device.' },
      { q: 'Will text stay searchable?', a: 'Yes, text-based PDFs remain searchable; images may be downsampled per preset.' },
      { q: 'What presets exist?', a: 'Light, Balanced, and Max reduce image quality progressively while keeping text crisp.' },
    ],
    features: ['Quality presets', 'Local-only compression', 'Searchable text preserved'],
  },
  {
    slug: 'pdf-to-images',
    name: 'PDF to Images',
    description: 'Export PDF pages to PNG/JPEG without uploads.',
    accentClass: 'bg-purple-50 text-purple-700 border-purple-100',
    badgeClass: 'text-purple-700 bg-purple-100',
    buttonClass: 'from-purple-600 to-purple-500',
    icon: Image01Icon,
    keywords: ['pdf to png', 'pdf to jpg', 'export pdf pages'],
    metaTitle: 'PDF to Images – export pages locally | docXform',
    metaDescription: 'Convert PDF pages to PNG or JPEG on-device. No uploads, privacy-first, quick exports.',
    howToSteps: [
      'Open PDF to Images and add your PDF',
      'Choose PNG or JPEG and desired resolution',
      'Click Process locally to render pages in-browser',
      'Download the exported images',
    ],
    faqs: [
      { q: 'Do you upload my PDF?', a: 'No. Rendering happens in your browser; files stay local.' },
      { q: 'Can I choose format and DPI?', a: 'Yes. Pick PNG/JPEG and a resolution preset to balance size and clarity.' },
      { q: 'Large PDFs?', a: 'Works locally; very large files may need lower DPI to fit memory.' },
    ],
    features: ['PNG or JPEG output', 'Resolution presets', 'On-device rendering'],
  },
  {
    slug: 'images-to-pdf',
    name: 'Images to PDF',
    description: 'Batch images into a single PDF, all in your browser.',
    accentClass: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    badgeClass: 'text-cyan-700 bg-cyan-100',
    buttonClass: 'from-cyan-600 to-cyan-500',
    icon: ImageDownloadIcon,
    keywords: ['jpg to pdf', 'png to pdf', 'images to pdf'],
    metaTitle: 'Images to PDF – batch convert locally | docXform',
    metaDescription: 'Combine JPG/PNG into one PDF on-device. No uploads, privacy-safe, order control.',
    howToSteps: [
      'Open Images to PDF and add your images',
      'Reorder if needed and choose page fit',
      'Click Process locally to build the PDF',
      'Download your merged PDF',
    ],
    faqs: [
      { q: 'Are images uploaded?', a: 'No. Conversion happens locally; nothing leaves your device.' },
      { q: 'Can I reorder?', a: 'Yes. Arrange images before processing.' },
      { q: 'How are images fit?', a: 'Choose fit-to-page or maintain aspect with margins.' },
    ],
    features: ['Reorder images', 'Fit-to-page options', 'Local conversion'],
  },
  {
    slug: 'pptx-to-pdf',
    name: 'PPTX to PDF',
    description: 'Convert PowerPoint to PDF locally with slides intact.',
    accentClass: 'bg-orange-50 text-orange-700 border-orange-100',
    badgeClass: 'text-orange-700 bg-orange-100',
    buttonClass: 'from-orange-600 to-orange-500',
    icon: Presentation02Icon,
    keywords: ['ppt to pdf', 'pptx to pdf', 'slides to pdf'],
    metaTitle: 'PPTX to PDF – convert slides locally | docXform',
    metaDescription: 'Convert PPTX to PDF on-device. No uploads, keep layout and fonts where possible.',
    howToSteps: [
      'Open PPTX to PDF and add your presentation',
      'Confirm slide range and layout fidelity',
      'Click Process locally to render to PDF in-browser',
      'Download the PDF slides',
    ],
    faqs: [
      { q: 'Is my deck uploaded?', a: 'No. Rendering stays in your browser; files remain local.' },
      { q: 'Will fonts match?', a: 'System-available fonts render best; embedded fonts help. Results stay close, but check complex decks.' },
      { q: 'Animations?', a: 'Static rendering; animations are not preserved in PDF.' },
    ],
    features: ['Local rendering', 'Slide range', 'Layout fidelity focus'],
  },
  {
    slug: 'docx-to-pptx',
    name: 'DOCX to PPTX',
    description: 'Turn Word docs into slides quickly, on-device.',
    accentClass: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    badgeClass: 'text-indigo-700 bg-indigo-100',
    buttonClass: 'from-indigo-600 to-indigo-500',
    icon: Presentation01Icon,
    keywords: ['word to ppt', 'docx to pptx', 'doc to ppt'],
    metaTitle: 'DOCX to PPTX – create slides locally | docXform',
    metaDescription: 'Generate PPTX slides from Word on-device. No uploads, privacy-first, fast outline-to-slides.',
    howToSteps: [
      'Open DOCX to PPTX and add your document',
      'Pick an outline style (headings to slides)',
      'Click Process locally to build slides in-browser',
      'Download the PPTX',
    ],
    faqs: [
      { q: 'Is my doc uploaded?', a: 'No. Conversion runs locally; content stays on your device.' },
      { q: 'How are slides formed?', a: 'Headings become slides; body text becomes bullets. Review complex formatting after export.' },
      { q: 'Images?', a: 'Inline images are placed on related slides when possible.' },
    ],
    features: ['Heading-to-slide mapping', 'Local-only processing', 'Inline images when possible'],
  },
  {
    slug: 'docx-scrub',
    name: 'DOCX Metadata Scrub',
    description: 'Strip comments and properties for clean shareable docs.',
    accentClass: 'bg-slate-50 text-slate-700 border-slate-200',
    badgeClass: 'text-slate-700 bg-slate-200',
    buttonClass: 'from-slate-700 to-slate-600',
    icon: Shield01Icon,
    keywords: ['remove metadata', 'clean docx', 'strip comments'],
    metaTitle: 'DOCX Metadata Scrub – clean docs locally | docXform',
    metaDescription: 'Remove comments and metadata from DOCX on-device. Keep privacy, ship clean files.',
    howToSteps: [
      'Open DOCX Scrub and add your DOCX',
      'Choose what to remove (comments, properties)',
      'Click Process locally to scrub in-browser',
      'Download the cleaned DOCX',
    ],
    faqs: [
      { q: 'Is my DOCX uploaded?', a: 'No. Scrubbing runs locally; nothing leaves your device.' },
      { q: 'What is removed?', a: 'Comments, document properties, and revision marks when present.' },
      { q: 'Does layout change?', a: 'Content stays; tracked changes removal may accept changes—review before sharing.' },
    ],
    features: ['Remove comments/properties', 'Local privacy', 'Share-ready output'],
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolDefinitions.find((t) => t.slug === slug);
}
