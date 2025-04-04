import { getCounts } from "./helpers.ts";
import { drawHistogram, buildHistogram } from "./histogram.ts";
import { isBroken, isInUse, OcpiPlugType, OcpiStatus, Site } from "./services.ts";

const SITE_LOG_URL = 'http://localhost:8082/siteLogDump'


export let infowindow: google.maps.InfoWindow;

export async function openInfoWindow(site: Site, map: google.maps.Map) {
	const { InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
	if (!infowindow) infowindow = new InfoWindow({ content: '' });
	infowindow.setContent( buildInfoContent(site) );
	infowindow.open({
		anchor: site.marker,
		map,
		shouldFocus: false,
	});
	let counts = getCounts(site)
	let plug = (counts.ccs?.total>0 ? 'ccs' : 'type2'); /** TODO: */

	drawHistogram({site, plug, date: new Date()})
}

function buildInfoContent(site: Site) {
	let counts = getCounts(site), i=0;
	let str = `
	<div id="info-window" class="row-top">
		<div class="operator-logo">
			<img src="img/operator-logo/${site.party_id}.png" />
		</div>
		<div>
			<div class="name">${site.name}</div>
			<div class="network">${site.operatorName}</div>
		</div>
	</div>
	<div id="histogram">${buildHistogram()}</div>
	<div class="row-bottom">
		<div class="devices">`
			for (let conn of filterConnectors(site, 'IEC_62196_T2_COMBO')){
				str += `<div class="device">
				  <img src="img/ccs${conn.status}.png" class="device-icon" />
				  <div class="device-speed">${conn.powerKw}</div>
				</div>`;
			}
			for (let conn of filterConnectors(site, 'IEC_62196_T2')){
				str += `<div class="device">
				  <img src="img/type2${conn.status}.png" class="device-icon">
				  <div class="device-speed">${conn.powerKw}</div>
				</div>`;
			}
			str+=`
		</div>
		<div class="price">${site.priceCcs?site.priceCcs*100+'p/kwh':'price unknown'}</div>`;
		let status = parseInt(site.statusCcs);
		if (site.statusCcs===null || site.statusCcs===undefined) str+= `<span></span>`;
		else if (status > 75) str+= `<span class="pill red">FULL</span>`;
		else if (status >= 50) str+= `<span class="pill orange">BUSY</span>`;
		else if (status >= 0) str+= `<span class="pill green"><span class="dot dark-green"></span>QUIET</span>`;
		str+= `
	</div>
	<div class="second-row-bottom">`
		if (counts.ccs?.total>0) str+=`<button id="hist-ccs">CCS</button>&nbsp;`
		if (counts.type2?.total>0) str+=`<button id="hist-type2">Type 2</button>&nbsp;`
		str+=`<a href="${SITE_LOG_URL}?site=${site.id}" target="_blank">log dump</a>
	</div>
	`;
	return str;
}

function filterConnectors(site: Site, standard: OcpiPlugType) {
	let out: {powerKw: string, status: string}[] = []
	for (let evse of site.evses) {
		for (let conn of evse.connectors) {
			if (conn.standard === standard) {
				let status = (isInUse(evse.status) || isBroken(evse.status)? '_grey':'')
				out.push({
				  powerKw: (conn.max_electric_power / 1000).toFixed(0) + 'kW',
					status,
				})
			}
		}
	}
	return out
}
