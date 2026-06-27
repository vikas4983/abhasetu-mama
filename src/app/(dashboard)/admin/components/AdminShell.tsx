/**
 * @file        AdminShell.tsx
 * @description Compact MUI admin layout with sidebar navigation
 * @module      admin
 * @layer       component
 * @author      Platform Team
 * @created     2026-06-26
 */

"use client";

import React, { useState } from "react";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";
import MapIcon from "@mui/icons-material/Map";
import BusinessIcon from "@mui/icons-material/Business";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PaletteIcon from "@mui/icons-material/Palette";
import LogoutIcon from "@mui/icons-material/Logout";

const WIDTH = 200;

export type AdminTabId =
  | "dashboard"
  | "config"
  | "platform"
  | "pincodes"
  | "facilities"
  | "logs"
  | "documentation";

const NAV: { id: AdminTabId; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Insights", icon: InsightsIcon },
  { id: "facilities", label: "Facilities", icon: BusinessIcon },
  { id: "pincodes", label: "Pincodes", icon: MapIcon },
  { id: "platform", label: "Platform", icon: PaletteIcon },
  { id: "config", label: "ABDM", icon: SettingsIcon },
  { id: "documentation", label: "Docs", icon: MenuBookIcon },
  { id: "logs", label: "Audit", icon: ArticleIcon },
];

export default function AdminShell({
  activeTab,
  onTabChange,
  userName,
  userRole,
  onLogout,
  children,
}: {
  activeTab: AdminTabId;
  onTabChange: (id: AdminTabId) => void;
  userName?: string;
  userRole?: string;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  const drawer = (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", py: 1 }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Master admin
        </Typography>
        <Typography variant="subtitle1">
          {/* fontWeight={800} */}
          Control center
        </Typography>
      </Box>
      <List dense sx={{ flex: 1, px: 1, pt: 1 }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.id}
              selected={activeTab === item.id}
              onClick={() => {
                onTabChange(item.id);
                setOpen(false);
              }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>
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
      <List
        dense
        sx={{ px: 1, borderTop: "1px solid", borderColor: "divider", pt: 1 }}
      >
        <ListItemButton onClick={onLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 34 }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            slotProps={{ primary: { sx: { fontSize: 13 } } }}
          />
        </ListItemButton>
      </List>
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
          ml: { md: `${WIDTH}px` },
          width: { md: `calc(100% - ${WIDTH}px)` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          {mobile && (
            <IconButton
              edge="start"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="body1" sx={{ flexGrow: 1 }}>
            {/* fontWeight={700} */}
            {NAV.find((n) => n.id === activeTab)?.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            {userName} · {userRole}
          </Typography>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: "primary.main",
              fontSize: 13,
            }}
          >
            {userName?.charAt(0) || "A"}
          </Avatar>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: WIDTH }, flexShrink: 0 }}>
        <Drawer
          variant={mobile ? "temporary" : "permanent"}
          open={mobile ? open : true}
          onClose={() => setOpen(false)}
          sx={{
            "& .MuiDrawer-paper": { width: WIDTH, boxSizing: "border-box" },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 1.5, md: 2.5 }, pt: { xs: 7, md: 8 } }}
      >
        {children}
      </Box>
    </Box>
  );
}
