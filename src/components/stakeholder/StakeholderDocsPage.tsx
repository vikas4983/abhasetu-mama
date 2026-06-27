/**
 * @file        StakeholderDocsPage.tsx
 * @description In-console documentation for a stakeholder role
 * @module      stakeholder
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
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
} from "@mui/material";
import { getDocForRole } from "../../constants/stakeholder-docs.constants";
import { STAKEHOLDER_ROLE_LABELS } from "../../constants/stakeholder.constants";

export default function StakeholderDocsPage({ role }: { role: string }) {
  const doc = getDocForRole(role);
  const label = STAKEHOLDER_ROLE_LABELS[role] || role;

  if (!doc) {
    return (
      <Alert severity="info">
        Documentation for {label} is being prepared.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {doc.title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        {doc.summary}
      </Typography>
      <Chip
        label={doc.abdmMilestone}
        color="primary"
        size="small"
        sx={{ mb: 3 }}
      />

      {doc.sections.map((section) => (
        <Card key={section.title} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
              {section.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {section.body}
            </Typography>
            {section.flows && section.flows.length > 0 && (
              <List dense disablePadding>
                {section.flows.map((f) => (
                  <ListItem key={f} disablePadding sx={{ py: 0.25 }}>
                    <ListItemText
                      primary={`→ ${f}`}
                      slotProps={{ primary: { sx: { fontSize: 13 } } }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
            {section.apis && section.apis.length > 0 && (
              <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {section.apis.map((api) => (
                  <Chip
                    key={api}
                    label={api}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: "monospace", fontSize: 11 }}
                  />
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
