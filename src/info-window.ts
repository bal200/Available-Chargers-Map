import { getCounts } from "./helpers.ts";
import { API_URL } from "./main.ts";

const SITE_LOG_URL = 'http://localhost:8082/siteLogDump'

let infoState = {
	site: undefined,
	plug: undefined,
	date: undefined,
}

export let infowindow: google.maps.InfoWindow;

export async function openInfoWindow(site, counts, map) {
	const { InfoWindow } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
	if (!infowindow) infowindow = new InfoWindow({ content: '' });
	console.log(site.name+" clicked");
	infowindow.setContent( buildInfoContent(site) );
	infowindow.open({
		anchor: site.marker,
		map,
		shouldFocus: false,
	});

	let plug = (counts.ccs?.total>0 ? 'ccs' : 'type2'); /** TODO: */
	infoState = {site, plug, date: new Date()}
	//drawHistogram()
}

function buildInfoContent(site) {
	let counts = getCounts(site), i=0;
	let str = `
	<div class="row-top">
		<div class="operator-logo">
			<img src="assets/operator-logo/${site.party_id}.png" />
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
				str += `<img src="assets/ccs.png" class="device-icon" />`;
			}
			for (i=0; i<counts.type2.total; i++){
				str += `<img src="assets/type2.png" class="device-icon" />`;
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
		if (counts.ccs?.total>0) str+=`<button id="hist-ccs" onclick="drawHistogram('ccs')">CCS</button>&nbsp;`
		if (counts.type2?.total>0) str+=`<button id="hist-type2" onclick="drawHistogram('type2')">Type 2</button>&nbsp;`
		str+=`<button id="date-prev" onclick="drawHistogram(undefined, -1)"> <<< </button>&nbsp;`
		str+=`<button id="date-next" onclick="drawHistogram(undefined, +1)"> >>> </button>&nbsp;`
		str+=`<a href="${SITE_LOG_URL}?site=${site.id}" target="_blank">log dump</a>
	</div>
	`;
	return str;
}

async function drawHistogram(plug, dateShift, site) {
	if (dateShift === -1) infoState.date = minusDay(infoState.date);
	if (dateShift === +1) infoState.date = plusDay(infoState.date);
	if (plug) infoState.plug = plug;
	if (site) infoState.site = site;
	console.log("updateHostogram called ", infoState)

	let res = await getHistogram(infoState.site, infoState.plug, infoState.date.toISOString());
	let nowHour, nowBusyness;
	if (isToday(infoState.date)) {
		nowHour = new Date().getUTCHours()
		nowBusyness = (infoState.plug==='ccs' ? infoState.site.busynessCcs : infoState.site.busynessType2);
	}
	document.getElementById('histogram').innerHTML = buildHistogram(res, nowHour, nowBusyness);

}

function getHistogram(site, plug, date) {
	let params = new URLSearchParams({ 'site': site.id, plug, date })
	return fetch(`${API_URL}/histogram?`+params.toString(), {
		// mode: 'no-cors',
	})
	.then(res => res.json())
	.catch(error => {
		console.log("getHistogram ERROR: ", error)
	});
}


function buildHistogram(data, nowHour, nowBusyness) {
	let str = `
	<div class="outer">
	  <div class="axis-line"></div>
		<div class="graph">`
			for(let n=0; n<24; n++) {
				str+=`<div class="column">`
				if (n==nowHour && nowBusyness!==undefined) {
					let busy = nowBusyness?.split(',');
					if (busy[2]>0) {
						let barHeight = busy[2] / busy[0] * 100;
						str+=`<div class="broken now" style="height:${barHeight}%"></div>`
					}
					//if (busy[1]>0) {
						let barHeight = busy[1] / busy[0] * 100;
						if (barHeight===0) barHeight=1;
						str+=`<div class="busy now" style="height:${barHeight}%"></div>`
					//}
				}else if (data[n] && data[n].length) {
					if (data[n][2]>0) {
						let barHeight = data[n][2] / data[n][0] * 100;
						str+=`<div class="broken" style="height:${barHeight}%"></div>`
					}
					//if (data[n][1]>0) {
						let barHeight = data[n][1] / data[n][0] * 100;
						if (barHeight===0 || Number.isNaN(barHeight)) barHeight=1;
						str+=`<div class="busy" style="height:${barHeight}%"></div>`
					//}
				}
				str+=`</div>`
			}
			str+= `
		</div>
		<div class="axis-line"></div>
		<div class="axis">
			<div class="mark large"></div> <!-- 00:00 -->
			<div class="mark"></div>
			<div class="mark"></div>
			<div class="mark large"><div class="label">3am</div></div>
			<div class="mark"></div>
			<div class="mark"></div>
			<div class="mark large"><div class="label">6am</div></div> 
			<div class="mark"></div>
			<div class="mark"></div>
			<div class="mark large"><div class="label">9am</div></div>
			<div class="mark"></div>
			<div class="mark"></div>
			<div class="mark large"><div class="label">12pm</div></div>
			<div class="mark"></div>
			<div class="mark"></div>
			<div class="mark large"><div class="label">3pm</div></div>
			<div class="mark"></div>
			<div class="mark"></div>
			<div class="mark large"><div class="label">6pm</div></div>
			<div class="mark"></div>
			<div class="mark"></div>
			<div class="mark large"><div class="label">9pm</div></div>
			<div class="mark"></div>
			<div class="mark"></div>
		</div>
	</div>
	`
	return str;
}


function minusDay(d) {
	let d2 = new Date(d)
	d2.setUTCDate(d2.getUTCDate()-1)
	return d2
}
function plusDay(d) {
	let d2 = new Date(d)
	d2.setUTCDate(d2.getUTCDate()+1)
	return d2
}
function isToday(d) {
	let today = new Date()
	if (d.getFullYear() === today.getFullYear()
	  && d.getMonth() === today.getMonth()
	  && d.getDate() === today.getDate()
	) return true;
	else return false;
}