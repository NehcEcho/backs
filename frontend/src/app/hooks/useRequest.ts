import { useCallback, useState } from "react";
import type { RequestResult } from "@/app/types";

export function useRequest<T>() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RequestResult<T> | null>(null);

  const run = useCallback(async (executor: () => Promise<RequestResult<T>>) => {
    setLoading(true);
    try {
      const response = await executor();
      setResult(response);
      return response;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, result, setResult, run };
}
