import { debounce } from "./helpers.js";
import { apiLoadChargers, Site } from "./services.js";
import { createMarker, updateMarker, resetMarkers, createMarkerClusterer } from "./marker.js";

//export let MarkerLibrary: google.maps.MarkerLibrary

export let map: google.maps.Map;
export let sites: Site[] = [];

let chargerType = 'ccs'

async function initMap(): Promise<void> {
  const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
  //MarkerLibrary = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

  map = new Map(document.getElementById("map") as HTMLElement, {
    zoom: 11,
    center: { lat: 53.300, lng: -2.402 },
    mapId: 'available_chargers',
  });

  map.addListener("bounds_changed", (e) => { 
    //console.log("bounds_changed ", e) 
    loadChargersDebounced();
  });
  map.addListener("drag", (e) => {
    //console.log("drag ", e)
    loadChargersDebounced();
  });
  map.addListener("zoom_changed", (e) => { 
    //console.log("zoom_changed ", e) 
    loadChargersDebounced();
  });

}

initMap()

async function loadChargers() {
  let b = map.getBounds();
  let lat2 = b.getNorthEast().lat();
  let lon2 = b.getNorthEast().lng();
  let lat = b.getSouthWest().lat();
  let lon = b.getSouthWest().lng();

  console.log(`getbounds latlon (${lat.toFixed(3)}, ${lon.toFixed(3)}), latlon2 (${lat2.toFixed(3)}, ${lon2.toFixed(3)}) `);
  let results = await apiLoadChargers(lat,lon, lat2,lon2, chargerType);
  
  createMarkerClusterer(map)

  for (let site of results) {
    let found = isSiteAlreadyInCache(site)
    let oldSite = found==-1 ? undefined : sites[found];
    if (oldSite) {  /* EXISTING */
      site.marker = oldSite.marker;
      sites[found] = site;
    }
  
    if (oldSite) {
      /* UPDATE any marker attributes if different */
      await updateMarker(site, oldSite) /** @TODO: implement this */
    } else {
      /* CREATE new marker */
      await createMarker(site, map)
      sites.push(site)
    }
    if (!oldSite) {
    }
  }
}

const loadChargersDebounced = debounce(() => loadChargers(), 500);

function isSiteAlreadyInCache(site: Site) {
  return sites.findIndex(s => s.id === site.id)
}


function fastTabButtonClick() {
  document.getElementById("fast-tab-button").classList.add("selected");
  document.getElementById("slow-tab-button").classList.remove("selected");
  if (chargerType !== 'ccs') {
    chargerType = 'ccs'
    resetMarkers()
    sites=[]
    loadChargers()
  }
}
function slowTabButtonClick() {
  document.getElementById("fast-tab-button").classList.remove("selected");
  document.getElementById("slow-tab-button").classList.add("selected");
  if (chargerType !== 'any') {
    chargerType = 'any'
    resetMarkers()
    sites=[]
    loadChargers()
  }
}
window.onload = function() {
  document.getElementById("fast-tab-button").addEventListener("click", fastTabButtonClick);
  document.getElementById("slow-tab-button").addEventListener("click", slowTabButtonClick);
}

