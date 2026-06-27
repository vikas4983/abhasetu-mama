/**
 * @file        PlatformTab.tsx
 * @description Master admin — branding, icons, Swagger API access
 * @module      admin/components
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Link,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import { showToast } from '../../../../utils/toast';
import { useConfirmDialog } from '../../../../components/stakeholder/ConfirmDialogProvider';
import * as api from '../admin.api';

const LOGO_OPTIONS = [
  { id: 'default', label: 'Default Abha Setu' },
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `/assets/logos/logo${i + 1}.png`,
    label: `Logo variant ${i + 1}`,
  })),
];

const ICON_STYLES = [
  { id: 'glassmorphic', label: 'Glassmorphic' },
  { id: '3d-gradient', label: '3D gradient' },
  { id: 'minimalist', label: 'Minimalist' },
];

interface Props {
  token: string;
}

export default function PlatformTab({ token }: Props) {
  const { confirm } = useConfirmDialog();
  const [selectedLogo, setSelectedLogo] = useState('default');
  const [iconStyle, setIconStyle] = useState('glassmorphic');
  const [theme, setTheme] = useState('light');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.fetchConfig(token).then((d) => {
      const c = d.config || {};
      if (c.selectedLogo) setSelectedLogo(c.selectedLogo);
      if (c.iconStyle) setIconStyle(c.iconStyle);
      if (c.theme) setTheme(c.theme);
    });
    try {
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      if (state.selectedLogo) setSelectedLogo(state.selectedLogo);
      if (state.iconStyle) setIconStyle(state.iconStyle);
      if (state.theme) setTheme(state.theme);
    } catch {
      /* ignore */
    }
  }, [token]);

  const save = async () => {
    const ok = await confirm({
      title: 'Save platform settings?',
      message: 'Logo and icon style will apply across the patient portal header.',
      confirmLabel: 'Save',
    });
    if (!ok) return;
    setSaving(true);
    try {
      const payload = { selectedLogo, iconStyle, theme };
      const res = await api.saveConfig(token, payload);
      const state = JSON.parse(localStorage.getItem('setu_state') || '{}');
      localStorage.setItem('setu_state', JSON.stringify({ ...state, ...payload }));
      showToast(res.message || 'Platform settings saved', res.status !== 'success');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
        Platform controls
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Branding applies to the patient UI header. Stakeholder consoles use a compact layout.
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                <ImageIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                Application logo
              </Typography>
              <Grid container spacing={1}>
                {LOGO_OPTIONS.map((logo) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={logo.id}>
                    <Button
                      fullWidth
                      variant={selectedLogo === logo.id ? 'contained' : 'outlined'}
                      onClick={() => setSelectedLogo(logo.id)}
                      sx={{ py: 1.5, flexDirection: 'column', textTransform: 'none', fontSize: 11 }}
                    >
                      {logo.id !== 'default' ? (
                        <Box
                          component="img"
                          src={logo.id}
                          alt=""
                          sx={{ height: 28, mb: 0.5, objectFit: 'contain' }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          SETU
                        </Typography>
                      )}
                      {logo.label}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel id="icon-style-label">Icon style</InputLabel>
                  <Select
                    labelId="icon-style-label"
                    label="Icon style"
                    value={iconStyle}
                    onChange={(e) => setIconStyle(e.target.value)}
                  >
                    {ICON_STYLES.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel id="theme-label">Default theme</InputLabel>
                  <Select
                    labelId="theme-label"
                    label="Default theme"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Swagger API
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Interactive OpenAPI docs for all NestJS ABDM endpoints.
                </Typography>
                <Button
                  component={Link}
                  href="/api/abdm/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  fullWidth
                >
                  Open Swagger UI
                </Button>
              </CardContent>
            </Card>

            <Button variant="contained" startIcon={<SaveIcon />} onClick={save} disabled={saving} fullWidth>
              {saving ? 'Saving…' : 'Save platform settings'}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
