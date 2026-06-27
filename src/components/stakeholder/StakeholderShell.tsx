/**
 * @file        StakeholderShell.tsx
 * @description Compact MUI layout for facility stakeholders (no patient bottom nav)
 * @module      stakeholder
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InsightsIcon from "@mui/icons-material/Insights";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QueueIcon from "@mui/icons-material/Queue";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LinkIcon from "@mui/icons-material/Link";
import GavelIcon from "@mui/icons-material/Gavel";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from "@mui/icons-material/Inventory";
import ScienceIcon from "@mui/icons-material/Science";
import DescriptionIcon from "@mui/icons-material/Description";
import PolicyIcon from "@mui/icons-material/Policy";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BadgeIcon from "@mui/icons-material/Badge";
import GroupsIcon from "@mui/icons-material/Groups";
import HotelIcon from "@mui/icons-material/Hotel";
import PeopleIcon from "@mui/icons-material/People";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import BiotechIcon from "@mui/icons-material/Biotech";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../../providers/AuthProvider";
import {
  ConfirmDialogProvider,
  useConfirmDialog,
} from "./ConfirmDialogProvider";
import { MuiProvider } from "../../providers/MuiProvider";
import {
  getStakeholderNav,
  STAKEHOLDER_ROLE_LABELS,
} from "../../constants/stakeholder.constants";

const DRAWER_WIDTH = 220;

const ICON_MAP: Record<string, React.ElementType> = {
  insights: InsightsIcon,
  docs: MenuBookIcon,
  queue: QueueIcon,
  scan: QrCodeScannerIcon,
  link: LinkIcon,
  consent: GavelIcon,
  calendar: CalendarMonthIcon,
  orders: ShoppingCartIcon,
  inventory: InventoryIcon,
  reports: DescriptionIcon,
  policy: PolicyIcon,
  eligibility: VerifiedUserIcon,
  hpr: BadgeIcon,
  directory: GroupsIcon,
  beds: HotelIcon,
  staff: PeopleIcon,
  blood: BloodtypeIcon,
  catalog: BiotechIcon,
  availability: ScheduleIcon,
  profile: PersonIcon,
};

function StakeholderShellInner({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useAuth();
  const { confirm } = useConfirmDialog();
  const nav = getStakeholderNav(role);
  const label = STAKEHOLDER_ROLE_LABELS[role] || role;

  const drawer = (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: "100%", py: 1 }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          Abha Setu
        </Typography>
        <Typography variant="h6" sx={{ fontSize: "1rem", lineHeight: 1.3 }}>
          {label}
        </Typography>
      </Box>
      <List dense sx={{ flex: 1, px: 1, pt: 1 }}>
        {nav.map((item) => {
          const Icon = ICON_MAP[item.icon] || InsightsIcon;
          const active =
            pathname === item.path ||
            (item.path !== nav[0]?.path && pathname?.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              selected={!!active}
              onClick={() => {
                router.push(item.path);
                setMobileOpen(false);
              }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { sx: { fontSize: 13, fontWeight: 600 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <ListItemButton
          onClick={async () => {
            const ok = await confirm({
              title: "Sign out?",
              message:
                "You will leave the stakeholder console and return to staff login.",
              confirmLabel: "Sign out",
              severity: "warning",
            });
            if (!ok) return;
            logout();
          }}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            slotProps={{ primary: { sx: { fontSize: 13 } } }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 52 }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Stakeholder console
          </Typography>
          <Chip
            size="small"
            label={label}
            color="primary"
            variant="outlined"
            sx={{ mr: 1, display: { xs: "none", sm: "flex" } }}
          />
          <IconButton
            aria-label="Sign out"
            onClick={async () => {
              const ok = await confirm({
                title: "Sign out?",
                message: "You will leave the stakeholder console.",
                confirmLabel: "Sign out",
                severity: "warning",
              });
              if (!ok) return;
              logout();
            }}
            sx={{ mr: 1 }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
          <Avatar
            src={currentUser?.photo || undefined}
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: 14,
            }}
          >
            {currentUser?.name?.charAt(0) || "S"}
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          pt: { xs: 8, md: 9 },
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default function StakeholderShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  return (
    <MuiProvider>
      <ConfirmDialogProvider>
        <StakeholderShellInner role={role}>{children}</StakeholderShellInner>
      </ConfirmDialogProvider>
    </MuiProvider>
  );
}
