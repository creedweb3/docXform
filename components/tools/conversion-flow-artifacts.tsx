'use client';

import type { ConversionFlowFile } from '@/lib/conversion-flow';
import {
  StudioFlowArtifactsPane,
  type StudioFlowArtifactFile,
} from '@/components/tools/studio/studio-flow-artifacts-pane';

/** Maps flow registration files into {@link StudioFlowArtifactsPane} (split-style output). */
export function ConversionFlowArtifactsPanel({
  files,
  onDownloadFile,
}: {
  files: ConversionFlowFile[];
  onDownloadFile: (output: StudioFlowArtifactFile) => void;
}) {
  const groups = files.map((file) => ({
    id: file.id,
    sourceName: file.name,
    sourceSize: file.size,
    statusLabel: file.statusLabel,
    files: (file.outputs ?? []).map((output) => ({
      name: output.name,
      blob: output.blob,
    })),
  }));

  return <StudioFlowArtifactsPane groups={groups} onDownload={onDownloadFile} />;
}
