import { Marker, MarkerClusterer, Renderer } from "@googlemaps/markerclusterer";
import { debounce, getCounts } from "./helpers.js";
import { openInfoWindow } from "./info-window.js"
import { apiLoadChargers, Site } from "./services.js";

let MarkerLibrary: google.maps.MarkerLibrary

let map: google.maps.Map;
let sites: Site[] = [];
let markers: google.maps.marker.AdvancedMarkerElement[]=[];
let markerCluster: MarkerClusterer;
let chargerType = 'ccs'

async function initMap(): Promise<void> {
  const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
  MarkerLibrary = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

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
  
  if (!markerCluster) {
    markerCluster = new MarkerClusterer({ map, renderer: clusterRenderer, onClusterClick });
  }

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
      await createMarker(site, markerCluster)
      sites.push(site)
      markers.push(site.marker)
    }
    if (!oldSite) {
    }
  }
}

function createMarker(site: Site, markerCluster: MarkerClusterer) {
  const listMarker = document.createElement('div')
  listMarker.className = 'list-marker'
  listMarker.append( buildMarkerRow(site) )

  site.marker = new MarkerLibrary.AdvancedMarkerElement({
    map: map,
    position: { lat: site.latitude, lng: site.longitude },
    content: listMarker,
  });
  /* @ts-ignore */ 
  site.marker.site = site;
  markerCluster.addMarker(site.marker)

  site.marker.addListener("click", async () => {
    console.log(site.name+" clicked");
    openInfoWindow(site, map)
  });

}

async function updateMarker(site: Site, oldSite: Site) {
        // if (oldSite.marker?.getIcon().url !== iconUrl) {
      //   site.marker.setIcon({
      //     url: iconUrl,
      //     labelOrigin: new google.maps.Point(14, 47)
      //   });
      // }
      // if (oldSite.marker?.getLabel() !== label) {
      //   site.marker.setLabel(label);
      // }
      //site = oldSite
}

function buildMarkerRow(site: Site, first: boolean = true, last: boolean = true) {
  let { colour } = colourForSite(site)
  const row = document.createElement('div')
  row.className = 'row'+ (first ? ' first':'') + (last ? ' last':'')
  row.style.backgroundColor = colour

  const img = document.createElement('img') as HTMLImageElement;
  img.src = `pins/operator-${site.party_id}.png`
  row.append(img)

  const span = document.createElement('div') as HTMLDivElement;
  span.textContent = site.priceCcs ? Math.round(site.priceCcs * 100) + 'p' : '---'
  row.append(span)
  return row
}

function buildMarkerFooter(text: string, colour: string) {
  const row = document.createElement('div')
  row.className = 'row-footer last'
  row.style.backgroundColor = colour

  const span = document.createElement('div') as HTMLDivElement;
  span.textContent = text
  row.append(span)
  return row
}

let clusterRenderer: Renderer = {
  render: (cluster, stats, map) => {
    const MAX = 3
    const length = cluster.markers.length
    const markers = sortMarkers( cluster.markers )
    const listMarker = document.createElement('div')
    listMarker.className = 'list-marker'
    for (let i=0; i < length && i < MAX; i++) {
      const site = (markers[i] as any).site as Site;
      const row = buildMarkerRow(site, i===0, i === length-1)
      listMarker.append(row)
    }
    if (length > MAX) {
      const row = buildMarkerFooter(`+${length - MAX}`, '#777')
      listMarker.append(row)
    }

    return new MarkerLibrary.AdvancedMarkerElement({
      map,
      position: cluster.position,
      content: listMarker,
    });
  }
}

function sortMarkers( markers: Marker[]) {
  let ret = [...markers]
  return ret.sort( (a,b) => {
    let aa = statsForSite((a as any).site as Site)
    let bb = statsForSite((b as any).site as Site)
    let aValue = aa.colour=='green'?3:( aa.colour=='yellow'?2:( 1 ) )
    let bValue = bb.colour=='green'?3:( bb.colour=='yellow'?2:( 1 ) )
    return bValue - aValue
  })
}

async function onClusterClick(event, cluster, map) {
  const site = (cluster.markers[0] as any).site
  console.log("Cluster clicked. first site is "+site.name+"");
  await openInfoWindow(site, map)
}

function statsForSite(site: Site) {
  let status = parseInt(site.statusCcs || site.statusType2);  /** @TODO: pick ccs or type2 correctly */
  let colour = "";
  if ((site.statusCcs || site.statusType2) === undefined) {colour = 'gray'}
  else if (status > 75) {colour = 'red'}
  else if (status >= 50) {colour = 'yellow'}
  else if (status < 50) {colour='green'}

  return { colour }
}

function colourForSite(site: Site) {
  let status = parseInt(site.statusCcs || site.statusType2);  /** @TODO: pick ccs or type2 correctly */
  let counts = getCounts(site);
  let useCounts = (site.statusCcs ? counts.ccs : counts.type2)
  let colour = "", border='', size=1;

  if ((site.statusCcs || site.statusType2) === undefined) {colour = '#CCC'; border='#AAA'}
  else if (status > 75) {colour = '#d33d5b'}
  else if (status >= 50) {colour = '#F5C125'}
  else if (status < 50) {colour='#207868'}
  if (useCounts.outoforder>=1 && useCounts.outoforder === useCounts.total) {colour = '#666'}

  if (useCounts.total >= 8) {size = 1.175}
  else if (useCounts.total >= 3) {size = 1}
  else if (useCounts.total <= 2) {size = 0.75}

  return { colour, border, size }
}

function resetMarkers() {
  for (let marker of markers) {
    marker.map = undefined
  }
  markerCluster.clearMarkers()
  sites = []
  markers = []
}

const loadChargersDebounced = debounce(() => loadChargers(), 500);

function isSiteAlreadyInCache(site: Site) {
  return sites.findIndex(s => s.id === site.id)
}


function fastTabButtonClick() {
  document.getElementById("fast-tab-button").classList.add("selected");
  document.getElementById("slow-tab-button").classList.remove("selected");
  chargerType = 'ccs'
  resetMarkers()
  loadChargers()
}
function slowTabButtonClick() {
  document.getElementById("fast-tab-button").classList.remove("selected");
  document.getElementById("slow-tab-button").classList.add("selected");
  chargerType = 'any'
  resetMarkers()
  loadChargers()
}
window.onload = function() {
  document.getElementById("fast-tab-button").addEventListener("click", fastTabButtonClick);
  document.getElementById("slow-tab-button").addEventListener("click", slowTabButtonClick);
}

