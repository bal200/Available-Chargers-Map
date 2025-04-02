import { Marker, MarkerClusterer, Renderer } from "@googlemaps/markerclusterer";
import { findSiteMaxPower, getCounts } from "./helpers.js";
import { openInfoWindow } from "./info-window.js"
import { Site } from "./services.js";

export let markers: google.maps.marker.AdvancedMarkerElement[]=[];
export let markerCluster: MarkerClusterer;

let MarkerLibrary: google.maps.MarkerLibrary

export async function createMarker(site: Site, map: google.maps.Map) {
  MarkerLibrary = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

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
  markers.push(site.marker)

  site.marker.addListener("click", async () => {
    console.log(site.name+" clicked");
    openInfoWindow(site, map)
  });

}

export async function updateMarker(site: Site, oldSite: Site) {
  /* @TODO: updateMarker */
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
  let { colour, speed, price } = statsForSite(site)
  const row = document.createElement('div')
  row.className = 'row'+ (first ? ' first':'') + (last ? ' last':'') + (colour ? ' '+colour : '')

  let img = document.createElement('img') as HTMLImageElement;
  img.className = 'icon'
  img.src = `pins/operator-${site.party_id}.png`
  row.append(img)

  if (speed && speed !== 'slow') {
    img = document.createElement('img') as HTMLImageElement;
    img.className = 'lightning'
    img.src = `pins/speed-${speed}.png`
    row.append(img)
  }

  const span = document.createElement('div') as HTMLDivElement;
  span.className = price;
  span.textContent = site.priceCcs ? Math.round(site.priceCcs * 100) + 'p' : '---'
  row.append(span)
  return row
}

function buildMarkerRowNew(site: Site, first: boolean = true, last: boolean = true) {
  let { colour, availability, price, speed } = statsForSite(site)
  const row = document.createElement('div')
  row.className = 'row'+ (first ? ' first':'') + (last ? ' last':'') + (colour ? ' '+colour : '')
  //row.style.backgroundColor = colour

  let img = document.createElement('img') as HTMLImageElement;
  img.src = `pins/operator-${site.party_id}.png`
  row.append(img)

  //if (speed && speed !== 'slow') {
    img = document.createElement('img') as HTMLImageElement;
    img.src = `pins/speed-${speed}.png`
    row.append(img)
  //}

  img = document.createElement('img') as HTMLImageElement;
  img.src = `pins/availability-${availability}.png`
  row.append(img)

  img = document.createElement('img') as HTMLImageElement;
  img.src = `pins/price-${price}.png`
  row.append(img)

  const span = document.createElement('div') as HTMLDivElement;
  span.className = price;
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

export function createMarkerClusterer(map: google.maps.Map) {
  if (!markerCluster) {
    markerCluster = new MarkerClusterer({ map, renderer: clusterRenderer, onClusterClick });
  }
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
    /* compare by availability */
    let aValue = aa.colour=='green'?3:( aa.colour=='orange'?2:( 1 ) )
    let bValue = bb.colour=='green'?3:( bb.colour=='orange'?2:( 1 ) )
    if (bValue === aValue) {
      /* compare by price */
      aValue = aa.price=='low'?3:( aa.price=='fair'?2:( 1 ) )
      bValue = bb.price=='low'?3:( bb.price=='fair'?2:( 1 ) )
      if (bValue === aValue) {
        /* compare by speed? */
      }
    }
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
  let colour = "", availability='';
  if ((site.statusCcs || site.statusType2) === undefined) {colour = 'gray', availability='full'}
  else if (status > 75) {colour = 'red', availability = 'full'}
  else if (status >= 50) {colour = 'orange', availability = 'busy'}
  else if (status < 50) {colour='green', availability = 'quiet'}

  let price = 'low'
  if (site.priceCcs >= 0.70) {price='fair'}
  if (site.priceCcs >= 0.76) {price='high'}
  if (site.priceCcs == null) {price=''}

  let { speed } = findSiteMaxPower(site, 'IEC_62196_T2_COMBO')
  return { colour, availability, price, speed }
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

export function resetMarkers() {
  for (let marker of markers) {
    marker.map = undefined
  }
  markerCluster.clearMarkers()
  markers = []
}




