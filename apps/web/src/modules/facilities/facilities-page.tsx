"use client";

import { Card } from "@/components/ui/card";
import { facilities } from "@/constants/platform";

export function FacilitiesPage() {
  return (
    <section className="col-span-full mt-6 grid gap-4">
      <header className="rounded-2xl border border-border bg-bg-card p-7 shadow-surface">
        <p className="text-sm font-extrabold uppercase text-accent-teal">Connected Facilities</p>
        <h1 className="mt-2 text-4xl font-extrabold">Hospitals, clinics, labs, pharmacies, telemedicine, and diagnostics</h1>
      </header>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {facilities.map((facility) => <Card key={facility.name} className="min-h-48"><facility.icon className="mb-3 h-7 w-7 text-accent-teal" /><span className="text-sm font-extrabold text-text-secondary">{facility.type}</span><h2 className="mt-2 text-xl font-extrabold">{facility.name}</h2><p className="mt-2 text-text-secondary">{facility.description}</p></Card>)}
      </div>
    </section>
  );
}
