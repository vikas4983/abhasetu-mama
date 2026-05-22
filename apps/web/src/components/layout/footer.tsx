"use client";

import { Accessibility, Lock, Mail, MapPin, Phone, Plus, ShieldCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { setRoute } from "@/stores/app-store";
import type { RouteKey } from "@/types/domain";
import { useTranslation } from "@/hooks/use-translation";

const footerLinks: Array<[string, RouteKey][]> = [
  [["ABDM Services", "abdm"], ["Telemedicine", "telemedicine"], ["Connected Facilities", "facilities"], ["QR Scanner", "scanner"]],
  [["Health Insights", "insights"], ["Compliance", "compliance"], ["Security", "security"], ["Reports", "reports"]],
  [["About", "about"], ["Contact", "contact"], ["Terms", "terms"], ["Privacy", "privacy"]]
];

export function Footer() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  return (
    <footer className="col-span-full mt-7 rounded-[18px] border border-border bg-[linear-gradient(135deg,rgba(0,212,170,0.09),rgba(0,180,216,0.04)),rgba(13,32,49,0.94)] p-5 shadow-surface">
      <div className="grid gap-5 border-b border-border/80 pb-5 md:grid-cols-[1fr_auto]">
        <div className="flex gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-gradient-to-br from-accent-teal to-accent-cyan text-white">
            <Plus className="h-6 w-6 stroke-[3]" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold">{t("brand")}</h2>
            <p className="max-w-2xl text-sm leading-6 text-text-secondary">{t("tagline")} for ABDM-ready healthcare operations, telemedicine, connected facilities, QR flows, and secure patient journeys.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[["ABDM Ready", ShieldCheck], ["Consent-first", Lock], ["Accessible", Accessibility]].map(([label, Icon]) => {
            const BadgeIcon = Icon as typeof ShieldCheck;
            return <span key={label as string} className="inline-flex items-center gap-2 rounded-full border border-accent-teal/30 bg-accent-teal/10 px-3 py-2 text-xs font-extrabold text-accent-teal"><BadgeIcon className="h-4 w-4" />{label as string}</span>;
          })}
        </div>
      </div>
      <div className="grid gap-5 py-5 md:grid-cols-4">
        {footerLinks.map((group, index) => (
          <section key={index} className="grid content-start gap-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-text-primary">{index === 0 ? "Platform" : index === 1 ? "Operations" : "Company"}</h3>
            {group.map(([label, route]) => <button key={route} className="text-left text-sm text-text-secondary hover:text-accent-teal" onClick={() => dispatch(setRoute(route))}>{label}</button>)}
          </section>
        ))}
        <section className="grid content-start gap-2 text-sm text-text-secondary">
          <h3 className="text-xs font-extrabold uppercase tracking-wide text-text-primary">Contact</h3>
          <a className="inline-flex gap-2 hover:text-accent-teal" href="mailto:contact@abhasetu.com"><Mail className="h-4 w-4" />contact@abhasetu.com</a>
          <a className="inline-flex gap-2 hover:text-accent-teal" href="tel:+919981057765"><Phone className="h-4 w-4" />+91-9981057765</a>
          <p className="inline-flex gap-2"><MapPin className="h-4 w-4 shrink-0" />Madar Gate, Panchampura, Katangi, Jabalpur, Madhya Pradesh 483105</p>
        </section>
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-border/80 pt-4 text-xs text-text-secondary">
        <span>© {new Date().getFullYear()} ABHA SETU. All rights reserved.</span>
        <span>{t("footerNote")}</span>
      </div>
    </footer>
  );
}
