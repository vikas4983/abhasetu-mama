"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { navItems } from "@/constants/platform";
import { useTranslation } from "@/hooks/use-translation";
import { setRoute } from "@/stores/app-store";
import type { RootState } from "@/stores/app-store";
import type { RouteKey } from "@/types/domain";

export function Sidebar() {
  const route = useSelector((state: RootState) => state.app.route);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  function navigate(key: RouteKey) {
    dispatch(setRoute(key));
  }

  return (
    <aside className="fixed left-[max(18px,calc((100vw-var(--content-width))/2+24px))] top-[98px] z-50 hidden w-[76px] flex-col gap-2 rounded-[14px] border border-border bg-[rgba(13,32,49,0.94)] p-2 shadow-surface backdrop-blur lg:flex">
      <button onClick={() => navigate("dashboard")} className="grid place-items-center gap-1 rounded-xl p-2 text-text-primary" aria-label="ABHA SETU home">
        <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-gradient-to-br from-accent-teal to-accent-cyan text-white shadow-surface">
          <Plus className="h-6 w-6 stroke-[3]" />
        </span>
      </button>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = route === item.key;
        return (
          <motion.button
            key={item.key}
            whileHover={{ y: -1 }}
            onClick={() => navigate(item.key)}
            className={`relative grid min-h-16 place-items-center gap-1 rounded-[10px] px-1 py-2 text-center transition ${active ? "bg-[rgba(0,212,170,0.12)] text-accent-teal" : "text-text-secondary hover:bg-[rgba(0,212,170,0.08)] hover:text-accent-teal"}`}
            aria-label={t(item.labelKey as never)}
          >
            {active && <span className="absolute -left-2 h-10 w-1 rounded-r bg-accent-teal" />}
            <Icon className="h-[22px] w-[22px]" />
            <span className="max-w-[64px] text-[9px] font-bold leading-tight">{t(item.labelKey as never)}</span>
          </motion.button>
        );
      })}
    </aside>
  );
}
