import './assets/main.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Ripple from 'primevue/ripple'
import App from './App.vue'

import RU from '@/lang/ru'
import EN from '@/lang/en'

const messages = {
  en: EN,
  ru: RU
}

const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages,
  globalInjection: true
})

const pinia = createPinia()

createApp(App)
  .use(i18n)
  .use(pinia)
  .use(PrimeVue, {
    unstyled: true
  })
  .directive('ripple', Ripple)
  .mount('#app')
