<script setup>
import { useI18n } from 'vue-i18n'
import L from 'leaflet'
import { ref, onMounted, watch, computed } from 'vue'
import { fortressIcon, crownIcon, flagIcon } from '@/map/markers'
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/store'
import ContextMenu from 'primevue/contextmenu'
import OverlayPanel from 'primevue/overlaypanel'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'

//fix https://salesforce.stackexchange.com/questions/180977/leaflet-error-when-zoom-after-close-popup-in-lightning-component
L.Popup.prototype._animateZoom = function (e) {
  if (!this._map) {
    return
  }
  let pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center),
    anchor = this._getAnchor()
  L.DomUtil.setPosition(this._container, pos.add(anchor))
}

const { t } = useI18n()

const helpOverlay = ref()
const shareOverlay = ref()
const copyExportButton = ref()
const exportString = ref(null)
const menu = ref()
const items = [
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
]

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

const parseError = ref(false)

const icons = [
  'icon-empty', 'icon-crown',
  'icon-shield', 'icon-sword',
  'icon-cannon', 'icon-first',
  'icon-second', 'icon-third',
  'icon-fourth', 'icon-fifth'
]

// watch(selectedFortressFlag, () => {
//   if (selectedFortressFlag.value && selectedFortress.value && selectedFortress.value._icon)
//     L.DomUtil.addClass(selectedFortress.value._icon, 'selected-marker')
//   if (!selectedFortressFlag.value && selectedFortress.value && selectedFortress.value._icon)
//     L.DomUtil.removeClass(selectedFortress.value._icon, 'selected-marker')
// })

onMounted(() => {
  createMap()
  createCastleOwners()
  initMarkersFromStorage()
})

const unselectMarker = function () {
  if (selectedFortress.value && selectedFortress.value._icon) {
    L.DomUtil.removeClass(selectedFortress.value._icon, 'selected-marker')
    selectedFortressFlag.value = false
  }
}

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
      break
    case 1:
      svgIcon = flagIcon([`color-${colorIndex || colorFortress.value}`, iconName || iconFortress.value])
      break
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
    if (selectedFortress.value !== null && selectedFortress.value._leaflet_id !== marker._leaflet_id) {
      L.DomUtil.removeClass(selectedFortress.value._icon, 'selected-marker')
    }
    if (!L.DomUtil.hasClass(marker._icon, 'selected-marker')) {
      L.DomUtil.addClass(marker._icon, 'selected-marker')
    }
    selectedFortress.value = marker
    selectedFortressFlag.value = true
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

watch(getMarkers, () => {
  localStorage.setItem('markers', JSON.stringify(getMarkers.value))
}, { deep: true })

const initMarkersFromStorage = function () {
  const markersString = localStorage.getItem('markers')
  let errorFlag = false
  if (markersString) {
    try {
      const markers = JSON.parse(markersString)
      if (validateImportArray(markers)) {
        for (const c of markers) {
          createMarker(c.t, c.c, c.i, c.p, c.d, c.l)
        }
      } else errorFlag = true
    } catch (e) {
      errorFlag = true
    }
  }
  if (errorFlag) {
    console.warn('Can\'t load markers from storage! Storage cleared.')
    localStorage.removeItem('markers')
  }
}

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

const clearMap = function () {
  if (confirm(t('map.confirmClearMap')) === true) clearMarkers()
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
    copyExportButton.value.ariaChecked = 'true'
    setTimeout(function () {
      if (copyExportButton.value)
        copyExportButton.value.ariaChecked = 'false'
    }, 3000);
  }
  navigator.clipboard.writeText(getMarkersBase64.value)
}

const pasteExport = function () {
  parseError.value = false
  if (!exportString.value) return
  try {
    const markers = JSON.parse(atob(exportString.value))
    if (!validateImportArray(markers)) {
      parseError.value = true
      return
    }
    clearMarkers()
    for (const c of markers) {
      createMarker(c.t, c.c, c.i, c.p, c.d, c.l)
    }
  } catch (e) {
    parseError.value = true
    return
  }
}

const validateImportArray = function (array) {
  if (!(array instanceof Array)) return false
  return array.every(item => {
    return (typeof item === 'object') &&
      //fields
      Object.hasOwn(item, 't') &&
      Object.hasOwn(item, 'c') &&
      Object.hasOwn(item, 'i') &&
      Object.hasOwn(item, 'p') &&
      Object.hasOwn(item, 'd') &&
      Object.hasOwn(item, 'l') &&
      //type of fields
      (typeof item.t === 'number' && Number.isInteger(item.c)) &&
      (typeof item.c === 'number' && Number.isInteger(item.c)) &&
      (typeof item.i === 'string') &&
      (typeof item.p === 'string' || item.p === null) && //tooltip string or nul
      (typeof item.d === 'boolean') &&
      (typeof item.l === 'object') &&
      //valid values of fields
      (item.t === 0 || item.t === 1) && //baseicon
      (item.c > 0 && item.c <= 40) && //color
      Object.hasOwn(item.l, 'lat') && //cords
      Object.hasOwn(item.l, 'lng') &&
      (typeof item.l.lat === 'number') &&
      (typeof item.l.lng === 'number')
  })
}
</script>

<template>
  <section class="flex flex-row gap-2">
    <ContextMenu @contextmenu.prevent ref="menu" v-bind:model="items"
      class="bg-shark-900/90 backdrop-blur rounded text-white/80 shadow w-80 context-menu" @hide="unselectMarker()">
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
                class="bg-[--color] aspect-square aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded"
                :aria-checked="colorFortress == n">
              </div>
            </button>
          </div>
          <div class="w-full grid grid-cols-10">
            <button @click.stop="iconFortress = item" type="button" class="p-0.5 hover:opacity-70 transition-all"
              v-for="item in icons" :key="`iconsButtonC${item}`" :class="item">
              <div
                class="icon bg-no-repeat bg-auto bg-center aspect-square aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded"
                :aria-checked="iconFortress == item">
              </div>
            </button>
          </div>
          <Input v-model="nameFortress" name="tooltip" type="text" @click.stop @keyup.prevent
            class="flex-1 text-sm leading-6" :placeholder="$t('map.tooltipInputPlaceholder')" />
          <div class="w-full flex gap-1">
            <Button class="flex-1" @click="createMarker(0)">
              <i class="bi bi-plus-lg"></i><span class="text-sm ms-1 my-auto">{{ $t('map.fortress') }}</span>
            </Button>
            <Button class="flex-1" @click="createMarker(1)">
              <i class="bi bi-plus-lg"></i><span class="text-sm ms-1 my-auto">{{ $t('map.flag') }}</span>
            </Button>
          </div>
        </div>
        <div v-else @click.stop class="flex flex-wrap p-2 gap-1">
          <div class="w-full grid grid-cols-10 auto-rows-fr">
            <button @click="changeColorSelected(n)" type="button" class="p-0.5 hover:opacity-70 transition-all"
              v-for="n in 40" :key="`colorsButtonE${n}`" :class="`color-${n}`">
              <div
                class="bg-[--color] aspect-square aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded"
                :aria-checked="selectedColorFortress == n">
              </div>
            </button>
          </div>
          <div class="w-full grid grid-cols-10">
            <button @click="changeIconSelected(item)" type="button" class="p-0.5 hover:opacity-70 transition-all"
              v-for="item in icons" :key="`iconsButtonE${item}`" :class="item">
              <div
                class="icon bg-no-repeat bg-auto bg-center aspect-square aria-checked:outline-none aria-checked:outline-offset-0 aria-checked:outline-black dark:aria-checked:outline-white rounded"
                :aria-checked="selectedIconFortress == item">
              </div>
            </button>
          </div>
          <div class="w-full flex gap-1">
            <Input v-model="selectedNameFortress" name="tooltip" type="text" @change="changeTooltipSelected()"
              class="flex-1 text-sm leading-6" :placeholder="$t('map.tooltipInputPlaceholder')" />
          </div>
          <div class="w-full flex gap-1">
            <Button @click="lockSelected()" class="flex-1 group" :aria-checked="selectedFortressDraggable"
              :title="selectedFortressDraggable ? $t('map.lock') : $t('map.unlock')">
              <i class="bi bi-lock group-aria-checked:hidden"></i>
              <i class="bi bi-unlock hidden group-aria-checked:inline"></i>
            </Button>
            <Button @click="deleteSelected()" class="flex-1" :title="$t('map.delete')">
              <i class="bi bi-trash"></i>
            </Button>
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
                  <button ref="copyExportButton" type="button"
                    class="text-black dark:text-white aria-checked:bg-accent dark:aria-checked:bg-accent rounded px-1 leading-6 text-sm hover:opacity-80 transition-all absolute top-1/2 right-1.5 group -translate-y-1/2"
                    @click="copyExport()" :disabled="getMarkersBase64.length < 1" :title="$t('map.shareCopy')">
                    <i class="bi bi-copy group-aria-checked:hidden"></i>
                    <i class="bi bi-check2 hidden group-aria-checked:inline"></i>
                  </button>
                  <Input id="export" type="text" :placeholder="$t('map.shareExportPlacegolder')"
                    class="w-full pr-8 text-sm leading-6 truncate" v-model="getMarkersBase64" readonly />
                </div>
              </div>
              <div>
                <label for="import" class="flex font-semibold my-auto text-sm mb-1">
                  {{ $t('map.shareImport') }}
                  <span class="text-xs ms-auto my-auto text-red-500" v-show="parseError">
                    {{ $t('map.shareBad') }}
                  </span>
                </label>
                <Input id="import" :placeholder="$t('map.shareImportPlacegolder')" type="text" @input="pasteExport()"
                  v-model="exportString"
                  class="w-full text-sm leading-6 truncate data-[valid='false']:border-red-500 dark:data-[valid='false']:border-red-500 border-transparent border"
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
            <Button variant="primary" class="w-full mt-1" @click="closeHelp()">
              {{ $t('map.helpCloseButton') }}
            </Button>
          </div>
        </OverlayPanel>
        <div class="absolute right-0 z-[1000] pr-2.5 pt-2.5 flex gap-2.5">
          <Button variant="primary" :title="$t('map.clearButton')" class="shadow" @click="clearMap()">
            <i class="bi bi-trash"></i>
          </Button>
          <Button variant="primary" :title="$t('map.shareButton')" class="shadow" @click="toggleShare($event)">
            <i class="bi bi-share"></i>
          </Button>
          <Button variant="primary" :title="$t('map.helpButton')" class="shadow" @click="toggleHelp($event)">
            <i class="bi bi-question"></i>
          </Button>
        </div>
        <div id="map" class="rounded h-[80vh]" @contextmenu="onRightClick($event)"></div>
      </div>
    </div>
  </section>
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
