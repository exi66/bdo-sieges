import L from "leaflet"
import castleMarker from "@/public/icons/castle-marker.svg"
import nodeMarker from "@/public/icons/node-marker.svg"

export const createCustomNodeIcon = (node: SiegeNode) => {
  const width = 28
  const height = 32

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="relative w-full h-full">
      <img src="${nodeMarker.src}" alt="${node.name}" class="w-full h-full" />
      <div class="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-shadow-md/80 text-xs whitespace-nowrap">
        ${node.name}
      </div>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  })
}

export const createCustomCastleIcon = (node: SiegeNode) => {
  const width = 28
  const height = 32

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="relative w-full h-full">
      <img src="${castleMarker.src}" alt="${node.name}" class="w-full h-full" />
      <div class="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-shadow-md/80 text-xs whitespace-nowrap">
        ${node.name}
      </div>
    </div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
  })
}

export const createCustomFlagIcon = (
  color: number | null,
  icon: string | null,
  text: string | null,
  isActive: boolean
) => {
  const width = 32
  const height = 32
  const scale = 1

  const colorClass = color ? `color-${color}` : ""
  const iconClass = icon ? icon : "icon-empty"

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="relative w-full h-full">
      <div class="relative w-full h-full ${colorClass} group" data-active="${isActive}">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" class="group-data-active:stroke-foreground group-data-active:stroke-4 stroke-background/80 stroke-1">
          <path fill="var(--color, #FF0000)" stroke-linecap="round" stroke-linejoin="round" d="M6,30H4V2H28l-5.8,9L28,20H6Z"/>
        </svg>
        <i class="absolute h-3.5 aspect-square bg-center bg-no-repeat top-1 left-1.75 ${iconClass}"></i>
      </div>
      <div class="absolute -bottom-2.5 left-1 transform -translate-x-1/2 translate-y-1/2 text-white text-shadow-md/80 text-xs whitespace-nowrap">
        ${text}
      </div>
    </div>`,
    iconSize: [width * scale, height * scale],
    iconAnchor: [4 * scale, height * scale],
  })
}

export const createCustomFortressIcon = (
  color: number | null,
  icon: string | null,
  text: string | null,
  isActive: boolean
) => {
  const width = 36
  const height = 60
  const scale = 0.8

  const colorClass = color ? `color-${color}` : ""
  const iconClass = icon ? icon : "icon-empty"

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="relative w-full h-full">
      <div class="relative w-full h-full ${colorClass} group" data-active="${isActive}">
        <svg viewBox="0 0 36 60" xmlns="http://www.w3.org/2000/svg" class="group-data-active:stroke-foreground group-data-active:stroke-4 stroke-background/80 stroke-1">
          <polygon fill="var(--color, #FF0000)" stroke-linecap="round" stroke-linejoin="round" points="35.2 19.9 35.2 24 33.3 25.9 33.3 49.5 26.9 55.9 24.2 53.1 18 59.3 11.8 53.1 9.1 55.9 2.7 49.5 2.7 25.9 0.8 24 0.8 19.9 2.7 18 9.8 18 9.8 8.3 8.6 7.1 8.6 2.7 10.4 1 12.6 1 15.2 3.5 18 0.7 20.8 3.5 23.4 1 25.7 1 27.4 2.7 27.4 7.1 26.2 8.3 26.2 18 33.3 18"/>
        </svg>
        <i class="absolute h-3.5 aspect-square bg-center bg-no-repeat top-5 left-1/2 -translate-x-1/2 ${iconClass}"></i>
      </div>
      <div class="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-shadow-md/80 text-xs whitespace-nowrap">
        ${text}
      </div>
    </div>`,
    iconSize: [width * scale, height * scale],
    iconAnchor: [(width * scale) / 2, height * scale],
  })
}

export const createCustomPinIcon = (
  color: number | null,
  icon: string | null,
  text: string | null,
  isActive: boolean
) => {
  const width = 34
  const height = 44
  const scale = 0.8

  const colorClass = color ? `color-${color}` : ""
  const iconClass = icon ? icon : "icon-empty"

  return L.divIcon({
    className: "custom-marker",
    html: `<div class="relative w-full h-full">
      <div class="relative w-full h-full ${colorClass} group" data-active="${isActive}">
        <svg viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" class="group-data-active:stroke-foreground group-data-active:stroke-4 stroke-background/80 stroke-1">
          <path fill="var(--color, #FF0000)" stroke-linecap="round" stroke-linejoin="round" d="m1 16.749c0-8.6973 7.1642-15.749 16-15.749 8.8358 0 16 7.0518 16 15.749 0 6.3497-2.2475 8.1231-14.358 25.404-0.79425 1.1295-2.4925 1.1295-3.2867 0-12.107-17.283-14.355-19.055-14.355-25.404z"/>       
        </svg>
        <i class="absolute h-3.5 aspect-square bg-center bg-no-repeat top-2 left-1/2 -translate-x-1/2 ${iconClass}"></i>
      </div>
      <div class="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-white text-shadow-md/80 text-xs whitespace-nowrap">
        ${text}
      </div>
    </div>`,
    iconSize: [width * scale, height * scale],
    iconAnchor: [(width * scale) / 2, height * scale],
  })
}
