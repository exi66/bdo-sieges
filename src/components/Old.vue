<template>
  <!-- This is old ui save, maybe delete later -->
  <div class="flex flex-col gap-2 w-80">
    <fieldset class="flex flex-wrap gap-1 border rounded border-black/20 dark:border-white/20 p-1">
      <legend class="text-sm text-black/70 dark:text-white/70 px-2 mx-2">
        {{ $t("map.funs") }}
      </legend>
      <div class="w-full grid grid-cols-1 gap-1">
        <button @click="toggleDrawCastleOwners()" type="button"
          class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 hover:opacity-70 transition-all leading-6 text-sm">
          {{ $t("map.drawOwners") }}
        </button>
      </div>
    </fieldset>
    <fieldset class="flex flex-wrap gap-1 border rounded border-black/20 dark:border-white/20 p-1">
      <legend class="text-sm text-black/70 dark:text-white/70 px-2 mx-2">
        {{ $t("map.fastTravel") }}
      </legend>
      <div class="w-full grid grid-cols-2 gap-1">
        <button @click="toCalpheon()" type="button"
          class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 hover:opacity-70 transition-all leading-6 text-sm">
          {{ $t("map.calpheon") }}
        </button>
        <button @click="toBalenos()" type="button"
          class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 hover:opacity-70 transition-all leading-6 text-sm">
          {{ $t("map.balenos") }}
        </button>
        <button @click="toMediah()" type="button"
          class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 hover:opacity-70 transition-all leading-6 text-sm">
          {{ $t("map.mediah") }}
        </button>
        <button @click="toValencia()" type="button"
          class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 hover:opacity-70 transition-all leading-6 text-sm">
          {{ $t("map.valencia") }}
        </button>
      </div>
    </fieldset>
    <fieldset class="flex flex-wrap gap-1 border rounded border-black/20 dark:border-white/20 p-1">
      <legend class="text-sm text-black/70 dark:text-white/70 px-2 mx-2">
        {{ $t("map.addFortress") }}
      </legend>
      <div class="w-full grid grid-cols-10">
        <button @click="colorFortress = n" type="button" class="p-0.5 hover:opacity-70 transition-all" v-for="n in 40"
          :key="`colorsButtonC${n}`" :class="`color-${n}`">
          <div
            class="h-7 bg-[--color] box-border aria-checked:outline-2 aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded"
            :aria-checked="colorFortress == n">
          </div>
        </button>
      </div>
      <div class="w-full grid grid-cols-10">
        <button @click="iconFortress = item" type="button" class="p-0.5 hover:opacity-70 transition-all"
          v-for="item in icons" :key="`iconsButtonC${item}`" :class="item">
          <div
            class="h-7 box-border aria-checked:outline-2 aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded icon bg-no-repeat bg-auto bg-center"
            :aria-checked="iconFortress == item">
          </div>
        </button>
      </div>
      <input v-model="nameFortress" name="tooltip" type="text"
        class="flex-1 rounded bg-black/10 dark:bg-white/10 px-2 py-1 text-sm leading-6"
        :placeholder="$t('map.tooltipInputPlaceholder')" />
      <button @click="createMarker()" type="button" :title="$t('map.add')"
        class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 hover:opacity-70 transition-all">
        <i class="bi bi-plus-lg"></i>
      </button>
    </fieldset>
    <fieldset class="border rounded border-black/20 dark:border-white/20 relative">
      <legend class="text-sm text-black/70 dark:text-white/70 px-2 mx-2">
        {{ $t("map.editFortress") }}
      </legend>
      <div class="absolute w-full h-full bg-black/30 backdrop-blur-sm flex" v-show="!selectedFortress">
        <span class="m-auto">
          {{ $t("map.emptySelectedFortress") }}
        </span>
      </div>
      <div class="flex flex-col gap-1 p-1">
        <div class="grid grid-cols-10">
          <button @click="changeColorSelected(n)" type="button" class="p-0.5 hover:opacity-70 transition-all"
            v-for="n in 40" :key="`colorsButtonE${n}`" :class="`color-${n}`">
            <div
              class="h-7 bg-[--color] box-border aria-checked:outline-2 aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded"
              :aria-checked="selectedColorFortress == n">
            </div>
          </button>
        </div>
        <div class="w-full grid grid-cols-10">
          <button @click="changeIconSelected(item)" type="button" class="p-0.5 hover:opacity-70 transition-all"
            v-for="item in icons" :key="`iconsButtonE${item}`" :class="item">
            <div
              class="h-7 box-border aria-checked:outline-2 aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded icon bg-no-repeat bg-auto bg-center"
              :aria-checked="selectedIconFortress == item">
            </div>
          </button>
        </div>
        <div class="flex gap-1">
          <input v-model="selectedNameFortress" name="tooltip" type="text" @change="changeTooltipSelected()"
            class="flex-1 rounded bg-black/10 dark:bg-white/10 px-2 py-1 text-sm leading-6"
            :placeholder="$t('map.tooltipInputPlaceholder')" />
        </div>
        <div class="flex gap-1">
          <button @click="lockSelected()" type="button"
            class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 flex-1 group hover:opacity-70 transition-all"
            :aria-checked="selectedFortressDraggable"
            :title="selectedFortressDraggable ? $t('map.lock') : $t('map.unlock')">
            <i class="bi bi-lock group-aria-checked:hidden"></i>
            <i class="bi bi-unlock hidden group-aria-checked:inline"></i>
          </button>
          <button @click="deleteSelected()" type="button"
            class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 flex-1 hover:opacity-70 transition-all"
            :title="$t('map.delete')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </fieldset>
  </div>
</template>