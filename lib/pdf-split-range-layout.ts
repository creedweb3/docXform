/**
 * Pack range preview cards into a 3-column grid (see computeRangeCardColSpans).
 */

export type RangeCardColSpan = 1 | 2 | 3;

/**
 * Pack range cards into a 3-column grid (row combos: 1+1+1, 1+2, 2+1, full-row multi, etc.):
 * - up to three single-page ranges per row
 * - one single + one multi per row when columns allow (1+2 or 2+1 by list order)
 * - lone multi: full row (3) unless the next range is a single — then 2+1 on a new row (even after another multi)
 * - two multi ranges never share a row
 */
export function computeRangeCardColSpans(groups: number[][]): RangeCardColSpan[] {
  const spans: RangeCardColSpan[] = [];
  let col = 0;

  const isSingle = (i: number) => groups[i].length === 1;
  const isMulti = (i: number) => groups[i].length > 1;

  for (let gi = 0; gi < groups.length; gi++) {
    if (isSingle(gi)) {
      if (col >= 3) col = 0;
      spans.push(1);
      col += 1;
      if (col >= 3) col = 0;
      continue;
    }

    const prevSingle = gi > 0 && isSingle(gi - 1);
    const nextSingle = gi < groups.length - 1 && isSingle(gi + 1);
    const prevMulti = gi > 0 && isMulti(gi - 1);

    /** Same-row 1+2 only (single already placed on this row). 2+1 uses nextSingle in the else branch. */
    const canPairOnRow =
      col > 0 && col + 2 <= 3 && prevSingle && !prevMulti;

    if (canPairOnRow) {
      spans.push(2);
      col += 2;
    } else {
      if (col > 0) col = 0;
      if (nextSingle) {
        spans.push(2);
        col = 2;
      } else {
        spans.push(3);
        col = 3;
      }
    }
    if (col >= 3) col = 0;
  }

  return spans;
}

/** Build groups from a pattern string: `s` = single page, `m` = multi (2 pages). */
export function groupsFromPattern(pattern: string): number[][] {
  return [...pattern].map((c) => (c === 's' ? [1] : [1, 2]));
}

/** Row layout signature from col spans, e.g. `1+1 | 2+1`. */
export function rowPatternFromSpans(spans: RangeCardColSpan[]): string {
  const rows: string[] = [];
  let col = 0;
  let parts: string[] = [];

  const flush = () => {
    if (parts.length > 0) {
      rows.push(parts.join('+'));
      parts = [];
    }
  };

  for (const span of spans) {
    if (col + span > 3) {
      flush();
      col = 0;
    }
    parts.push(String(span));
    col += span;
    if (col >= 3) {
      flush();
      col = 0;
    }
  }
  flush();
  return rows.join(' | ');
}

/** Indices of range cards in a 1+1+empty row (two singles, third column unused). */
export function pairSingleWideIndices(spans: RangeCardColSpan[]): Set<number> {
  const wide = new Set<number>();
  let col = 0;
  let rowIndices: number[] = [];

  const flushRow = () => {
    if (rowIndices.length === 2 && rowIndices.every((i) => spans[i] === 1)) {
      for (const i of rowIndices) wide.add(i);
    }
    rowIndices = [];
  };

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    if (col + span > 3) {
      flushRow();
      col = 0;
    }
    rowIndices.push(i);
    col += span;
    if (col >= 3) {
      flushRow();
      col = 0;
    }
  }
  if (rowIndices.length > 0) flushRow();

  return wide;
}

/** Map logical 3-column spans onto a 6-column preview grid. */
export function rangeCardGridColSpan(
  logical: RangeCardColSpan,
  widePairSingle: boolean
): 2 | 3 | 4 | 6 {
  if (logical === 1) return widePairSingle ? 3 : 2;
  if (logical === 2) return 4;
  return 6;
}
