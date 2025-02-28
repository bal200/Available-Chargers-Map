//export const API_URL = 'https://europe-west2-charger-availability.cloudfunctions.net/api';
//const API_URL = 'http://localhost:5001/charger-availability/europe-west2';
export const API_URL = 'http://localhost:8083';



export function apiLoadChargers(lat: number,lon: number, lat2:number,lon2:number, type='any') {
  let url = `/sites?lat=${lat}&lng=${lon}&lat2=${lat2}&lng2=${lon2}&type=${type}`;
  return fetch(API_URL + url, {
    //headers: { 'X-Api-Key': API_KEY },
  })
  .then(res => res.json() as Promise<Site[]>)
}

export async function getHistogram(site: Site, plug: string, date:IsoDate) {
	let params = new URLSearchParams({ 'site': site.id, plug, date })
	try {
		const res = await fetch(`${API_URL}/histogram?` + params.toString(), {});
		return await (res.json() as Promise<HistogramData>);
	} catch (error) {
		console.log("getHistogram ERROR: ", error);
	}
}


export type Site = {
	/** Eg. GB-SSM-612345 */
	id: string,
	/** Eg. "GB" */
	//country_code?: string,
	/** Eg. "SSM" */
	party_id: string, 
	/** Eg. "612345" */
	//id: string, 

	name: string,
	latitude?: number, longitude?: number,
	operatorName?: string,
	evses?: {
		uid: string,
		status?: OcpiStatus,
		connectors: {
			id: number, /** 1 or 2, to indicate the order */
			type: OcpiPlugType, /* "IEC_62196_T2_COMBO" */
			max_electric_power: number, // 300000 in Watts
		}[],
	}[],
	statusCcs?: string,
	statusType2?: string,
	busynessCcs?: BusynessString,
	busynessType2?: BusynessString,

	/** Added frontend */
	marker?: google.maps.marker.AdvancedMarkerElement,
}

export type OcpiStatus = "AVAILABLE" | "CHARGING" | "RESERVED" |
  "INOPERATIVE" | "OUTOFORDER" |
  "BLOCKED" | "PLANNED" | "REMOVED" | "UNKNOWN";

export type OcpiPlugType = "IEC_62196_T2" | "IEC_62196_T2_COMBO" | "CHADEMO"

/** Each items format: "`${connectorCount},${inUse},${broken}`", eg: "4,2,1" */
export type BusynessString = string


export type HistogramData = string[][]

/** Eg. "2025-01-13T18:21:25Z" */
export type IsoDate = string 
