import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon    from './locales/en/common.json'
import ptCommon    from './locales/pt/common.json'
import esCommon    from './locales/es/common.json'
import enShell     from './locales/en/shell.json'
import ptShell     from './locales/pt/shell.json'
import esShell     from './locales/es/shell.json'
import enProjects  from './locales/en/projects.json'
import ptProjects  from './locales/pt/projects.json'
import esProjects  from './locales/es/projects.json'
import enDiagnosis from './locales/en/diagnosis.json'
import ptDiagnosis from './locales/pt/diagnosis.json'
import esDiagnosis from './locales/es/diagnosis.json'
import enDashboard from './locales/en/dashboard.json'
import ptDashboard from './locales/pt/dashboard.json'
import esDashboard from './locales/es/dashboard.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'es'],
    defaultNS: 'common',
    ns: ['common', 'shell', 'projects', 'diagnosis', 'dashboard'],
    resources: {
      en: { common: enCommon, shell: enShell, projects: enProjects, diagnosis: enDiagnosis, dashboard: enDashboard },
      pt: { common: ptCommon, shell: ptShell, projects: ptProjects, diagnosis: ptDiagnosis, dashboard: ptDashboard },
      es: { common: esCommon, shell: esShell, projects: esProjects, diagnosis: esDiagnosis, dashboard: esDashboard },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
