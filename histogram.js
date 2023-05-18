function buildHistogram(data, site) {
	let nowHour = new Date().getUTCHours();

	let str = `
	<div class="outer">
	<div class="axis-line"></div>
		<div class="graph">`
			for(let n=0; n<24; n++) {
				str+=`<div class="column">`
				if (n==nowHour && site.busynessCcs) {
					let busy = site.busynessCcs?.split(',');
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
						if (barHeight===0 || barHeight===NaN) barHeight=1;
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
		