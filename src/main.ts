import { MarkerClusterer, Renderer } from "@googlemaps/markerclusterer";
import { debounce, getCounts } from "./helpers.js";
import { openInfoWindow } from "./info-window.js"
import { apiLoadChargers, Site } from "./services.js";

let map: google.maps.Map;
let sites: Site[] = [];
let markers: google.maps.marker.AdvancedMarkerElement[]=[];
let markerCluster: MarkerClusterer;
let chargerType = 'ccs'

async function initMap(): Promise<void> {
  const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;

  map = new Map(document.getElementById("map") as HTMLElement, {
    zoom: 10,
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
      await createMarker(site)
    }
    if (!oldSite) {
      sites.push(site)
      markers.push(site.marker)
    }
  }

  let renderer: Renderer = {
    render: (cluster, stats, map) => {
      const content = document.createElement('div');
      content.className = 'price-tag';
      content.textContent = String(cluster.markers.length);
      return new AdvancedMarkerElement({
        map,
        position: cluster.position,
        content,
      });
    }
  }

  markerCluster = new MarkerClusterer({ markers, map, renderer: clusterRenderer });
  
}

const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

let clusterRenderer: Renderer = {
  render: (cluster, stats, map) => {
    const listMarker = document.createElement('div')
    listMarker.className = 'list-marker'
    cluster.markers?.forEach((marker, i, arr) => {
      const site = (marker as any).site as Site;
      let { colour } = colourForSite(site)
      const line = document.createElement('div')
      
      line.className = 'line'+ (i===0 ? ' first':'') + (i === arr.length-1 ? ' last':'')
      line.style.backgroundColor = colour

      const img = document.createElement('img') as HTMLImageElement;
      img.src = `pins/operator-${site.party_id}.png`
      line.append(img)

      const span = document.createElement('div') as HTMLSpanElement;
      span.textContent = "79p"
      line.append(span)

      listMarker.append(line)
    })

    return new AdvancedMarkerElement({
      map,
      position: cluster.position,
      content: listMarker,
    });
  }
}

async function createMarker(site: Site) {
  //const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
  let {colour, border, size} = colourForSite(site)

  const glyphImg = document.createElement('img');
  glyphImg.src = `pins/operator-${site.party_id}.png`;

  const pin = new PinElement({
    background: colour,
    borderColor: border || colour,
    scale: size,
    glyph: glyphImg,
  });
  site.marker = new AdvancedMarkerElement({
    map: map,
    position: { lat: site.latitude, lng: site.longitude },
    content: pin.element,
  });
  /* @ts-ignore */ 
  site.marker.site = site;

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


const loadChargersDebounced = debounce(() => loadChargers(), 500);

function isSiteAlreadyInCache(site: Site) {
  return sites.findIndex(s => s.id === site.id)
}


function fastTabButtonClick() {
  document.getElementById("fast-tab-button").classList.add("selected");
  document.getElementById("slow-tab-button").classList.remove("selected");
  chargerType = 'ccs'
}
function slowTabButtonClick() {
  document.getElementById("fast-tab-button").classList.remove("selected");
  document.getElementById("slow-tab-button").classList.add("selected");
  chargerType = 'any'
}
window.onload = function() {
  document.getElementById("fast-tab-button").addEventListener("click", fastTabButtonClick);
  document.getElementById("slow-tab-button").addEventListener("click", slowTabButtonClick);
}

