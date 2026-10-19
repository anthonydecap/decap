"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { errorMessage } from "../../api";

/** Busy + error state around one mutation, refreshing server data on success. */
export function useMutation() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (fn: () => Promise<unknown>): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        await fn();
        router.refresh();
        return true;
      } catch (e) {
        setError(errorMessage(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  return { busy, error, setError, run };
}
