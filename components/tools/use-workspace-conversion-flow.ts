'use client';

import { useMemo } from 'react';
import {
  useConversionFlowWorkspace,
  useSyncConversionFlow,
  type ConversionFlowRegistration,
} from '@/components/tools/conversion-flow-provider';
import { deriveConversionFlowStage } from '@/lib/conversion-flow';
import type { DuplicateIntakeContent } from '@/lib/queue-duplicate-keys';

type WorkspaceFlowFile = {
  id: string;
  file: { name: string; size: number };
  status: string;
  message?: string;
  outputs?: Array<{ name: string; blob: Blob }>;
};

function statusLabelForFlow(file: WorkspaceFlowFile): string {
  if (file.status === 'done') return 'Done';
  if (file.status === 'processing') return file.message ?? 'Processing';
  if (file.status === 'failed') return 'Failed';
  if (file.status === 'validating') return 'Checking';
  return 'Ready';
}

type UseWorkspaceConversionFlowArgs = {
  files: WorkspaceFlowFile[];
  allDone: boolean;
  hasOutputs: boolean;
  busy: boolean;
  outputLabel: string;
  zipName?: string;
  isBulkDownload: boolean;
  onDownloadAll: () => void | Promise<void>;
  onDownloadFile: (output: { name: string; blob: Blob }) => void;
  onReset: () => void;
  allowAddMoreFiles?: boolean;
  onOpenFilePicker?: () => void;
  duplicatePrompt?: { content: DuplicateIntakeContent } | null;
  onSkipDuplicates?: () => void;
  onAddDuplicates?: () => void;
};

export function useWorkspaceConversionFlow(args: UseWorkspaceConversionFlowArgs) {
  const { flowActive } = useConversionFlowWorkspace();

  const stage = deriveConversionFlowStage({
    fileCount: args.files.length,
    allDone: args.allDone,
    hasOutputs: args.hasOutputs,
    busy: args.busy,
  });

  const registration = useMemo((): ConversionFlowRegistration | null => {
    if (!flowActive) return null;
    return {
      stage,
      files: args.files.map((f) => ({
        id: f.id,
        name: f.file.name,
        size: f.file.size,
        statusLabel: statusLabelForFlow(f),
        outputs: f.outputs,
      })),
      outputLabel: args.outputLabel,
      zipName: args.zipName,
      busy: args.busy,
      isBulkDownload: args.isBulkDownload,
      onDownloadAll: args.onDownloadAll,
      onDownloadFile: args.onDownloadFile,
      onReset: args.onReset,
      allowAddMoreFiles: args.allowAddMoreFiles ?? true,
      onOpenFilePicker: args.onOpenFilePicker,
      duplicatePrompt: args.duplicatePrompt,
      onSkipDuplicates: args.onSkipDuplicates,
      onAddDuplicates: args.onAddDuplicates,
    };
  }, [
    flowActive,
    stage,
    args.files,
    args.busy,
    args.outputLabel,
    args.zipName,
    args.isBulkDownload,
    args.onDownloadAll,
    args.onDownloadFile,
    args.onReset,
    args.allowAddMoreFiles,
    args.onOpenFilePicker,
    args.duplicatePrompt,
    args.onSkipDuplicates,
    args.onAddDuplicates,
  ]);

  useSyncConversionFlow(registration);
  const showPick = !flowActive || stage === 'pick';
  const showStudio = flowActive && stage === 'studio';
  const showOutput = flowActive && stage === 'output';

  return { flowActive, stage, showPick, showStudio, showOutput };
}
