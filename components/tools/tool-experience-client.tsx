'use client';

import { ToolExperience } from '@/components/tools/tool-experience';
import {
  DocxScrubTool,
  DocxToPptxTool,
  ImagesToPdfTool,
  PdfCompressTool,
  PdfMergeTool,
  PdfOrganizeTool,
  PdfRotateTool,
  PdfSplitTool,
  PdfToImagesTool,
  PdfToTextTool,
  PdfUnlockTool,
  PdfWatermarkTool,
  PptxToPdfTool,
} from '@/components/tools';
import type { ToolDefinition } from '@/lib/tools';

type Props = { tool: ToolDefinition };

export function ToolExperienceClient({ tool }: Props) {
  const workspace = (() => {
    switch (tool.slug) {
      case 'pdf-merge':
        return <PdfMergeTool />;
      case 'pdf-split':
        return <PdfSplitTool />;
      case 'pdf-compress':
        return <PdfCompressTool />;
      case 'pdf-to-images':
        return <PdfToImagesTool />;
      case 'images-to-pdf':
        return <ImagesToPdfTool />;
      case 'pptx-to-pdf':
        return <PptxToPdfTool />;
      case 'docx-to-pptx':
        return <DocxToPptxTool />;
      case 'docx-scrub':
        return <DocxScrubTool />;
      case 'pdf-rotate':
        return <PdfRotateTool />;
      case 'pdf-organize':
        return <PdfOrganizeTool />;
      case 'pdf-watermark':
        return <PdfWatermarkTool />;
      case 'pdf-unlock':
        return <PdfUnlockTool />;
      case 'pdf-to-text':
        return <PdfToTextTool />;
      default:
        return null;
    }
  })();

  return <ToolExperience tool={tool} workspace={workspace ?? undefined} />;
}
