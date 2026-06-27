/**
 * @file        page.tsx
 * @description Master admin console — MUI compact layout with insights, docs, facilities
 * @module      admin
 * @layer       page
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-26
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@mui/material";
import { MuiProvider } from "@/providers/MuiProvider";
import { useAuth } from "@/providers/AuthProvider";
import { showToast } from "@/utils/toast";
import {
  ConfirmDialogProvider,
  useConfirmDialog,
} from "@/components/stakeholder/ConfirmDialogProvider";
import * as api from "./admin.api";
import AdminShell, { AdminTabId } from "./components/AdminShell";
import DashboardTab from "./components/DashboardTab";
import ConfigTab from "./components/ConfigTab";
import PincodeDirectoryTab from "./components/PincodeDirectoryTab";
import FacilitiesTab from "./components/FacilitiesTab";
import LogsTab from "./components/LogsTab";
import DocumentationTab from "./components/DocumentationTab";
import PlatformTab from "./components/PlatformTab";

function AdminDashboardInner() {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { confirm } = useConfirmDialog();
  const [activeTab, setActiveTab] = useState<AdminTabId>("dashboard");
  const [token, setToken] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("adminToken") || "";
    setToken(t);
    if (!t) {
      router.replace("/admin/login");
      return;
    }
    const role = currentUser?.role;
    if (role && role !== "admin" && role !== "master_admin") {
      showToast("Admin access only", true);
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  useEffect(() => {
    if (!token) return;
    setDashLoading(true);
    api
      .fetchDashboard(token)
      .then((d) => {
        if (d.status === "success") setDashboard(d);
      })
      .finally(() => setDashLoading(false));
  }, [token]);

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Sign out of admin?",
      message: "You will return to the admin login screen.",
      confirmLabel: "Sign out",
      severity: "warning",
    });
    if (!ok) return;
    logout();
  };

  return (
    <AdminShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      userName={currentUser?.name}
      userRole={currentUser?.role}
      onLogout={handleLogout}
    >
      <Card variant="outlined" sx={{ p: { xs: 1.5, md: 2 }, minHeight: 360 }}>
        {activeTab === "dashboard" && (
          <DashboardTab data={dashboard} loading={dashLoading} />
        )}
        {activeTab === "config" && token && <ConfigTab token={token} />}
        {activeTab === "pincodes" && token && (
          <PincodeDirectoryTab token={token} />
        )}
        {activeTab === "facilities" && token && <FacilitiesTab token={token} />}
        {activeTab === "logs" && token && <LogsTab token={token} />}
        {activeTab === "documentation" && <DocumentationTab />}
        {activeTab === "platform" && token && <PlatformTab token={token} />}
      </Card>
    </AdminShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <MuiProvider>
      <ConfirmDialogProvider>
        <AdminDashboardInner />
      </ConfirmDialogProvider>
    </MuiProvider>
  );
}
