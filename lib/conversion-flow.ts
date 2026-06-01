export type ConversionFlowStage = 'pick' | 'studio' | 'output';

export type ConversionFlowOutput = {
  name: string;
  blob: Blob;
};

export type ConversionFlowFile = {
  id: string;
  name: string;
  size: number;
  statusLabel: string;
  outputs?: ConversionFlowOutput[];
};

export function deriveConversionFlowStage(input: {
  fileCount: number;
  allDone: boolean;
  hasOutputs: boolean;
  busy: boolean;
}): ConversionFlowStage {
  if (input.fileCount === 0) return 'pick';
  if (input.allDone && input.hasOutputs && !input.busy) return 'output';
  return 'studio';
}
