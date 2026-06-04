/** Normalized filenames that appear more than once in a batch queue. */
export function queueDuplicateNameKeys<T extends { file: File }>(items: T[]): Set<string> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = item.file.name.trim().toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const dupes = new Set<string>();
  for (const [key, count] of counts) {
    if (count > 1) dupes.add(key);
  }
  return dupes;
}

/** Item ids for duplicate copies — first queued file per name stays original. */
export function queueDuplicateCopyIds<T extends { id: string; file: File }>(items: T[]): Set<string> {
  const seen = new Set<string>();
  const duplicateCopyIds = new Set<string>();
  for (const item of items) {
    const key = item.file.name.trim().toLowerCase();
    if (seen.has(key)) {
      duplicateCopyIds.add(item.id);
    } else {
      seen.add(key);
    }
  }
  return duplicateCopyIds;
}

export function isQueueDuplicateCopy(id: string, duplicateCopyIds: Set<string>): boolean {
  return duplicateCopyIds.has(id);
}

/** Keep first queued file per name; drop later copies. */
export function withoutQueueDuplicateCopies<T extends { id: string; file: File }>(items: T[]): T[] {
  const duplicateCopyIds = queueDuplicateCopyIds(items);
  if (duplicateCopyIds.size === 0) return items;
  return items.filter((item) => !duplicateCopyIds.has(item.id));
}

/** Structured copy for the duplicate-intake banner. */
export type DuplicateIntakeContent = {
  headline: string;
  /** Filenames when 1–2 duplicates. */
  names?: string[];
};

/** Duplicate-name prompt when adding files. */
export function duplicateIntakeContent(files: File[]): DuplicateIntakeContent {
  const count = files.length;
  const uniqueNames = Array.from(new Set(files.map((file) => file.name)));
  const fileWord = count === 1 ? 'file' : 'files';
  const headline = `Detected ${count} duplicate ${fileWord}. Add again or skip?`;

  let names: string[] | undefined;
  if (count === 1) {
    names = [uniqueNames[0]];
  } else if (count === 2) {
    names = uniqueNames.length === 2 ? uniqueNames : [uniqueNames[0]];
  }

  return {
    headline,
    names,
  };
}
