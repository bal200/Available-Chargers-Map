import { getCounts } from "./helpers.ts";
import { drawHistogram } from "./histogram.ts";
import { Site } from "./services.ts";

const SITE_LOG_URL = 'http://localhost:8082/siteLogDump'


export let infowindow: google.maps.InfoWindow;

export async function openInfoWindow(site: Site, map: google.maps.Map) {
	const { InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
	if (!infowindow) infowindow = new InfoWindow({ content: '' });
	console.log(site.name+" clicked");
	infowindow.setContent( buildInfoContent(site) );
	infowindow.open({
		anchor: site.marker,
		map,
		shouldFocus: false,
	});
	let counts = getCounts(site)
	let plug = (counts.ccs?.total>0 ? 'ccs' : 'type2'); /** TODO: */
	setTimeout(()=> {
		document.getElementById("date-prev")?.addEventListener('click', () => drawHistogram({ dateShift: -1 }));
		document.getElementById("date-next")?.addEventListener('click', () => drawHistogram({ dateShift: +1 }));
		document.getElementById("hist-ccs")?.addEventListener('click', () => drawHistogram({ plug: 'ccs' }));
		document.getElementById("hist-type2")?.addEventListener('click', () => drawHistogram({ plug: 'type2' }));
	},20)

	drawHistogram({site, plug, date: new Date()})
}

function buildInfoContent(site) {
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
	<div id="histogram"></div>
	<div class="row-bottom">
		<div class="devices">`
			for (i=0; i<counts.ccs.total; i++){
				str += `<img src="img/ccs.png" class="device-icon" />`;
			}
			for (i=0; i<counts.type2.total; i++){
				str += `<img src="img/type2.png" class="device-icon" />`;
			}
			str+=`
		</div>
		<div class="price">**p/kwh</div>`;
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
		str+=`<button id="date-prev"> <<< </button>&nbsp;`
		str+=`<button id="date-next"> >>> </button>&nbsp;`
		str+=`<a href="${SITE_LOG_URL}?site=${site.id}" target="_blank">log dump</a>
	</div>
	`;
	return str;
}
