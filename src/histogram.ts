import { BusynessString, getHistogram, HistogramData, Site, splitBusynessString } from "./services.ts";

export const TOTAL = 0, IN_USE = 1, BROKEN = 2;

export let infoState: {site?: Site, plug?: string, date?: Date} = {}

export async function drawHistogram({dateShift, plug, site, date} : {dateShift?:number, plug?:string, site?:Site, date?: Date} = {}) {
	if (date) infoState.date = date;
	if (dateShift === -1) infoState.date = minusDay(infoState.date);
	if (dateShift === +1) infoState.date = plusDay(infoState.date);
	if (plug) infoState.plug = plug;
	if (site) infoState.site = site;
	console.log("drawHistogram called ", infoState)

	let res = await getHistogram(infoState.site, infoState.plug, infoState.date.toISOString());
	let nowHour: number, nowBusyness;
	if (isToday(infoState.date)) {
		nowHour = new Date().getUTCHours()
		nowBusyness = (infoState.plug==='ccs' ? infoState.site.busynessCcs : infoState.site.busynessType2);
	}
	document.getElementById('histogram').innerHTML = buildHistogram(res, nowHour, nowBusyness);

}

export function buildHistogram(data?: HistogramData, nowHour?: number, nowBusyness?:BusynessString) {
	let str = `
	<div class="outer">
	  <div class="axis-line"></div>
		<div class="graph">`
			for(let n=0; n<24; n++) {
				str+=`<div class="column">`
				if (!data) {}
				else if (n==nowHour && nowBusyness!==undefined) {
					let busy = splitBusynessString(nowBusyness)
					if (busy[BROKEN]>0) {
						let barHeight = busy[BROKEN] / busy[TOTAL] * 100;
						str+=`<div class="broken now" style="height:${barHeight}%"></div>`
					}
					//if (busy[IN_USE]>0) {
						let barHeight = busy[IN_USE] / busy[TOTAL] * 100;
						if (barHeight===0) barHeight=1;
						str+=`<div class="busy now" style="height:${barHeight}%"></div>`
					//}
				}else if (data[n] && data[n].length) {
					if (data[n][BROKEN]>0) {
						let barHeight = data[n][BROKEN] / data[n][TOTAL] * 100;
						str+=`<div class="broken" style="height:${barHeight}%"></div>`
					}
					//if (data[n][IN_USE]>0) {
						let barHeight = data[n][IN_USE] / data[n][TOTAL] * 100;
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


function minusDay(d: Date) {
	let d2 = new Date(d)
	d2.setUTCDate(d2.getUTCDate()-1)
	return d2
}
function plusDay(d: Date) {
	let d2 = new Date(d)
	d2.setUTCDate(d2.getUTCDate()+1)
	return d2
}
function isToday(d: Date) {
	let today = new Date()
	if (d.getFullYear() === today.getFullYear()
	  && d.getMonth() === today.getMonth()
	  && d.getDate() === today.getDate()
	) return true;
	else return false;
}
