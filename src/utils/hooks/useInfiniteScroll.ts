'use client';

import { useState, useEffect, useCallback } from 'react';

export function useInfiniteScroll<T>(
  allItems: T[],
  options: {
    initialSize?: number;
    loadSize?: number;
    simulatedDelay?: number;
  } = {}
) {
  const { initialSize = 5, loadSize = 5, simulatedDelay = 600 } = options;

  const [visibleCount, setVisibleCount] = useState(initialSize);
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync visible items when allItems changes
  useEffect(() => {
    setVisibleItems(allItems.slice(0, visibleCount));
  }, [allItems, visibleCount]);

  const hasMore = visibleCount < allItems.length;

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore || error) return;

    setIsLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      // Small chance of simulated network glitch to test error boundaries
      const shouldGlitch = Math.random() < 0.05; // 5% chance of error
      if (shouldGlitch) {
        setError('Simulated network error. Please try again.');
        setIsLoading(false);
        return;
      }

      setVisibleCount((prev) => {
        const next = Math.min(prev + loadSize, allItems.length);
        return next;
      });
      setIsLoading(false);
    }, simulatedDelay);
  }, [isLoading, hasMore, error, allItems.length, loadSize, simulatedDelay]);

  const retry = useCallback(() => {
    setError(null);
    loadMore();
  }, [loadMore]);

  const reset = useCallback(() => {
    setVisibleCount(initialSize);
    setError(null);
    setIsLoading(false);
  }, [initialSize]);

  return {
    visibleItems,
    hasMore,
    isLoading,
    loadMore,
    error,
    retry,
    reset,
  };
}
