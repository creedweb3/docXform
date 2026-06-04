'use client';



import {

  createContext,

  useContext,

  useEffect,

  useLayoutEffect,

  useMemo,

  useState,

  type Dispatch,

  type ReactNode,

  type SetStateAction,

} from 'react';

import type { ConversionFlowFile, ConversionFlowStage } from '@/lib/conversion-flow';
import type { DuplicateIntakeContent } from '@/lib/queue-duplicate-keys';



export type ConversionFlowRegistration = {

  stage: ConversionFlowStage;

  files: ConversionFlowFile[];

  outputLabel: string;

  zipName?: string;

  busy: boolean;

  isBulkDownload: boolean;

  onDownloadAll: () => void | Promise<void>;

  onDownloadFile: (output: { name: string; blob: Blob }) => void;

  onReset: () => void;

  /** When false, output actions show “Start again” instead of “Add more files” (single-file tools). */
  allowAddMoreFiles: boolean;

  onOpenFilePicker?: () => void;

  duplicatePrompt?: { content: DuplicateIntakeContent } | null;

  onSkipDuplicates?: () => void;

  onAddDuplicates?: () => void;

};



type ConversionFlowMeta = {

  productTitle: string;

  productPath: string;

};



type ConversionFlowState = {

  stage: ConversionFlowStage;

  registration: ConversionFlowRegistration | null;

};



type ConversionFlowContextValue = ConversionFlowMeta &

  ConversionFlowState & {

    setRegistration: Dispatch<SetStateAction<ConversionFlowRegistration | null>>;

  };



const ConversionFlowMetaContext = createContext<ConversionFlowMeta | null>(null);

const ConversionFlowStateContext = createContext<ConversionFlowState | null>(null);

const ConversionFlowDispatchContext =

  createContext<Dispatch<SetStateAction<ConversionFlowRegistration | null>> | null>(null);



export function ConversionFlowProvider({

  productTitle,

  productPath,

  children,

}: {

  productTitle: string;

  productPath: string;

  children: ReactNode;

}) {

  const [registration, setRegistration] = useState<ConversionFlowRegistration | null>(null);

  const stage = registration?.stage ?? 'pick';



  const meta = useMemo(

    () => ({ productTitle, productPath }),

    [productTitle, productPath]

  );



  const state = useMemo(

    () => ({

      stage,

      registration,

    }),

    [stage, registration]

  );



  return (

    <ConversionFlowMetaContext.Provider value={meta}>

      <ConversionFlowDispatchContext.Provider value={setRegistration}>

        <ConversionFlowStateContext.Provider value={state}>{children}</ConversionFlowStateContext.Provider>

      </ConversionFlowDispatchContext.Provider>

    </ConversionFlowMetaContext.Provider>

  );

}



/** Shell and output views — re-renders when flow stage/registration changes. */

export function useConversionFlow(): ConversionFlowContextValue | null {

  const meta = useContext(ConversionFlowMetaContext);

  const flowState = useContext(ConversionFlowStateContext);

  const setRegistration = useContext(ConversionFlowDispatchContext);

  if (!meta || !flowState || !setRegistration) return null;

  return { ...meta, ...flowState, setRegistration };

}



/** Workspace hooks — stable across registration updates (avoids sync feedback loops). */

export function useConversionFlowWorkspace() {

  const meta = useContext(ConversionFlowMetaContext);

  const setRegistration = useContext(ConversionFlowDispatchContext);

  return {

    flowActive: meta != null,

    setRegistration,

  };

}



/** Workspace registers pick/studio/output state for the product shell. */

export function useSyncConversionFlow(registration: ConversionFlowRegistration | null) {

  const setRegistration = useConversionFlowWorkspace().setRegistration;



  useLayoutEffect(() => {

    if (!setRegistration) return;

    setRegistration(registration);

  }, [setRegistration, registration]);



  useEffect(() => {

    if (!setRegistration) return;

    return () => setRegistration(null);

  }, [setRegistration]);

}


