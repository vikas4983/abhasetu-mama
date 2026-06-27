/**
 * @file        useStakeholderOps.ts
 * @description Hook to load/save facility operations data
 * @module      stakeholder
 * @layer       hook
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import { fetchStakeholderOps, saveStakeholderOps } from "@/lib/stakeholder/stakeholder-ops.api";
import { useCallback, useEffect, useState } from "react";

export function useStakeholderOps<T extends object = Record<string, unknown>>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken") || ""
      : "";

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchStakeholderOps(token);
      if (res.status === "success") setData(res.data as T);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (next: T) => {
    const res = await saveStakeholderOps(token, next as Record<string, unknown>);
    if (res.status === "success") setData(next);
    return res;
  };

  return { data, setData, loading, save, reload: load, token };
}
