/**
 * @file        chartSetup.ts
 * @description Client-only mount gate for Chart.js canvas rendering
 * @module      stakeholder/charts
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * @description Defer canvas render until after client hydration (Chart.js needs DOM)
 * @returns {boolean} true when safe to render react-chartjs-2 components
 */
export function useChartReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}
