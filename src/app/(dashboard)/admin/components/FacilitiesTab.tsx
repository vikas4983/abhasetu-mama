/**
 * @file        FacilitiesTab.tsx
 * @description MUI facility registry — approve, reject, block, view insights
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import InsightsIcon from "@mui/icons-material/Insights";
import { showToast } from "../../../../utils/toast";
import { useConfirmDialog } from "../../../../components/stakeholder/ConfirmDialogProvider";
import * as api from "../admin.api";
import { blockFacility } from "../../../../lib/stakeholder/stakeholder-ops.api";
import FacilityInsightsDialog from "./FacilityInsightsDialog";

interface Facility {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface Props {
  token: string;
}

const statusColor = (s: string) => {
  if (s === "approved") return "success";
  if (s === "pending") return "warning";
  if (s === "blocked") return "error";
  return "default";
};

export default function FacilitiesTab({ token }: Props) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filter, setFilter] = useState("pending");
  const [insightsId, setInsightsId] = useState<number | null>(null);
  const { confirm } = useConfirmDialog();

  const load = () => {
    api.fetchFacilities(token, { status: filter }).then((d) => {
      if (d.facilities) setFacilities(d.facilities);
    });
  };

  useEffect(() => {
    load();
  }, [token, filter]);

  const setStatus = async (f: Facility, status: string) => {
    const ok = await confirm({
      title:
        status === "approved" ? "Approve facility?" : "Reject registration?",
      message: `${f.name} (${f.email}) will be marked as ${status}.`,
      confirmLabel: status === "approved" ? "Approve" : "Reject",
      severity: status === "rejected" ? "error" : "warning",
    });
    if (!ok) return;
    const res = await api.updateFacilityStatus(token, f.id, status);
    showToast(res.message || "Updated", res.status !== "success");
    load();
  };

  const handleBlock = async (f: Facility) => {
    const ok = await confirm({
      title: "Block facility urgently?",
      message: `${f.name} will lose access immediately. Use only for compliance or security incidents.`,
      confirmLabel: "Block now",
      severity: "error",
    });
    if (!ok) return;
    const res = await blockFacility(token, f.id);
    showToast(res.message || "Facility blocked", res.status !== "success");
    load();
  };

  return (
    <>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
        Stakeholder facilities
      </Typography>

      <FormControl size="small" sx={{ mb: 2, minWidth: 160 }}>
        <InputLabel id="facility-filter">Status</InputLabel>
        <Select
          labelId="facility-filter"
          label="Status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="blocked">Blocked</MenuItem>
        </Select>
      </FormControl>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {facilities.map((f) => (
            <TableRow key={f.id} hover>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.email}</TableCell>
              <TableCell>{f.role.replace(/_/g, " ")}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={f.status}
                  color={
                    statusColor(f.status) as
                      | "success"
                      | "warning"
                      | "error"
                      | "default"
                  }
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0} sx={{ justifyContent: 'flex-end' }}>
                  <Tooltip title="View insights">
                    <IconButton
                      size="small"
                      aria-label={`Insights ${f.name}`}
                      onClick={() => setInsightsId(f.id)}
                    >
                      <InsightsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {f.status === "pending" && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          onClick={() => setStatus(f, "approved")}
                        >
                          <CheckIcon fontSize="small" color="success" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          onClick={() => setStatus(f, "rejected")}
                        >
                          <CloseIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {f.status !== "blocked" && f.status === "approved" && (
                    <Tooltip title="Block urgently">
                      <IconButton size="small" onClick={() => handleBlock(f)}>
                        <BlockIcon fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <FacilityInsightsDialog
        open={!!insightsId}
        facilityId={insightsId}
        token={token}
        onClose={() => setInsightsId(null)}
      />
    </>
  );
}
