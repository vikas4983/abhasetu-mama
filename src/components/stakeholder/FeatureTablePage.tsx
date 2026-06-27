/**
 * @file        FeatureTablePage.tsx
 * @description Generic MUI data table for stakeholder sub-features
 * @module      stakeholder
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
} from '@mui/material';

export interface FeatureRow {
  id: string;
  col1: string;
  col2: string;
  col3: string;
  status: string;
}

export default function FeatureTablePage({
  title,
  description,
  columns,
  rows,
  actionLabel,
}: {
  title: string;
  description: string;
  columns: [string, string, string];
  rows: FeatureRow[];
  actionLabel?: string;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
            {description}
          </Typography>
        </Box>
        {actionLabel && (
          <Button variant="contained" size="small">
            {actionLabel}
          </Button>
        )}
      </Box>
      <Card>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{columns[0]}</TableCell>
              <TableCell>{columns[1]}</TableCell>
              <TableCell>{columns[2]}</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.col1}</TableCell>
                <TableCell>{r.col2}</TableCell>
                <TableCell>{r.col3}</TableCell>
                <TableCell>
                  <Chip label={r.status} size="small" color={r.status === 'Active' || r.status === 'Done' ? 'success' : 'warning'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
}
