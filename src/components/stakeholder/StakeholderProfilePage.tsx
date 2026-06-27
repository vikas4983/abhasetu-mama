/**
 * @file        StakeholderProfilePage.tsx
 * @description Stakeholder profile — photo, DOB, contact, facility details
 * @module      stakeholder
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Stack,
  Grid,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import { showToast } from '../../utils/toast';
import { useAuth } from '../../providers/AuthProvider';
import { useConfirmDialog } from './ConfirmDialogProvider';
import {
  fetchStakeholderProfile,
  saveStakeholderProfile,
  uploadStakeholderPhoto,
} from '../../lib/stakeholder/stakeholder-profile.api';

interface ProfileForm {
  facility_name: string;
  date_of_birth: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bio: string;
  photo_url: string;
}

export default function StakeholderProfilePage() {
  const { currentUser, updateCurrentUser } = useAuth();
  const { confirm } = useConfirmDialog();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    facility_name: '',
    date_of_birth: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bio: '',
    photo_url: '',
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') || '' : '';

  useEffect(() => {
    if (!token) return;
    fetchStakeholderProfile(token)
      .then((res) => {
        if (res.status === 'success' && res.profile) {
          const p = res.profile;
          setForm({
            facility_name: p.facility_name || res.user?.name || '',
            date_of_birth: p.date_of_birth ? String(p.date_of_birth).slice(0, 10) : '',
            phone: p.phone || '',
            address: p.address || '',
            city: p.city || '',
            state: p.state || '',
            pincode: p.pincode || '',
            bio: p.bio || '',
            photo_url: p.photo_url || '',
          });
          if (p.photo_url) {
            updateCurrentUser({ photo: p.photo_url });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [token, updateCurrentUser]);

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    const res = await uploadStakeholderPhoto(token, file);
    if (res.status === 'success' && res.photo_url) {
      setForm((f) => ({ ...f, photo_url: res.photo_url }));
      updateCurrentUser({ photo: res.photo_url });
      showToast('Profile photo updated');
    } else {
      showToast(res.message || 'Upload failed', true);
    }
  };

  const handleSave = async () => {
    if (!/^\d{6}$/.test(form.pincode) && form.pincode) {
      showToast('Pincode must be 6 digits', true);
      return;
    }
    const ok = await confirm({
      title: 'Save profile?',
      message: 'Your facility profile will be updated and visible to platform admin.',
      confirmLabel: 'Save',
    });
    if (!ok || !token) return;
    setSaving(true);
    try {
      const res = await saveStakeholderProfile(token, form as unknown as Record<string, unknown>);
      showToast(res.message || 'Saved', res.status !== 'success');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Typography>Loading profile…</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        My profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Signed in as {currentUser?.email} · {currentUser?.role?.replace(/_/g, ' ')}
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar
              src={form.photo_url || undefined}
              sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}
            >
              {currentUser?.name?.charAt(0) || 'S'}
            </Avatar>
            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PhotoCameraIcon />}
                onClick={() => fileRef.current?.click()}
              >
                Upload photo
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handlePhoto}
              />
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }} color="text.secondary">
                JPEG, PNG or WebP · max 5 MB recommended
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Facility / display name"
                value={form.facility_name}
                onChange={(e) => setForm({ ...form, facility_name: e.target.value })}
                margin="dense"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Date of birth"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.date_of_birth}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                margin="dense"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                margin="dense"
                slotProps={{ htmlInput: { maxLength: 10 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Pincode"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                margin="dense"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                margin="dense"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                margin="dense"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                margin="dense"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="About / bio"
                multiline
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                margin="dense"
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{ mt: 2 }}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
