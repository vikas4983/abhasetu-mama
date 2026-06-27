/**
 * @file        BedSelector.tsx
 * @description BookMyShow-style bed availability grid for hospitals
 * @module      stakeholder/ops
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import { useConfirmDialog } from "../ConfirmDialogProvider";

export interface Bed {
  id: string;
  ward: string;
  status: "available" | "occupied" | "maintenance";
  patient: string | null;
}

const STATUS_COLOR = {
  available: "#22c55e",
  occupied: "#ef4444",
  maintenance: "#94a3b8",
};

export default function BedSelector({
  beds,
  onChange,
}: {
  beds: Bed[];
  onChange: (beds: Bed[]) => void;
}) {
  const { confirm } = useConfirmDialog();
  const wards = useMemo(() => [...new Set(beds.map((b) => b.ward))], [beds]);
  const [ward, setWard] = useState(wards[0] || "All");
  const filtered = ward === "All" ? beds : beds.filter((b) => b.ward === ward);

  const counts = {
    available: beds.filter((b) => b.status === "available").length,
    occupied: beds.filter((b) => b.status === "occupied").length,
    maintenance: beds.filter((b) => b.status === "maintenance").length,
  };

  const cycleStatus = async (bed: Bed) => {
    const next =
      bed.status === "available"
        ? "occupied"
        : bed.status === "occupied"
          ? "maintenance"
          : "available";
    const ok = await confirm({
      title: `Update bed ${bed.id}?`,
      message: `Change status from ${bed.status} to ${next}?`,
      confirmLabel: "Update",
      severity: "warning",
    });
    if (!ok) return;
    onChange(
      beds.map((b) =>
        b.id === bed.id
          ? {
              ...b,
              status: next,
              patient: next === "occupied" ? b.patient || "Walk-in" : null,
            }
          : b,
      ),
    );
  };

  return (
    <Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
      >
        <Chip
          label={`${counts.available} available`}
          size="small"
          sx={{ bgcolor: STATUS_COLOR.available, color: "#fff" }}
        />
        <Chip
          label={`${counts.occupied} occupied`}
          size="small"
          sx={{ bgcolor: STATUS_COLOR.occupied, color: "#fff" }}
        />
        <Chip
          label={`${counts.maintenance} maintenance`}
          size="small"
          sx={{ bgcolor: STATUS_COLOR.maintenance, color: "#fff" }}
        />
      </Stack>

      <ToggleButtonGroup
        size="small"
        value={ward}
        exclusive
        onChange={(_, v) => v && setWard(v)}
        sx={{ mb: 2, flexWrap: "wrap" }}
      >
        <ToggleButton value="All">All wards</ToggleButton>
        {wards.map((w) => (
          <ToggleButton key={w} value={w}>
            {w}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Card variant="outlined">
        <CardContent>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1.5 }}
          >
            Tap a bed to cycle status — green available · red occupied · grey
            maintenance
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))",
              gap: 1,
            }}
          >
            {filtered.map((bed) => (
              <Tooltip
                key={bed.id}
                title={`${bed.id} · ${bed.ward}${bed.patient ? ` · ${bed.patient}` : ""}`}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={() => cycleStatus(bed)}
                  aria-label={`Bed ${bed.id}, ${bed.status}`}
                  sx={{
                    aspectRatio: "1",
                    border: "2px solid",
                    borderColor: STATUS_COLOR[bed.status],
                    bgcolor: `${STATUS_COLOR[bed.status]}22`,
                    borderRadius: 1.5,
                    cursor: "pointer",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "text.primary",
                    "&:hover": { transform: "scale(1.05)" },
                    transition: "transform 0.15s",
                  }}
                >
                  {bed.id.replace("B-", "")}
                </Box>
              </Tooltip>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
