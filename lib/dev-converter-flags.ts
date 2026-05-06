/**
 * Opt-in diagnostics for converter load (large WASM). Never enable in production UX by default.
 */
export function showDevConverterLoadOverlay(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_DEV_CONVERTER_PROGRESS === '1'
  );
}
