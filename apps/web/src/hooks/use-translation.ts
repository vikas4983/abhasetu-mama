"use client";

import { useSelector } from "react-redux";
import { en } from "@/translations/en";
import { hi } from "@/translations/hi";
import type { RootState } from "@/stores/app-store";

const dictionaries = { en, hi };

export function useTranslation() {
  const language = useSelector((state: RootState) => state.app.language);
  const dictionary = dictionaries[language];

  return {
    language,
    t: (key: keyof typeof en) => dictionary[key] ?? en[key] ?? key
  };
}
