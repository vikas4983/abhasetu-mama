import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';
import { STORAGE_KEYS } from '@/constants/app';

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    hi: { common: hiCommon },
  },
  lng: localStorage.getItem(STORAGE_KEYS.language) ?? 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export default i18n;
