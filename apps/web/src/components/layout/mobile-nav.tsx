"use client";

import { Menu } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { mobileNav, navItems } from "@/constants/platform";
import { setRoute } from "@/stores/app-store";
import type { RootState } from "@/stores/app-store";
import { useTranslation } from "@/hooks/use-translation";
import type { RouteKey } from "@/types/domain";

export function MobileNav() {
  const dispatch = useDispatch();
  const route = useSelector((state: RootState) => state.app.route);
  const { t } = useTranslation();

  const items = mobileNav.map((key) => navItems.find((item) => item.key === key)).filter(Boolean);

  return (
    <nav className="fixed bottom-2 left-2 right-2 z-50 grid min-h-[70px] grid-cols-5 items-center gap-1 rounded-[20px] border border-border bg-[rgba(13,32,49,0.94)] p-2 shadow-surface backdrop-blur lg:hidden" aria-label="Mobile navigation">
      {items.map((item) => {
        if (!item) return null;
        const Icon = item.icon;
        const active = route === item.key;
        const isScanner = item.key === "scanner";
        return (
          <button
            key={item.key}
            onClick={() => dispatch(setRoute(item.key as RouteKey))}
            className={`grid min-w-0 place-items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold ${active ? "text-accent-teal" : "text-text-secondary"} ${isScanner ? "-mt-7 min-h-16 rounded-full bg-gradient-to-br from-accent-teal to-accent-cyan text-white shadow-surface" : ""}`}
            aria-label={t(item.labelKey as never)}
          >
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate">{t(item.labelKey as never)}</span>
          </button>
        );
      })}
      <button className="sr-only" aria-label="Open all menu items">
        <Menu />
      </button>
    </nav>
  );
}
