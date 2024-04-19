<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store'

const appStore = useAppStore()
const { getNodesOwners, getCalpheonOwner, getBalenosOwner, getMediahOwner, getValenciaOwner } = storeToRefs(appStore)
</script>

<template>
  <fieldset class="border border-black/20 dark:border-white/20 rounded p-2">
    <legend class="mx-2 px-1 text-2xl text-black/70 dark:text-white/70">{{ $t("home.castles") }}</legend>
    <div class="flex flex-row flex-wrap gap-2">
      <div class="flex-1 bg-[#601413] rounded p-2 flex gap-2">
        <img src="/images/calpheonBanner.png" class="w-12 my-auto" />
        <div class="flex flex-col my-auto">
          <span class="text-xl">{{ $t("map.calpheon") }}</span>
          <span class="text-black/70 dark:text-white/70">{{ getCalpheonOwner?.C_guildName }}</span>
        </div>
      </div>
      <div class="flex-1 bg-[#2a4149] rounded p-2 flex gap-2">
        <img src="/images/balenosBanner.png" class="w-12 my-auto" />
        <div class="flex flex-col my-auto">
          <span class="text-xl">{{ $t("map.balenos") }}</span>
          <span class="text-black/70 dark:text-white/70">{{ getBalenosOwner?.C_guildName }}</span>
        </div>
      </div>
      <div class="flex-1 bg-[#283a30] rounded p-2 flex gap-2">
        <img src="/images/mediahBanner.png" class="w-12 my-auto" />
        <div class="flex flex-col my-auto">
          <span class="text-xl">{{ $t("map.mediah") }}</span>
          <span class="text-black/70 dark:text-white/70">{{ getMediahOwner?.C_guildName }}</span>
        </div>
      </div>
      <div class="flex-1 bg-[#302533] rounded p-2 flex gap-2">
        <img src="/images/valenciaBanner.png" class="w-12 my-auto" />
        <div class="flex flex-col my-auto">
          <span class="text-xl">{{ $t("map.valencia") }}</span>
          <span class="text-black/70 dark:text-white/70">{{ getValenciaOwner?.C_guildName }}</span>
        </div>
      </div>
    </div>
  </fieldset>
  <fieldset class="border border-black/20 dark:border-white/20 rounded p-2">
    <legend class="mx-2 px-1 text-2xl text-black/70 dark:text-white/70">{{ $t("home.nodes") }}</legend>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
      <div class="rounded p-2 flex gap-2 bg-black/10 dark:bg-white/10" v-for="item in getNodesOwners" :key="item">
        <span class="text-black/70 dark:text-white/70">{{ item.C_guildName }}</span>
      </div>
    </div>
  </fieldset>
</template>
