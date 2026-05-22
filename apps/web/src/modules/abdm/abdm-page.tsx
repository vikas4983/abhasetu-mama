"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { BadgeCheck, IdCard, KeyRound, LockKeyhole, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { abdmMilestoneWorkflows } from "@/constants/platform";
import { abdmV3Endpoints } from "@/services/abdm.service";

const schema = z.object({
  identifier: z.string().min(10, "Enter Aadhaar or mobile number"),
  otp: z.string().optional(),
  abhaAddress: z.string().optional()
});

export function AbdmPage() {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <section className="col-span-full mt-6 grid gap-4">
      <header className="rounded-2xl border border-border bg-bg-card p-7 shadow-surface">
        <p className="text-sm font-extrabold uppercase text-accent-teal">ABDM Milestone 1</p>
        <h1 className="mt-2 text-4xl font-extrabold">V3 ABHA creation, verification, QR, and returning patient flows</h1>
        <p className="mt-3 max-w-3xl text-text-secondary">All ABDM secrets stay on the NestJS backend. Browser requests call the secure server proxy for token refresh, retries, validation, and redacted logging.</p>
      </header>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {abdmMilestoneWorkflows.map((flow, index) => {
          const icons = [IdCard, BadgeCheck, Smartphone, LockKeyhole];
          const Icon = icons[index % icons.length];
          return <motion.article key={flow} whileHover={{ y: -2 }} className="premium-card min-h-36 p-4"><Icon className="mb-3 h-6 w-6 text-accent-teal" /><h2 className="font-extrabold">{flow}</h2><p className="mt-2 text-sm text-text-secondary">Production-ready route contract with validation, encrypted payloads, and audit-safe status handling.</p></motion.article>;
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-xl font-extrabold">Secure ABDM Demo Flow</h2>
          <form className="grid gap-3" onSubmit={form.handleSubmit(() => undefined)}>
            <label className="grid gap-2 text-sm font-bold text-text-secondary">Aadhaar / Mobile<input className="rounded-xl border border-border bg-bg-secondary p-3 text-text-primary" {...form.register("identifier")} /></label>
            <label className="grid gap-2 text-sm font-bold text-text-secondary">OTP<input className="rounded-xl border border-border bg-bg-secondary p-3 text-text-primary" {...form.register("otp")} /></label>
            <label className="grid gap-2 text-sm font-bold text-text-secondary">ABHA Address<input className="rounded-xl border border-border bg-bg-secondary p-3 text-text-primary" {...form.register("abhaAddress")} placeholder="name@abdm" /></label>
            <Button type="submit"><KeyRound className="h-4 w-4" />Stage ABDM Request</Button>
          </form>
        </Card>
        <Card>
          <h2 className="mb-3 text-xl font-extrabold">V3 Endpoint Map</h2>
          <div className="grid gap-2">
            {Object.entries(abdmV3Endpoints).map(([key, value]) => <code key={key} className="rounded-lg bg-bg-secondary p-2 text-sm text-text-secondary">{key}: {value}</code>)}
          </div>
        </Card>
      </div>
    </section>
  );
}
