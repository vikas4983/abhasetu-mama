"use client";

import { Card } from "@/components/ui/card";
import { vitals } from "@/constants/platform";

export function InsightsPage() {
  return (
    <section className="col-span-full mt-6 grid gap-4">
      <header className="rounded-2xl border border-border bg-bg-card p-7 shadow-surface">
        <p className="text-sm font-extrabold uppercase text-accent-teal">Health Insights & Education</p>
        <h1 className="mt-2 text-4xl font-extrabold">Vitals, wellness tracking, skin care, and AI health insights</h1>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {vitals.map((vital) => <Card key={vital.label} className="min-h-44"><vital.icon className="mb-3 h-6 w-6 text-accent-teal" /><span className="text-sm font-bold text-text-secondary">{vital.label}</span><strong className="block text-3xl">{vital.value}</strong><small className="text-text-muted">{vital.unit} - {vital.trend}</small></Card>)}
      </div>
    </section>
  );
}
