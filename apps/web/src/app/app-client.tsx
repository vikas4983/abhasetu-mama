"use client";

import { useSelector } from "react-redux";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { DashboardPage } from "@/modules/dashboard/dashboard-page";
import { AbdmPage } from "@/modules/abdm/abdm-page";
import { TelemedicinePage } from "@/modules/telemedicine/telemedicine-page";
import { InsightsPage } from "@/modules/insights/insights-page";
import { FacilitiesPage } from "@/modules/facilities/facilities-page";
import { QrScannerPage } from "@/modules/scanner/qr-scanner-page";
import { StaticPage } from "@/modules/dashboard/static-page";
import type { RootState } from "@/stores/app-store";

export function AppClient() {
  const route = useSelector((state: RootState) => state.app.route);

  return (
    <div className="app-shell">
      <Header />
      <Sidebar />
      {route === "dashboard" && <DashboardPage />}
      {route === "abdm" && <AbdmPage />}
      {route === "telemedicine" && <TelemedicinePage />}
      {route === "insights" && <InsightsPage />}
      {route === "facilities" && <FacilitiesPage />}
      {route === "scanner" && <QrScannerPage />}
      {["security", "compliance", "reports", "settings", "contact", "about", "terms", "privacy"].includes(route) && <StaticPage route={route} />}
      <Footer />
      <MobileNav />
    </div>
  );
}
