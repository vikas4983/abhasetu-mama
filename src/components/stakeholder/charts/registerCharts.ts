/**
 * @file        registerCharts.ts
 * @description Side-effect Chart.js registration — import BEFORE react-chartjs-2
 * @module      stakeholder/charts
 * @layer       util
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);
