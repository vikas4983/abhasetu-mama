"use client";

import Image from "next/image";
import { UserRound, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { doctors } from "@/constants/platform";

export function TelemedicinePage() {
  return (
    <section className="col-span-full mt-6 grid gap-4">
      <header className="rounded-2xl border border-border bg-bg-card p-7 shadow-surface">
        <p className="text-sm font-extrabold uppercase text-accent-teal">Telemedicine</p>
        <h1 className="mt-2 text-4xl font-extrabold">Doctor profiles, waiting room, certificates, and consultation CTAs</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.name} className="overflow-hidden p-0">
            <div className="relative h-64 bg-bg-secondary">
              {doctor.photo ? <Image src={doctor.photo} alt={`${doctor.name} photograph`} fill className="object-cover object-top" /> : <div className="grid h-full place-items-center"><UserRound className="h-20 w-20 text-accent-teal" /></div>}
              <span className="absolute bottom-3 right-3 rounded-full bg-bg-primary/80 px-3 py-1 text-xs font-extrabold text-accent-teal">{doctor.badge}</span>
            </div>
            <div className="grid gap-2 p-4">
              <h2 className="text-xl font-extrabold">{doctor.name}</h2>
              <strong className="text-accent-teal">{doctor.degree}</strong>
              <p>{doctor.speciality}</p>
              <p className="text-sm text-text-secondary">{doctor.experience}</p>
              <p className="text-sm text-text-secondary">{doctor.description}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="secondary">Certificate</Button>
                <Button><Video className="h-4 w-4" />Consult</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
