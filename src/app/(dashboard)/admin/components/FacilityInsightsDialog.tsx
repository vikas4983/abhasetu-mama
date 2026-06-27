/**
 * @file        FacilityInsightsDialog.tsx
 * @description Admin modal — facility ops insights with Chart.js
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { fetchFacilityInsights } from "@/lib/stakeholder/stakeholder-ops.api";
import { STAKEHOLDER_ROLE_LABELS } from "@/constants/stakeholder.constants";
import {
  StakeholderBarChart,
  StakeholderDoughnutChart,
} from "@/components/stakeholder/charts/StakeholderCharts";

interface Props {
  open: boolean;
  facilityId: number | null;
  token: string;
  onClose: () => void;
}

export default function FacilityInsightsDialog({
  open,
  facilityId,
  token,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<{
    facility: { name: string; email: string; role: string; status: string };
    charts: Record<
      string,
      | { labels?: string[]; values?: number[] }
      | { label: string; value: number }[]
    >;
  } | null>(null);

  useEffect(() => {
    if (!open || !facilityId || !token) return;
    setLoading(true);
    fetchFacilityInsights(token, facilityId)
      .then((res) => {
        if (res.status === "success") setPayload(res);
      })
      .finally(() => setLoading(false));
  }, [open, facilityId, token]);

  const charts = payload?.charts || {};
  const bedStatus = charts.bedStatus as
    | { labels: string[]; values: number[] }
    | undefined;
  const bloodGroups = charts.bloodGroups as
    | { label: string; value: number }[]
    | undefined;
  const topTests = charts.topTests as
    | { label: string; value: number }[]
    | undefined;
  const stockLevels = charts.stockLevels as
    | { label: string; value: number }[]
    | undefined;
  const apptStatus = charts.appointmentStatus as
    | { labels: string[]; values: number[] }
    | undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="facility-insights-title"
    >
      <DialogTitle id="facility-insights-title">
        Facility insights
        {payload?.facility && (
          <Typography variant="body2" color="text.secondary">
            {payload.facility.name} ·{" "}
            {STAKEHOLDER_ROLE_LABELS[payload.facility.role] ||
              payload.facility.role}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}
        {!loading && payload && (
          <>
            <Chip
              label={payload.facility.status}
              size="small"
              sx={{ mb: 2 }}
              color={
                payload.facility.status === "blocked" ? "error" : "default"
              }
            />
            <Grid container spacing={2}>
              {bedStatus && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <StakeholderDoughnutChart
                    title="Bed status"
                    series={{
                      labels: bedStatus.labels,
                      values: bedStatus.values,
                    }}
                  />
                </Grid>
              )}
              {bloodGroups && bloodGroups.length > 0 && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <StakeholderBarChart
                    title="Blood bank"
                    series={{
                      labels: bloodGroups.map((b) => b.label),
                      values: bloodGroups.map((b) => b.value),
                    }}
                    horizontal
                  />
                </Grid>
              )}
              {topTests && topTests.length > 0 && (
                <Grid size={12}>
                  <StakeholderBarChart
                    title="Test bookings"
                    series={{
                      labels: topTests.map((t) => t.label),
                      values: topTests.map((t) => t.value),
                    }}
                  />
                </Grid>
              )}
              {stockLevels && stockLevels.length > 0 && (
                <Grid size={12}>
                  <StakeholderBarChart
                    title="Pharmacy stock"
                    series={{
                      labels: stockLevels.map((s) => s.label),
                      values: stockLevels.map((s) => s.value),
                    }}
                  />
                </Grid>
              )}
              {apptStatus && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <StakeholderDoughnutChart
                    title="Appointments"
                    series={{
                      labels: apptStatus.labels,
                      values: apptStatus.values,
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
