import { debounce, getCounts } from "./helpers.js";
import { openInfoWindow } from "./info-window.js"

//const API_URL = 'https://europe-west2-charger-availability.cloudfunctions.net/api';
//const API_URL = 'http://localhost:5001/charger-availability/europe-west2';
export const API_URL = 'http://localhost:8080';

let map: google.maps.Map;
let sites = [];


async function initMap(): Promise<void> {
  const { Map, InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

  map = new Map(document.getElementById("map") as HTMLElement, {
    zoom: 10,
    center: { lat: 53.300, lng: -2.402 },
  });
  // infowindow = new google.maps.InfoWindow({
  //   content: '',
  // });

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

  async function loadChargers() {
    let b = map.getBounds();
    let lat2 = b.getNorthEast().lat();
    let lon2 = b.getNorthEast().lng();
    let lat = b.getSouthWest().lat();
    let lon = b.getSouthWest().lng();

    console.log(`getbounds latlon (${lat.toFixed(3)}, ${lon.toFixed(3)}), latlon2 (${lat2.toFixed(3)}, ${lon2.toFixed(3)}) `);
    let results = await apiLoadChargers(lat,lon, lat2,lon2);
    //console.log("api result ", results);

    for (let site of results) {
      let found = isSiteAlreadyInCache(site)
      let oldSite = found==-1 ? undefined : sites[found];
      if (oldSite) {  /* EXISTING */
        site.marker = oldSite.marker;
        sites[found] = site;
      }
      let status = parseInt(site.statusCcs);
      let counts = getCounts(site);
      let colour = "", size="", label;

      if (site.statusCcs === undefined) {colour = 'light'; label="";}
      else if (status > 75) {colour = 'red'; label="FULL"}
      else if (status >= 50) {colour = 'orange'; label="BUSY";}
      else if (status < 50) {colour='green'; label="QUIET";}
      if (counts.ccs.outoforder>=1 && counts.ccs.outoforder === counts.ccs.total) {colour = 'dark'; label="";}

      if (counts.ccs.total >= 8) {size = '-large'}
      else if (counts.ccs.total >= 3) {size = ''}
      else if (counts.ccs.total <= 2) {size = '-small'}

      let iconUrl = `markers/${site.party_id}-${colour}${size}.png`

      if (oldSite) {
        /* UPDATE any marker attributes if different */
        if (oldSite.marker?.getIcon().url !== iconUrl) {
          site.marker.setIcon({
            url: iconUrl,
            labelOrigin: new google.maps.Point(14, 47)
          });
        }
        // if (oldSite.marker?.getLabel() !== label) {
        //   site.marker.setLabel(label);
        // }
        site = oldSite
      } else {
        /* CREATE new marker */
        site.marker = new google.maps.Marker({
          position: { lat: site.latitude, lng: site.longitude },
          map: map,
          /* label, */
          icon: {
            url: iconUrl,
            labelOrigin: new google.maps.Point(14, 47)
          },
        });
        site.marker.addListener("click", async () => {
          console.log(site.name+" clicked");
          openInfoWindow(site, counts, map)
        });
      }
      if (!oldSite) {
        sites.push(site);
      }
    }
  }

  const loadChargersDebounced = debounce(() => loadChargers(), 500);

  function apiLoadChargers(lat,lon, lat2,lon2) {
    let url = `/sites?lat=${lat}&lng=${lon}&lat2=${lat2}&lng2=${lon2}`;
    return fetch(API_URL + url, {
		  //headers: { 'X-Api-Key': API_KEY },
	  })
	  .then(res => res.json())
  }
  function isSiteAlreadyInCache(site) {
    return sites.findIndex(s => s.id === site.id)
  }
}

initMap()

function fastTabButtonClick() {
  document.getElementById("fast-tab-button").classList.add("selected");
  document.getElementById("slow-tab-button").classList.remove("selected");
}
function slowTabButtonClick() {
  document.getElementById("fast-tab-button").classList.remove("selected");
  document.getElementById("slow-tab-button").classList.add("selected");
}
window.onload = function() {
  document.getElementById("fast-tab-button").addEventListener("click", fastTabButtonClick);
  document.getElementById("slow-tab-button").addEventListener("click", slowTabButtonClick);
}

