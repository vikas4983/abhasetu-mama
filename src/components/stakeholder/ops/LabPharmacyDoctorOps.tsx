/**
 * @file        LabPharmacyDoctorOps.tsx
 * @description Lab catalog, pharmacy inventory, doctor appointments consoles
 * @module      stakeholder/ops
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useState } from "react";
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import { useStakeholderOps } from "../../../hooks/useStakeholderOps";
import { useConfirmDialog } from "../ConfirmDialogProvider";
import { showToast } from "../../../utils/toast";
import { StakeholderBarChart } from "../charts/StakeholderCharts";

interface LabOps {
  tests: {
    id: string;
    name: string;
    price: number;
    homeCollection: boolean;
    areas: string[];
    bookings: number;
  }[];
  areaCoverage: string[];
}

interface PharmacyOps {
  medicines: {
    id: string;
    name: string;
    salts: string;
    rxRequired: boolean;
    stock: number;
    price: number;
    area: string;
  }[];
  location: { address: string; serveRadiusKm: number };
  topAreas: string[];
}

interface DoctorOps {
  appointments: {
    id: string;
    patient: string;
    mobile: string;
    slot: string;
    mode: string;
    status: string;
  }[];
  availability: { day: string; slots: string[] }[];
}

function PageHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
        {desc}
      </Typography>
    </Box>
  );
}

export function LabCatalogPage() {
  const { data, setData, loading, save } = useStakeholderOps<LabOps>();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    homeCollection: true,
  });

  const addTest = async () => {
    if (!data || !form.name) return;
    const next: LabOps = {
      ...data,
      tests: [
        ...data.tests,
        {
          id: `T${Date.now()}`,
          name: form.name,
          price: Number(form.price) || 0,
          homeCollection: form.homeCollection,
          areas: data.areaCoverage.slice(0, 2),
          bookings: 0,
        },
      ],
    };
    setData(next);
    await save(next);
    setOpen(false);
    setForm({ name: "", price: "", homeCollection: true });
    showToast("Test added", false);
  };

  if (loading || !data) return <Typography>Loading catalog…</Typography>;

  const chart = {
    labels: data.tests.map((t) => t.name),
    values: data.tests.map((t) => t.bookings),
  };

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <PageHeader
          title="Test catalog"
          desc="Manage tests, prices, home collection, and area coverage. Insights show most demanded tests."
        />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => setOpen(true)}
        >
          Add test
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StakeholderBarChart title="Bookings by test" series={chart} />
        </Box>
        <Card sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
            Areas served
          </Typography>
          {data.areaCoverage.map((a) => (
            <Chip key={a} label={a} size="small" sx={{ m: 0.25 }} />
          ))}
        </Card>
      </Stack>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Test</TableCell>
              <TableCell>Price (₹)</TableCell>
              <TableCell>Home collection</TableCell>
              <TableCell>Areas</TableCell>
              <TableCell>Bookings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.tests.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell>{t.name}</TableCell>
                <TableCell>{t.price}</TableCell>
                <TableCell>{t.homeCollection ? "Yes" : "No"}</TableCell>
                <TableCell>{t.areas.join(", ")}</TableCell>
                <TableCell>{t.bookings}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add diagnostic test</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Test name"
            margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Price (₹)"
            margin="dense"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.homeCollection}
                onChange={(e) =>
                  setForm({ ...form, homeCollection: e.target.checked })
                }
              />
            }
            label="Home collection available"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addTest}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function PharmacyInventoryPage() {
  const { data, setData, loading, save } = useStakeholderOps<PharmacyOps>();
  const { confirm } = useConfirmDialog();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    salts: "",
    price: "",
    stock: "",
    rxRequired: false,
  });

  const addMed = async () => {
    if (!data || !form.name) return;
    const next: PharmacyOps = {
      ...data,
      medicines: [
        ...data.medicines,
        {
          id: `M${Date.now()}`,
          name: form.name,
          salts: form.salts,
          rxRequired: form.rxRequired,
          stock: Number(form.stock) || 0,
          price: Number(form.price) || 0,
          area: data.topAreas[0] || "Central",
        },
      ],
    };
    setData(next);
    await save(next);
    setOpen(false);
    showToast("Medicine added", false);
  };

  const toggleRx = async (id: string) => {
    if (!data) return;
    const med = data.medicines.find((m) => m.id === id);
    const ok = await confirm({
      title: "Prescription requirement",
      message: `Set ${med?.name} as ${med?.rxRequired ? "OTC (no Rx)" : "Rx required"}?`,
      confirmLabel: "Update",
    });
    if (!ok) return;
    const next = {
      ...data,
      medicines: data.medicines.map((m) =>
        m.id === id ? { ...m, rxRequired: !m.rxRequired } : m,
      ),
    };
    setData(next);
    await save(next);
  };

  if (loading || !data) return <Typography>Loading inventory…</Typography>;

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 2, justifyContent: 'space-between' }}>
        <PageHeader
          title="Pharmacy inventory"
          desc={`${data.location.address} · serving ${data.location.serveRadiusKm} km — manage stock, salts/composition, Rx flags.`}
        />
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          size="small"
          onClick={() => setOpen(true)}
        >
          Add SKU
        </Button>
      </Stack>

      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Medicine</TableCell>
              <TableCell>Salts / composition</TableCell>
              <TableCell>Rx</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Price (₹)</TableCell>
              <TableCell>Area</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.medicines.map((m) => (
              <TableRow key={m.id} hover>
                <TableCell>{m.name}</TableCell>
                <TableCell>
                  <Typography variant="caption">{m.salts}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={m.rxRequired ? "Rx required" : "OTC"}
                    color={m.rxRequired ? "warning" : "success"}
                    onClick={() => toggleRx(m.id)}
                    sx={{ cursor: "pointer" }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={m.stock}
                    color={m.stock < 50 ? "error" : "default"}
                  />
                </TableCell>
                <TableCell>{m.price}</TableCell>
                <TableCell>{m.area}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add medicine</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Brand / name"
            margin="dense"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Salts / composition"
            margin="dense"
            value={form.salts}
            onChange={(e) => setForm({ ...form, salts: e.target.value })}
          />
          <TextField
            fullWidth
            label="Stock"
            margin="dense"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
          />
          <TextField
            fullWidth
            label="Price (₹)"
            margin="dense"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.rxRequired}
                onChange={(e) =>
                  setForm({ ...form, rxRequired: e.target.checked })
                }
              />
            }
            label="Prescription required"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addMed}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export function DoctorAppointmentsPage() {
  const { data, setData, loading, save } = useStakeholderOps<DoctorOps>();
  const { confirm } = useConfirmDialog();

  const setStatus = async (id: string, status: string) => {
    const ok = await confirm({
      title: "Update appointment",
      message: `Set appointment ${id} to ${status}?`,
      confirmLabel: "Confirm",
      severity: status === "rejected" ? "error" : "warning",
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
    showToast("Updated", false);
  };

  if (loading || !data) return <Typography>Loading…</Typography>;

  return (
    <Box>
      <PageHeader
        title="Appointments & telemedicine"
        desc="Approve, reject, or reschedule consults. Availability slots shown below."
      />
      <Card sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Slot</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.appointments.map((a) => (
              <TableRow key={a.id} hover>
                <TableCell>
                  {a.patient}
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    {a.mobile}
                  </Typography>
                </TableCell>
                <TableCell>{a.slot}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={a.mode}
                    color={a.mode === "telemedicine" ? "primary" : "default"}
                  />
                </TableCell>
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
                    onClick={() => setStatus(a.id, "confirmed")}
                  >
                    <CheckIcon fontSize="small" color="success" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setStatus(a.id, "rejected")}
                  >
                    <CloseIcon fontSize="small" color="error" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setStatus(a.id, "rescheduled")}
                  >
                    <EventRepeatIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 700 }}>
        Weekly availability
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {data.availability.map((d) => (
          <Card key={d.day} variant="outlined" sx={{ p: 1.5, minWidth: 140 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {d.day}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              {d.slots.map((s) => (
                <Chip key={s} label={s} size="small" sx={{ m: 0.25 }} />
              ))}
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
