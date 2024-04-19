<script setup>
import L from 'leaflet'
import { ref, onMounted, watch, computed } from 'vue'
import { fortressIcon, crownIcon } from '@/map/markers'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store'
import ContextMenu from 'primevue/contextmenu'
import OverlayPanel from 'primevue/overlaypanel';
import { flagIcon } from '../map/markers'


//fix https://salesforce.stackexchange.com/questions/180977/leaflet-error-when-zoom-after-close-popup-in-lightning-component
L.Popup.prototype._animateZoom = function (e) {
  if (!this._map) {
    return
  }
  let pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
    anchor = this._getAnchor()
  L.DomUtil.setPosition(this._container, pos.add(anchor))
}

const helpOverlay = ref()
const shareOverlay = ref()
const copyExportButton = ref()
const exportString = ref(null)
const menu = ref()
const items = ref([
  {
    label: 'map.drawOwners',
    icon: 'bi bi-eye-fill',
    //shortcut: 'Alt + C',
    command: () => {
      toggleDrawCastleOwners()
    }
  },
  {
    separator: true
  },
  {
    label: 'map.calpheon',
    //shortcut: 'Alt + 1',
    command: () => {
      toCalpheon()
    }
  },
  {
    label: 'map.balenos',
    //shortcut: 'Alt + 2',
    command: () => {
      toBalenos()
    }
  },
  {
    label: 'map.mediah',
    //shortcut: 'Alt + 3',
    command: () => {
      toMediah()
    }
  },
  {
    label: 'map.valencia',
    //shortcut: 'Alt + 4',
    command: () => {
      toValencia()
    }
  },
  {
    separator: true
  },
  {
    isInterface: true
  }
])

const appStore = useAppStore()
const { getCalpheonOwner, getMediahOwner, getValenciaOwner } = storeToRefs(appStore)

const map = ref(null)
const dataMarkers = ref(new Map())
const objectMarkers = ref([])
const castlesOwners = ref([])

const iconFortress = ref('icon-empty')
const nameFortress = ref(null)
const colorFortress = ref(1)
const coordsFortress = ref(null)

const selectedFortress = ref(null)
const selectedFortressFlag = ref(false)
const selectedNameFortress = ref(null)
const selectedColorFortress = ref(null)
const selectedIconFortress = ref(null)
const selectedFortressDraggable = computed(() => {
  if (!selectedFortress.value || !selectedFortressFlag.value) return false
  return selectedFortress.value.dragging.enabled()
})

const icons = [
  'icon-empty', 'icon-crown',
  'icon-shield', 'icon-sword',
  'icon-cannon', 'icon-first',
  'icon-second', 'icon-third',
  'icon-fourth', 'icon-fifth'
]

watch(selectedFortressFlag, () => {
  if (selectedFortressFlag.value && selectedFortress.value && selectedFortress.value._icon)
    L.DomUtil.addClass(selectedFortress.value._icon, 'selected-marker')
  if (!selectedFortressFlag.value && selectedFortress.value && selectedFortress.value._icon)
    L.DomUtil.removeClass(selectedFortress.value._icon, 'selected-marker')
})

onMounted(() => {
  createMap()
  createCastleOwners()
})

const createMap = function () {
  const coordsStr = localStorage.getItem('coords')
  if (coordsStr) {
    const coords = JSON.parse(localStorage.getItem('coords'))
    map.value = L.map('map').setView([coords.lat, coords.lng], localStorage.getItem('zoom') || 6)
  } else {
    map.value = L.map('map').setView([14.6, 137], localStorage.getItem('zoom') || 6)
  }

  //for debug (db click print coords)
  map.value.on('dblclick', function (event) {
    console.log(event.latlng)
  })

  map.value.on('contextmenu', function (event) {
    coordsFortress.value = event.latlng
  })

  //save coords
  map.value.on('moveend', function () {
    const coords = map.value.getBounds().getCenter()
    localStorage.setItem('coords', JSON.stringify({ lat: coords.lat, lng: coords.lng }))
  })

  //save zoom
  map.value.on('zoomend', function () {
    localStorage.setItem('zoom', map.value._zoom)
  })

  L.tileLayer('https://bdocodex.com/zonemap/main/{z}/{x}/{y}.webp', {
    noWrap: true,
    maxZoom: 7,
    minZoom: 2,
    attribution: 'map layouts by <a href="https://bdocodex.com/">bdocodex</a>'
  }).addTo(map.value)
  //https://github.com/Leaflet/Leaflet/pull/8109
  map.value.attributionControl.setPrefix('')
}

const createCastleOwners = function () {
  const svgCrown = crownIcon(['color-crown'])
  const valenciaMarker = L.marker([14.6, 137], { icon: svgCrown }).addTo(map.value)
  if (getValenciaOwner && getValenciaOwner.value.C_guildName) {
    valenciaMarker.bindPopup(getValenciaOwner.value.C_guildName)
  }
  const calpheonMarker = L.marker([-24.6, -30.7], { icon: svgCrown }).addTo(map.value)
  if (getCalpheonOwner && getCalpheonOwner.value.C_guildName) {
    calpheonMarker.bindPopup(getCalpheonOwner.value.C_guildName)
  }
  const mediahMarker = L.marker([-12.9, 42.7], { icon: svgCrown }).addTo(map.value)
  if (getMediahOwner && getMediahOwner.value.C_guildName) {
    mediahMarker.bindPopup(getMediahOwner.value.C_guildName)
  }
  castlesOwners.value = [valenciaMarker, calpheonMarker, mediahMarker]
}

const toggleDrawCastleOwners = function () {
  for (let c of castlesOwners.value) {
    if (map.value.hasLayer(c)) map.value.removeLayer(c)
    else map.value.addLayer(c)
  }
}

const createMarker = function (baseIconIndex, colorIndex = null, iconName = null, tooltipText = null, isDraggable = true, coords = null) {

  let svgIcon

  switch (baseIconIndex) {
    case 0:
      svgIcon = fortressIcon([`color-${colorIndex || colorFortress.value}`, iconName || iconFortress.value])
      break;
    case 1:
      svgIcon = flagIcon([`color-${colorIndex || colorFortress.value}`, iconName || iconFortress.value])
      break;
    default:
      svgIcon = fortressIcon([`color-${colorIndex || colorFortress.value}`, iconName || iconFortress.value])
  }

  const marker = L.marker(coords ? [coords.lat, coords.lng] : (coordsFortress.value || map.value.getBounds().getCenter()), {
    draggable: isDraggable,
    autoPan: true,
    icon: svgIcon
  })
  marker.addTo(map.value)
  marker.on('contextmenu', function () {
    selectedNameFortress.value = marker.getPopup()?.getContent()
    const classList = marker.getIcon().options.className.split(' ')
    for (let c of classList) {
      if (c.includes('color')) {
        selectedColorFortress.value = parseInt(marker.getIcon().options.className.split('-')[1])
      }
      if (c.includes('icon')) {
        selectedIconFortress.value = c
      }
    }

    selectedFortressFlag.value = true
    selectedFortress.value = marker
  })
  marker.on('dragend', function (e) {
    const m = e.target
    let old = dataMarkers.value.get(m._leaflet_id)
    old.l = { lat: m._latlng.lat, lng: m._latlng.lng }
    dataMarkers.value.set(m._leaflet_id, old)
  })
  if (tooltipText || nameFortress.value) {
    marker.bindPopup('' + tooltipText || nameFortress.value)
  }
  dataMarkers.value.set(marker._leaflet_id, {
    t: baseIconIndex,
    c: colorIndex || colorFortress.value,
    i: iconName || iconFortress.value,
    p: tooltipText || nameFortress.value,
    d: isDraggable,
    l: { lat: marker._latlng.lat, lng: marker._latlng.lng }
  })
  objectMarkers.value.push(marker)
}

const clearMarkers = function () {
  for (let i = 0; i < objectMarkers.value.length; i++) {
    map.value.removeLayer(objectMarkers.value[i])
  }
  for (let i = 0; i < objectMarkers.value.length; i++) {
    objectMarkers.value.pop()
  }
  dataMarkers.value.clear()
}

const getMarkers = computed(() => {
  return [...dataMarkers.value.values()]
})

const getMarkersBase64 = computed(() => {
  if (getMarkers.value.length < 1) return ''
  return btoa(JSON.stringify(getMarkers.value))
})

const lockSelected = function () {
  if (!selectedFortressFlag.value) return
  if (selectedFortressDraggable.value) selectedFortress.value.dragging.disable()
  else selectedFortress.value.dragging.enable()

  let old = dataMarkers.value.get(selectedFortress.value._leaflet_id)
  old.d = selectedFortressDraggable.value
  dataMarkers.value.set(selectedFortress.value._leaflet_id, old)
}

const changeColorSelected = function (n) {
  if (!selectedFortressFlag.value) return
  for (let c = 1; c <= 40; c++) {
    if (L.DomUtil.hasClass(selectedFortress.value._icon, `color-${c}`))
      L.DomUtil.removeClass(selectedFortress.value._icon, `color-${c}`)
  }
  // this sometime not working, i don't know why
  // L.DomUtil.removeClass(selectedFortress.value._icon, `color-${selectedColorFortress.value}`)
  L.DomUtil.addClass(selectedFortress.value._icon, `color-${n}`)
  selectedColorFortress.value = n

  let old = dataMarkers.value.get(selectedFortress.value._leaflet_id)
  old.c = n
  dataMarkers.value.set(selectedFortress.value._leaflet_id, old)
}

const changeIconSelected = function (icon) {
  if (!selectedFortressFlag.value) return
  for (let i of icons) {
    if (L.DomUtil.hasClass(selectedFortress.value._icon, `${i}`))
      L.DomUtil.removeClass(selectedFortress.value._icon, `${i}`)
  }
  // this sometime not working, i don't know why
  // L.DomUtil.removeClass(selectedFortress.value._icon, `${selectedIconFortress.value}`)
  L.DomUtil.addClass(selectedFortress.value._icon, `${icon}`)
  selectedIconFortress.value = icon

  let old = dataMarkers.value.get(selectedFortress.value._leaflet_id)
  old.i = icon
  dataMarkers.value.set(selectedFortress.value._leaflet_id, old)
}

const changeTooltipSelected = function () {
  if (!selectedFortressFlag.value) return
  if (!selectedNameFortress.value) {
    selectedFortress.value.unbindPopup()
  } else if (selectedFortress.value.getPopup() == undefined) {
    selectedFortress.value.bindPopup('' + selectedNameFortress.value)
  } else {
    selectedFortress.value.setPopupContent('' + selectedNameFortress.value)
  }

  let old = dataMarkers.value.get(selectedFortress.value._leaflet_id)
  old.p = selectedFortress.value.getPopup() ? selectedFortress.value.getPopup().getContent() : null
  dataMarkers.value.set(selectedFortress.value._leaflet_id, old)
}

const deleteSelected = function () {
  dataMarkers.value.delete(selectedFortress.value._leaflet_id)
  map.value.removeLayer(selectedFortress.value)
  selectedFortressFlag.value = false
  selectedFortress.value = null
}

const toBalenos = function () {
  map.value.setView([-9.6, 10.5], 6);
}

const toMediah = function () {
  map.value.setView([-12.9, 42.7], 6);
}

const toValencia = function () {
  map.value.setView([14.6, 137], 6);
}

const toCalpheon = function () {
  map.value.setView([-24.6, -30.7], 6);
}

const onRightClick = function (event) {
  menu.value.show(event)
}

const toggleHelp = function (event) {
  helpOverlay.value.toggle(event)
}

const toggleShare = function (event) {
  shareOverlay.value.toggle(event)
}

const closeHelp = function () {
  helpOverlay.value.hide()
}

const copyExport = function () {
  if (copyExportButton.value) {
    copyExportButton.value.ariaChecked = "true"
    setTimeout(function () {
      if (copyExportButton.value)
        copyExportButton.value.ariaChecked = "false"
    }, 3000);
  }
  navigator.clipboard.writeText(getMarkersBase64.value)
}

const parseError = ref(false)
//I know it looks ugly
const pasteExport = function () {
  parseError.value = false
  if (!exportString.value) return
  try {
    const json = JSON.parse(atob(exportString.value))
    if (!(json instanceof Array)) {
      parseError.value = true
      return
    }
    for (let c of json) {
      if (
        !Object.hasOwn(c, 't') ||
        !Object.hasOwn(c, 'c') ||
        !Object.hasOwn(c, 'i') ||
        !Object.hasOwn(c, 'p') ||
        !Object.hasOwn(c, 'd') ||
        !Object.hasOwn(c, 'l')
      ) {
        parseError.value = true
        return
      }
      if (
        (typeof c.t !== 'number') ||
        (typeof c.c !== 'number') ||
        (c.t !== 0 && c.t !== 1) ||
        (c.c <= 0 || c.c > 40) ||
        (typeof c.i !== 'string') ||
        (typeof c.p !== 'string' && c.p !== null) ||
        (typeof c.d !== 'boolean') ||
        (typeof c.l !== 'object') ||
        (!Object.hasOwn(c.l, 'lat')) ||
        (!Object.hasOwn(c.l, 'lng'))
      ) {
        parseError.value = true
        return
      }
      if (
        (typeof c.l.lat !== 'number') || (typeof c.l.lng !== 'number')
      ) {
        parseError.value = true
        return
      }
      c.c = parseInt(c.c)
    }
    clearMarkers()
    for (const c of json) {
      createMarker(c.t, c.c, c.i, c.p, c.d, c.l)
    }
  } catch (e) {
    parseError.value = true
    return
  }
}
</script>

<template>
  <div class="flex flex-row gap-2">
    <ContextMenu @contextmenu.prevent ref="menu" v-bind:model="items"
      class="bg-black/80 backdrop-blur rounded text-white/80 shadow w-80 context-menu"
      @hide="selectedFortressFlag = false">
      <template #item="{ item, props }">
        <a v-if="!item.isInterface"
          class="flex px-2 py-1 text-white/80 hover:bg-white/20 transition-all cursor-pointer gap-2 text-sm"
          v-bind="props.action">
          <i :class="item.icon" class="w-4 h-4 block" />
          <span>{{ $t(item.label) }}</span>
          <span v-if="item.shortcut" class="ml-auto text-xs my-auto text-white/60">
            {{ item.shortcut }}
          </span>
        </a>
        <div v-else-if="!selectedFortressFlag" @click.stop class="flex flex-wrap p-2 gap-1">
          <div class="w-full grid grid-cols-10">
            <button @click.stop="colorFortress = n" type="button" class="p-0.5 hover:opacity-70 transition-all"
              v-for="n in 40" :key="`colorsButtonC${n}`" :class="`color-${n}`">
              <div
                class="h-7 bg-[--color] box-border aria-checked:outline-2 aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded"
                :aria-checked="colorFortress == n">
              </div>
            </button>
          </div>
          <div class="w-full grid grid-cols-10">
            <button @click.stop="iconFortress = item" type="button" class="p-0.5 hover:opacity-70 transition-all"
              v-for="item in icons" :key="`iconsButtonC${item}`" :class="item">
              <div
                class="h-7 box-border aria-checked:outline-2 aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded icon bg-no-repeat bg-auto bg-center"
                :aria-checked="iconFortress == item">
              </div>
            </button>
          </div>
          <input v-model="nameFortress" name="tooltip" type="text" @click.stop @keyup.prevent
            class="flex-1 rounded bg-black/10 dark:bg-white/10 px-2 py-1 text-sm leading-6"
            :placeholder="$t('map.tooltipInputPlaceholder')" />
          <div class="w-full flex gap-1">
            <button @click="createMarker(0)" type="button" :title="$t('map.add')"
              class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 hover:opacity-70 transition-all flex-1 flex justify-center">
              <i class="bi bi-plus-lg"></i><span class="text-sm ms-1 my-auto">{{ $t('map.fortress') }}</span>
            </button>
            <button @click="createMarker(1)" type="button" :title="$t('map.add')"
              class="bg-black/10 dark:bg-white/10 rounded px-2 py-1 hover:opacity-70 transition-all flex-1 flex justify-center">
              <i class="bi bi-plus-lg"></i><span class="text-sm ms-1 my-auto">{{ $t('map.flag') }}</span>
            </button>
          </div>
        </div>
        <div v-else @click.stop class="flex flex-wrap p-2 gap-1">
          <div class="w-full grid grid-cols-10">
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
          <div class="w-full flex gap-1">
            <input v-model="selectedNameFortress" name="tooltip" type="text" @change="changeTooltipSelected()"
              class="flex-1 rounded bg-black/10 dark:bg-white/10 px-2 py-1 text-sm leading-6"
              :placeholder="$t('map.tooltipInputPlaceholder')" />
          </div>
          <div class="w-full flex gap-1">
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
      </template>
    </ContextMenu>
    <div class="flex-1 py-2.5">
      <div class="relative">
        <OverlayPanel ref="shareOverlay">
          <div class="bg-black/80 backdrop-blur rounded p-2 mt-3 w-80 arrow-top">
            <div class="flex flex-col gap-2">
              <div>
                <div class="flex mb-1">
                  <label for="export" class="block font-semibold my-auto text-sm">
                    {{ $t('map.shareExport') }}
                  </label>
                </div>
                <div class="relative">
                  <button type="button" ref="copyExportButton"
                    class="bg-black/10 dark:bg-white/10 aria-checked:bg-accent dark:aria-checked:bg-accent text-white rounded px-1 leading-6 text-sm hover:opacity-80 disabled:hover:opacity-50 disabled:opacity-50 transition-all ml-auto absolute top-1 right-1 group"
                    @click="copyExport()" :disabled="getMarkersBase64.length < 1" :title="$t('map.shareCopy')">
                    <i class="bi bi-copy group-aria-checked:hidden"></i>
                    <i class="bi bi-check2 hidden group-aria-checked:inline"></i>
                  </button>
                  <input id="export" type="text" :placeholder="$t('map.shareExportPlacegolder')"
                    class="flex-1 rounded bg-black/10 dark:bg-white/10 px-2 pr-8 py-1 text-sm leading-6 w-full resize-none"
                    v-model="getMarkersBase64" readonly />
                </div>
              </div>
              <div>
                <label for="import" class="flex font-semibold my-auto text-sm mb-1">
                  {{ $t('map.shareImport') }}
                  <span class="text-xs ms-auto my-auto text-red-500" v-show="parseError">
                    {{ $t('map.shareBad') }}
                  </span>
                </label>
                <input id="import" :placeholder="$t('map.shareImportPlacegolder')" type="text" @input="pasteExport()"
                  v-model="exportString"
                  class="flex-1 rounded box-border bg-black/10 dark:bg-white/10 px-2 py-1 text-sm leading-6 w-full resize-none data-[valid='false']:border-red-500 border-transparent border"
                  :data-valid="!parseError" />
              </div>
            </div>
          </div>
        </OverlayPanel>
        <OverlayPanel ref="helpOverlay">
          <div class="bg-black/80 backdrop-blur rounded p-2 mt-3 w-80 arrow-top">
            <label class="text-sm font-semibold">
              {{ $t('map.howToUseLabel') }}
            </label>
            <p class="text-white/80 text-sm">
              {{ $t('map.howToUseText') }}
            </p>
            <button type="button"
              class="bg-accent text-white rounded px-2 py-1 leading-6 text-sm hover:opacity-80 transition-all mt-2 w-full"
              @click="closeHelp()">
              {{ $t('map.helpCloseButton') }}
            </button>
          </div>
        </OverlayPanel>
        <div class="absolute right-0 z-[1000] pr-2.5 pt-2.5 flex gap-2.5">
          <button type="button" :title="$t('map.shareButton')"
            class="bg-accent text-white shadow rounded px-2 py-1 leading-6 hover:opacity-80 transition-all"
            @click="toggleShare($event)">
            <i class="bi bi-share"></i>
          </button>
          <button type="button" :title="$t('map.helpButton')"
            class="bg-accent text-white shadow rounded px-2 py-1 leading-6 hover:opacity-80 transition-all"
            @click="toggleHelp($event)">
            <i class="bi bi-question"></i>
          </button>
        </div>
        <div id="map" style="height: 80vh;" class="rounded" @contextmenu="onRightClick($event)"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.arrow-top {
  position: relative;
}

.arrow-top:before,
.arrow-top:after {
  content: "";
  position: absolute;
  right: 8px;
  top: -16px;
  border-top: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid #00000080;
  border-left: 8px solid transparent;
}

.arrow-top:after {
  border-bottom: 8px solid #00000080;
  top: -16px;
}
</style>
<style src="@/assets/map.css"></style>
<style src="leaflet/dist/leaflet.css"></style>
