import { OcpiPlugType, Site } from "./services";


export function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

export function getCounts(site) {
  const s = site.busynessCcs?.split(',') || [];
  const s2 = site.busynessType2?.split(',') || [];
  return {
    ccs: {
      total: s[0],
      charging: s[1],
      outoforder: s[2],
    },
    type2: {
      total: s2[0],
      charging: s2[1],
      outoforder: s2[2],
    },
  }
}

export function findSiteMaxPower(site: Site, standard: OcpiPlugType) {
  let maxPower: number = 0
  for (let evse of site.evses) {
    for (let conn of evse.connectors) {
      if (conn.standard === standard) {
        let power = Math.round(conn.max_electric_power / 1000)
        if (power > maxPower) maxPower = power; 
      }
    }
  }
  let speed='slow'
  if (maxPower >= 43) speed='rapid';
  if (maxPower >= 100) speed='ultra';
  if (maxPower >= 250) speed='ultraultra';

  return {maxPower, speed}
}
