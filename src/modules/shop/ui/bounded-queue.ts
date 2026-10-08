/**
 * Bounded-concurrency work queue. A user may select hundreds of files; at most
 * `concurrency` workers run at once. Failures are reported per item and never stop the rest.
 */
export type QueueResult<T> = { item: T; ok: true } | { item: T; ok: false; error: unknown };

export async function runBoundedQueue<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
  opts: { signal?: AbortSignal; onSettled?: (r: QueueResult<T>) => void } = {},
): Promise<QueueResult<T>[]> {
  const limit = Math.max(1, Math.min(Math.floor(concurrency) || 1, 16));
  const results: QueueResult<T>[] = new Array(items.length);
  let next = 0;

  async function lane() {
    for (;;) {
      if (opts.signal?.aborted) return;
      const index = next++;
      if (index >= items.length) return;
      const item = items[index]!;
      try {
        await worker(item, index);
        results[index] = { item, ok: true };
      } catch (error) {
        results[index] = { item, ok: false, error };
      }
      opts.onSettled?.(results[index]!);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, lane));
  return results.filter(Boolean);
}
