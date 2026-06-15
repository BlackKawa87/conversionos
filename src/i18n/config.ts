import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import ptCommon from './locales/pt/common.json'
import esCommon from './locales/es/common.json'
import enShell  from './locales/en/shell.json'
import ptShell  from './locales/pt/shell.json'
import esShell  from './locales/es/shell.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'es'],
    defaultNS: 'common',
    ns: ['common', 'shell'],
    resources: {
      en: { common: enCommon, shell: enShell },
      pt: { common: ptCommon, shell: ptShell },
      es: { common: esCommon, shell: esShell },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
