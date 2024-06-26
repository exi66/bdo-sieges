<script setup>
import { useI18n } from 'vue-i18n'
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from '@/store'
import Map from '@/components/Map.vue'
import Home from '@/components/Home.vue'
import { Select } from '@/ui/select'

const { t, locale, availableLocales, messages } = useI18n()
const appStore = useAppStore()
const { getResultJson } = appStore

const lang = ref('en')
const currentTab = ref(localStorage.getItem('tab') || 'home')
const loading = ref(true)

watch(currentTab, () => {
  localStorage.setItem('tab', currentTab.value)
})

watch(lang, () => {
  if (availableLocales.find((e) => e === lang.value)) {
    localStorage.setItem('lang', lang.value)
    changeLang()
  }
})

const initLang = function () {
  let __lang = localStorage.getItem('lang')
  if (!__lang && navigator && navigator.language) {
    let find = availableLocales.find((e) => e == navigator.language)
    if (!find && navigator.language.includes('-'))
      find = availableLocales.find((e) => e == navigator.language.split('-')[0])
    __lang = find || 'en'
  }
  lang.value = __lang
  changeLang()
}

const changeLang = function () {
  locale.value = lang.value
  document.getElementsByTagName('html')[0].setAttribute('lang', lang.value)
  document.title = t('title')
}

onMounted(async () => {
  initLang()
  await getResultJson()
  loading.value = false
})
</script>

<template>
  <header class="container mx-auto mt-2 px-2">
    <div class="border-b border-black/10 dark:border-white/10 w-full my-1 py-1 flex flex-row">
      <button
        class="px-2 py-1 aria-checked:text-accent hover:text-white/70 transition-all"
        :aria-checked="currentTab === 'home'"
        @click="currentTab = 'home'"
      >
        {{ $t('header.home') }}
      </button>
      <button
        class="px-2 py-1 aria-checked:text-accent hover:text-white/70 transition-all"
        :aria-checked="currentTab === 'map'"
        @click="currentTab = 'map'"
      >
        {{ $t('header.map') }} (dev)
      </button>
      <Select class="ml-auto appearance-none" v-model="lang" name="language">
        <option :value="__lang" v-for="__lang in availableLocales" :key="__lang">
          {{ messages[__lang]['emoji'] }} {{ messages[__lang]['lang'] }}
        </option>
      </Select>
    </div>
  </header>
  <main class="container mx-auto p-2" v-if="loading">
    <div role="status" class="flex gap-2 justify-center p-5">
      <svg
        aria-hidden="true"
        class="inline w-8 h-8 animate-spin fill-accent text-black/10 dark:text-white/10"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="my-auto text-black/70 dark:text-white/70 text-xl">{{ $t('loading') }}</span>
    </div>
  </main>
  <main class="container mx-auto p-2" v-else>
    <Home v-if="currentTab == 'home'" />
    <Map v-if="currentTab == 'map'" />
  </main>
  <footer class="container mx-auto px-2 mb-2 text-white/70">
    <div class="w-full my-1 p-1 flex justify-between border-t border-black/10 dark:border-white/10">
      <a href="https://github.com/exi66/bdo-sieges" class="hover:underline flex">
        <i class="bi bi-github me-2 text-xl"></i>
        <small class="my-auto">{{ $t('footer.copyright') }}</small>
      </a>
    </div>
  </footer>
</template>
