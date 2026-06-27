/**
 * @file        DocumentationTab.tsx
 * @description Stakeholder process documentation for master admin
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { STAKEHOLDER_DOCUMENTATION } from '../../../../constants/stakeholder-docs.constants';
import { STAKEHOLDER_ROLE_LABELS } from '../../../../constants/stakeholder.constants';

export default function DocumentationTab() {
  const [tab, setTab] = useState(0);
  const doc = STAKEHOLDER_DOCUMENTATION[tab];

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
        Stakeholder documentation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        Integrated ABDM flows, APIs, and onboarding steps for each stakeholder type registered on the platform.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        {STAKEHOLDER_DOCUMENTATION.map((d) => (
          <Tab
            key={d.role}
            label={STAKEHOLDER_ROLE_LABELS[d.role] || d.role}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, minHeight: 40 }}
          />
        ))}
      </Tabs>

      {doc && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {doc.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
              {doc.summary}
            </Typography>
            <Chip label={doc.abdmMilestone} size="small" color="primary" sx={{ mb: 2 }} />

            {doc.sections.map((section) => (
              <Accordion key={section.title} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, border: '1px solid', borderColor: 'divider', mb: 1, borderRadius: '8px !important' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    {section.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {section.body}
                  </Typography>
                  {section.flows && (
                    <List dense disablePadding>
                      {section.flows.map((f) => (
                        <ListItem key={f} disablePadding>
                          <ListItemText primary={f} slotProps={{ primary: { sx: { fontSize: 13 } } }} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                  {section.apis && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {section.apis.map((api) => (
                        <Chip key={api} label={api} size="small" variant="outlined" sx={{ fontFamily: 'monospace', fontSize: 11 }} />
                      ))}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
