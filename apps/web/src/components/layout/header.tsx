"use client";

import { Bell, ChevronDown, Languages, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage, setRoute } from "@/stores/app-store";
import type { RootState } from "@/stores/app-store";
import { useTranslation } from "@/hooks/use-translation";

export function Header() {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.app.language);
  const { setTheme, resolvedTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="glass-header col-span-full flex min-h-16 flex-wrap items-center justify-between gap-3">
      <button className="flex items-center gap-3" onClick={() => dispatch(setRoute("dashboard"))}>
        <span className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-gradient-to-br from-accent-teal to-accent-cyan text-white shadow-surface">
          <Plus className="h-5 w-5 stroke-[3]" />
        </span>
        <span className="grid text-left">
          <strong className="text-sm font-extrabold leading-tight">{t("brand")}</strong>
          <span className="text-[10px] text-text-secondary">{t("tagline")}</span>
        </span>
      </button>
      <label className="relative order-3 flex w-full flex-1 items-center md:order-none md:max-w-[520px]">
        <Search className="absolute left-3 h-4 w-4 text-text-muted" />
        <input className="min-h-[42px] w-full rounded-full border border-border bg-[rgba(19,40,59,0.88)] py-2 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-accent-teal focus:ring-4 focus:ring-accent-teal/10" placeholder="Search services, records, doctors..." />
      </label>
      <div className="flex items-center gap-2">
        <button className="secondary-action" onClick={() => dispatch(setLanguage(language === "en" ? "hi" : "en"))}>
          <Languages className="h-4 w-4" />
          {language.toUpperCase()}
          <ChevronDown className="h-4 w-4" />
        </button>
        <button className="secondary-action" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-[rgba(19,40,59,0.82)]">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent-teal" />
        </button>
      </div>
    </header>
  );
}
