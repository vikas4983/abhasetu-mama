/**
 * @file        HospitalOpsPages.tsx
 * @description Hospital beds, appointments, staff, blood bank management
 * @module      stakeholder/ops
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Stack,
  Switch,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import BedSelector, { Bed } from "./BedSelector";
import { useStakeholderOps } from "@/hooks/useStakeholderOps";
import { useConfirmDialog } from "../ConfirmDialogProvider";
import { showToast } from "@/utils/toast";

interface HospitalOps {
  beds: Bed[];
  appointments: {
    id: string;
    patient: string;
    abha: string;
    doctor: string;
    slot: string;
    status: string;
    type: string;
  }[];
  staff: {
    id: string;
    name: string;
    role: string;
    dept: string;
    available: boolean;
    slots: string[];
  }[];
  bloodBank: {
    component: string;
    group: string;
    units: number;
    demand: string;
  }[];
}

function OpsShell({
  title,
  description,
  children,
  onSave,
  saving,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
}) {
  return (
    <Box>
      <Stack
        direction="row"
        sx={{ mb: 2, flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 640 }}
          >
            {description}
          </Typography>
        </Box>
        {onSave && (
          <Button variant="contained" onClick={onSave} disabled={saving}>
            Save changes
          </Button>
        )}
      </Stack>
      {children}
    </Box>
  );
}

export function HospitalBedsPage() {
  const { data, setData, loading, save } = useStakeholderOps<HospitalOps>();
  const { confirm } = useConfirmDialog();

  const handleSave = async () => {
    if (!data) return;
    const ok = await confirm({
      title: "Save bed map?",
      message:
        "Updated bed availability will reflect in insights and admin monitoring.",
      confirmLabel: "Save",
    });
    if (!ok) return;
    const res = await save(data);
    showToast(res.message || "Saved", res.status !== "success");
  };

  if (loading || !data) return <Typography>Loading beds…</Typography>;

  return (
    <OpsShell
      title="Bed availability"
      description="BookMyShow-style ward map — tap beds to mark available, occupied, or under maintenance."
      onSave={handleSave}
    >
      <BedSelector
        beds={data.beds}
        onChange={(beds) => setData({ ...data, beds })}
      />
    </OpsShell>
  );
}

export function HospitalAppointmentsPage() {
  const { data, setData, loading, save } = useStakeholderOps<HospitalOps>();
  const { confirm } = useConfirmDialog();

  const setStatus = async (id: string, status: string) => {
    const ok = await confirm({
      title: "Update appointment?",
      message: `Mark appointment ${id} as ${status}?`,
      confirmLabel: "Confirm",
      severity: "warning",
    });
    if (!ok || !data) return;
    const next = {
      ...data,
      appointments: data.appointments.map((a) =>
        a.id === id ? { ...a, status } : a,
      ),
    };
    setData(next);
    await save(next);
    showToast("Appointment updated", false);
  };

  if (loading || !data) return <Typography>Loading appointments…</Typography>;

  return (
    <OpsShell
      title="Appointments"
      description="Manage OPD bookings — approve, reject, or reschedule."
    >
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Slot</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.appointments.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>
                  {a.patient}
                  <Typography variant="caption" sx={{ display: 'block' }} color="text.secondary">
                    {a.abha}
                  </Typography>
                </TableCell>
                <TableCell>{a.doctor}</TableCell>
                <TableCell>{a.slot}</TableCell>
                <TableCell>{a.type}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={a.status}
                    color={a.status === "confirmed" ? "success" : "warning"}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    aria-label="Approve"
                    onClick={() => setStatus(a.id, "confirmed")}
                  >
                    <CheckIcon fontSize="small" color="success" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Reject"
                    onClick={() => setStatus(a.id, "rejected")}
                  >
                    <CloseIcon fontSize="small" color="error" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label="Reschedule"
                    onClick={() => setStatus(a.id, "rescheduled")}
                  >
                    <EventRepeatIcon fontSize="small" color="primary" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </OpsShell>
  );
}

export function HospitalStaffPage() {
  const { data, setData, loading, save } = useStakeholderOps<HospitalOps>();

  const toggle = async (id: string) => {
    if (!data) return;
    const next = {
      ...data,
      staff: data.staff.map((s) =>
        s.id === id ? { ...s, available: !s.available } : s,
      ),
    };
    setData(next);
    await save(next);
  };

  if (loading || !data) return <Typography>Loading staff…</Typography>;

  return (
    <OpsShell
      title="Staff & availability"
      description="Doctors, nurses, lab technicians, and front-desk — toggle on-duty status and view slots."
    >
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Slots</TableCell>
              <TableCell>On duty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.staff.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell>{s.name}</TableCell>
                <TableCell>
                  <Chip size="small" label={s.role} variant="outlined" />
                </TableCell>
                <TableCell>{s.dept}</TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {s.slots.join(", ") || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={s.available}
                    onChange={() => toggle(s.id)}
                    aria-label={`${s.name} availability`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </OpsShell>
  );
}

export function HospitalBloodBankPage() {
  const { data, loading } = useStakeholderOps<HospitalOps>();

  if (loading || !data) return <Typography>Loading blood bank…</Typography>;

  const demandColor = (d: string) =>
    d === "high" ? "error" : d === "rare" ? "secondary" : "default";

  return (
    <OpsShell
      title="Blood bank"
      description="Whole blood, platelets, PRP, FFP and rare groups — units and demand tracked for insights."
    >
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Component</TableCell>
              <TableCell>Group</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Demand</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.bloodBank.map((b, i) => (
              <TableRow key={`${b.component}-${b.group}-${i}`} hover>
                <TableCell>{b.component}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={b.group}
                    color={b.demand === "rare" ? "secondary" : "default"}
                  />
                </TableCell>
                <TableCell>{b.units}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={b.demand}
                    color={
                      demandColor(b.demand) as "error" | "secondary" | "default"
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </OpsShell>
  );
}
