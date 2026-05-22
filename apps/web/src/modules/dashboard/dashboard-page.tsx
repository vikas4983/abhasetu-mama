"use client";

import { motion } from "framer-motion";
import { Activity, Building2, FileLock2, IdCard, Monitor, Pill, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { useDispatch } from "react-redux";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { complianceBadges, vitals } from "@/constants/platform";
import { useTranslation } from "@/hooks/use-translation";
import { setRoute } from "@/stores/app-store";
import type { RouteKey } from "@/types/domain";

const quick = [
  ["Consult Doctor", "telemedicine", Stethoscope],
  ["Order Medicines", "facilities", Pill],
  ["ABDM Services", "abdm", IdCard],
  ["Connected Facilities", "facilities", Building2],
  ["QR Scanner", "scanner", Monitor],
  ["Security", "security", ShieldCheck]
] as const;

export function DashboardPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  return (
    <>
      <section className="col-span-full mt-6 grid min-h-[300px] gap-6 rounded-2xl border border-border bg-[rgba(19,40,59,0.78)] p-7 shadow-surface lg:grid-cols-[1fr_440px]">
        <div>
          <h1 className="max-w-[16ch] text-5xl font-extrabold leading-none md:text-6xl">{t("heroTitle")}</h1>
          <p className="mt-4 max-w-2xl text-text-secondary">{t("heroCopy")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => dispatch(setRoute("abdm"))}><IdCard className="h-4 w-4" />Create ABHA</Button>
            <Button variant="secondary" onClick={() => dispatch(setRoute("scanner"))}><Monitor className="h-4 w-4" />Scan QR</Button>
          </div>
        </div>
        <div className="self-end">
          <svg viewBox="0 0 300 60" className="h-28 w-full">
            <path className="ecg-line" d="M0,30 L40,30 L50,30 L55,15 L60,45 L65,10 L70,50 L75,30 L80,30 L120,30 L125,25 L130,35 L135,20 L140,40 L145,30 L150,30 L190,30 L195,20 L200,40 L205,15 L210,45 L215,30 L220,30 L260,30 L265,25 L270,35 L275,20 L280,40 L285,30 L300,30" fill="none" stroke="#00d4aa" strokeWidth="1.5" />
          </svg>
          <div className="grid grid-cols-3 gap-3">
            {["ABDM V3", "QR Ready", "JWT Ready"].map((item) => <Card key={item} className="min-h-20 text-center text-sm font-extrabold text-accent-teal">{item}</Card>)}
          </div>
        </div>
      </section>

      <section className="col-span-full mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{t("quickAccess")}</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {quick.map(([label, route, Icon]) => (
            <motion.button key={label} whileHover={{ y: -3 }} onClick={() => dispatch(setRoute(route as RouteKey))} className="premium-card grid min-h-28 place-items-center gap-2 p-4 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[rgba(0,212,170,0.12)] text-accent-teal"><Icon className="h-6 w-6" /></span>
              <span className="text-sm font-extrabold">{label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="col-span-full mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-xl font-extrabold">{t("liveDashboard")}</h2>
            <span className="rounded-full bg-accent-teal/10 px-3 py-1 text-xs font-extrabold text-accent-teal">Live</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {vitals.slice(0, 4).map((vital) => <MetricCard key={vital.label} {...vital} />)}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-xl font-extrabold">Medicolegal & Compliance</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {complianceBadges.map((badge) => <div key={badge.label} className="rounded-xl border border-border bg-bg-secondary p-3 text-sm font-bold text-text-secondary"><badge.icon className="mb-2 h-5 w-5 text-accent-teal" />{badge.label}</div>)}
          </div>
        </Card>
      </section>
    </>
  );
}

function MetricCard({ label, value, unit, trend, icon: Icon }: typeof vitals[number]) {
  return (
    <div className="rounded-xl border border-border bg-bg-secondary p-3">
      <Icon className="mb-3 h-5 w-5 text-accent-teal" />
      <span className="text-xs font-bold text-text-secondary">{label}</span>
      <strong className="block text-2xl">{value}</strong>
      <small className="text-text-muted">{unit} - {trend}</small>
    </div>
  );
}
