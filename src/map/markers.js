import L from 'leaflet'

const fortress = function (classList) {
  return L.divIcon({
    html: `<div class="marker">
    <i class="marker-icon icon"></i>
    <div class="marker-bg">
      <svg version="1.1" viewBox="0 0 36 60" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
      <style type="text/css">
        .st0{fill:var(--color, #FF0000);stroke:var(--stroke-color, #00000080);stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
      </style>
      <polygon class="st0" points="35.2 19.9 35.2 24 33.3 25.9 33.3 49.5 26.9 55.9 24.2 53.1 18 59.3 11.8 53.1 9.1 55.9 2.7 49.5 2.7 25.9 0.8 24 0.8 19.9 2.7 18 9.8 18 9.8 8.3 8.6 7.1 8.6 2.7 10.4 1 12.6 1 15.2 3.5 18 0.7 20.8 3.5 23.4 1 25.7 1 27.4 2.7 27.4 7.1 26.2 8.3 26.2 18 33.3 18"/>
      </svg>
    </div>
  </div>`,
    className: classList.join(' '),
    iconSize: [36, 60],
    iconAnchor: [18, 60],
    popupAnchor: [0, -60]
  })
}

const crown = function (classList) {
  return L.divIcon({
    html: `<div class="marker"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 20">
      <style type="text/css">
        .st0{fill:var(--color, #FF0000);stroke:var(--stroke-color, #00000080);stroke-linecap:round;stroke-linejoin:round;stroke-width:0.5;}
      </style>
      <path class="st0" d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"></path>
    </svg></div>`,
    className: classList.join(' '),
    iconSize: [48, 40],
    iconAnchor: [24, 40],
    popupAnchor: [0, -40]
  })
}

const flag = function (classList) {
  return L.divIcon({
    html: `<div class="marker">
      <i class="marker-icon marker-flag icon"></i>
    <div class="marker-bg">
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <style type="text/css">
        .st0{fill:var(--color, #FF0000);stroke:var(--stroke-color, #00000080);stroke-linecap:round;stroke-linejoin:round;stroke-width:0.5;}
      </style>
      <path class="st0" d="M6,30H4V2H28l-5.8,9L28,20H6Z"/>
    </svg></div>
    </div>`,
    className: classList.join(' '),
    iconSize: [40, 40],
    iconAnchor: [2, 40],
    popupAnchor: [20, -40]
  })
}

const circle = function (classList) {
  return L.divIcon({
    html: `<div class="marker">
      <i class="marker-icon marker-circle icon"></i>
    <div class="marker-bg">
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <style type="text/css">
        .st0{fill:var(--color, #FF0000);stroke:var(--stroke-color, #00000080);stroke-linecap:round;stroke-linejoin:round;stroke-width:0.5;}
      </style>
      <circle class="st0" cx="8" cy="8" r="8"/>
    </svg></div>
    </div>`,
    className: classList.join(' '),
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [18, -36]
  })
}

export { fortress as fortressIcon, crown as crownIcon, flag as flagIcon, circle as circleIcon }
