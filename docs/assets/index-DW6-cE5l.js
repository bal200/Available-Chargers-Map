(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function e(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=e(n);fetch(n.href,i)}})();function wt(r,t=300){let e;return(...s)=>{clearTimeout(e),e=setTimeout(()=>{r.apply(this,s)},t)}}function lt(r){var s,n;const t=((s=r.busynessCcs)==null?void 0:s.split(","))||[],e=((n=r.busynessType2)==null?void 0:n.split(","))||[];return{ccs:{total:t[0],charging:t[1],outoforder:t[2]},type2:{total:e[0],charging:e[1],outoforder:e[2]}}}function kt(r,t){let e=0;for(let n of r.evses)for(let i of n.connectors)if(i.standard===t){let o=Math.round(i.max_electric_power/1e3);o>e&&(e=o)}let s="slow";return e>=43&&(s="rapid"),e>=100&&(s="ultra"),e>=250&&(s="ultraultra"),{maxPower:e,speed:s}}const dt="http://localhost:8083";function Et(r,t,e,s,n="any"){let i=`/sites?lat=${r}&lng=${t}&lat2=${e}&lng2=${s}&type=${n}`;return fetch(dt+i,{}).then(o=>o.json())}async function Mt(r,t,e){let s=new URLSearchParams({site:r.id,plug:t,date:e});try{return await(await fetch(`${dt}/histogram?`+s.toString(),{})).json()}catch(n){console.log("getHistogram ERROR: ",n)}}function bt(r){return(r==null?void 0:r.split(",")).map(e=>Number.parseFloat(e))}function Ct(r){switch(r){case"CHARGING":case"RESERVED":return!0;default:return!1}}function _t(r){switch(r){case"INOPERATIVE":case"OUTOFORDER":case"BLOCKED":case"REMOVED":return!0;default:return!1}}function xt(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var R,et;function At(){return et||(et=1,R=function r(t,e){if(t===e)return!0;if(t&&e&&typeof t=="object"&&typeof e=="object"){if(t.constructor!==e.constructor)return!1;var s,n,i;if(Array.isArray(t)){if(s=t.length,s!=e.length)return!1;for(n=s;n--!==0;)if(!r(t[n],e[n]))return!1;return!0}if(t.constructor===RegExp)return t.source===e.source&&t.flags===e.flags;if(t.valueOf!==Object.prototype.valueOf)return t.valueOf()===e.valueOf();if(t.toString!==Object.prototype.toString)return t.toString()===e.toString();if(i=Object.keys(t),s=i.length,s!==Object.keys(e).length)return!1;for(n=s;n--!==0;)if(!Object.prototype.hasOwnProperty.call(e,i[n]))return!1;for(n=s;n--!==0;){var o=i[n];if(!r(t[o],e[o]))return!1}return!0}return t!==t&&e!==e}),R}var Lt=At();const st=xt(Lt),rt=[Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array],Z=1,L=8;class Y{static from(t){if(!(t instanceof ArrayBuffer))throw new Error("Data must be an instance of ArrayBuffer.");const[e,s]=new Uint8Array(t,0,2);if(e!==219)throw new Error("Data does not appear to be in a KDBush format.");const n=s>>4;if(n!==Z)throw new Error(`Got v${n} data when expected v${Z}.`);const i=rt[s&15];if(!i)throw new Error("Unrecognized array type.");const[o]=new Uint16Array(t,2,1),[c]=new Uint32Array(t,4,1);return new Y(c,o,i,t)}constructor(t,e=64,s=Float64Array,n){if(isNaN(t)||t<0)throw new Error(`Unpexpected numItems value: ${t}.`);this.numItems=+t,this.nodeSize=Math.min(Math.max(+e,2),65535),this.ArrayType=s,this.IndexArrayType=t<65536?Uint16Array:Uint32Array;const i=rt.indexOf(this.ArrayType),o=t*2*this.ArrayType.BYTES_PER_ELEMENT,c=t*this.IndexArrayType.BYTES_PER_ELEMENT,a=(8-c%8)%8;if(i<0)throw new Error(`Unexpected typed array class: ${s}.`);n&&n instanceof ArrayBuffer?(this.data=n,this.ids=new this.IndexArrayType(this.data,L,t),this.coords=new this.ArrayType(this.data,L+c+a,t*2),this._pos=t*2,this._finished=!0):(this.data=new ArrayBuffer(L+o+c+a),this.ids=new this.IndexArrayType(this.data,L,t),this.coords=new this.ArrayType(this.data,L+c+a,t*2),this._pos=0,this._finished=!1,new Uint8Array(this.data,0,2).set([219,(Z<<4)+i]),new Uint16Array(this.data,2,1)[0]=e,new Uint32Array(this.data,4,1)[0]=t)}add(t,e){const s=this._pos>>1;return this.ids[s]=s,this.coords[this._pos++]=t,this.coords[this._pos++]=e,s}finish(){const t=this._pos>>1;if(t!==this.numItems)throw new Error(`Added ${t} items when expected ${this.numItems}.`);return V(this.ids,this.coords,this.nodeSize,0,this.numItems-1,0),this._finished=!0,this}range(t,e,s,n){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");const{ids:i,coords:o,nodeSize:c}=this,a=[0,i.length-1,0],d=[];for(;a.length;){const u=a.pop()||0,l=a.pop()||0,h=a.pop()||0;if(l-h<=c){for(let f=h;f<=l;f++){const y=o[2*f],k=o[2*f+1];y>=t&&y<=s&&k>=e&&k<=n&&d.push(i[f])}continue}const p=h+l>>1,m=o[2*p],g=o[2*p+1];m>=t&&m<=s&&g>=e&&g<=n&&d.push(i[p]),(u===0?t<=m:e<=g)&&(a.push(h),a.push(p-1),a.push(1-u)),(u===0?s>=m:n>=g)&&(a.push(p+1),a.push(l),a.push(1-u))}return d}within(t,e,s){if(!this._finished)throw new Error("Data not yet indexed - call index.finish().");const{ids:n,coords:i,nodeSize:o}=this,c=[0,n.length-1,0],a=[],d=s*s;for(;c.length;){const u=c.pop()||0,l=c.pop()||0,h=c.pop()||0;if(l-h<=o){for(let f=h;f<=l;f++)nt(i[2*f],i[2*f+1],t,e)<=d&&a.push(n[f]);continue}const p=h+l>>1,m=i[2*p],g=i[2*p+1];nt(m,g,t,e)<=d&&a.push(n[p]),(u===0?t-s<=m:e-s<=g)&&(c.push(h),c.push(p-1),c.push(1-u)),(u===0?t+s>=m:e+s>=g)&&(c.push(p+1),c.push(l),c.push(1-u))}return a}}function V(r,t,e,s,n,i){if(n-s<=e)return;const o=s+n>>1;ut(r,t,o,s,n,i),V(r,t,e,s,o-1,1-i),V(r,t,e,o+1,n,1-i)}function ut(r,t,e,s,n,i){for(;n>s;){if(n-s>600){const d=n-s+1,u=e-s+1,l=Math.log(d),h=.5*Math.exp(2*l/3),p=.5*Math.sqrt(l*h*(d-h)/d)*(u-d/2<0?-1:1),m=Math.max(s,Math.floor(e-u*h/d+p)),g=Math.min(n,Math.floor(e+(d-u)*h/d+p));ut(r,t,e,m,g,i)}const o=t[2*e+i];let c=s,a=n;for(O(r,t,s,e),t[2*n+i]>o&&O(r,t,s,n);c<a;){for(O(r,t,c,a),c++,a--;t[2*c+i]<o;)c++;for(;t[2*a+i]>o;)a--}t[2*s+i]===o?O(r,t,s,a):(a++,O(r,t,a,n)),a<=e&&(s=a+1),e<=a&&(n=a-1)}}function O(r,t,e,s){j(r,e,s),j(t,2*e,2*s),j(t,2*e+1,2*s+1)}function j(r,t,e){const s=r[t];r[t]=r[e],r[e]=s}function nt(r,t,e,s){const n=r-e,i=t-s;return n*n+i*i}const Ot={minZoom:0,maxZoom:16,minPoints:2,radius:40,extent:512,nodeSize:64,log:!1,generateId:!1,reduce:null,map:r=>r},it=Math.fround||(r=>t=>(r[0]=+t,r[0]))(new Float32Array(1)),_=2,b=3,H=4,M=5,ht=6;class It{constructor(t){this.options=Object.assign(Object.create(Ot),t),this.trees=new Array(this.options.maxZoom+1),this.stride=this.options.reduce?7:6,this.clusterProps=[]}load(t){const{log:e,minZoom:s,maxZoom:n}=this.options;e&&console.time("total time");const i=`prepare ${t.length} points`;e&&console.time(i),this.points=t;const o=[];for(let a=0;a<t.length;a++){const d=t[a];if(!d.geometry)continue;const[u,l]=d.geometry.coordinates,h=it(P(u)),p=it($(l));o.push(h,p,1/0,a,-1,1),this.options.reduce&&o.push(0)}let c=this.trees[n+1]=this._createTree(o);e&&console.timeEnd(i);for(let a=n;a>=s;a--){const d=+Date.now();c=this.trees[a]=this._createTree(this._cluster(c,a)),e&&console.log("z%d: %d clusters in %dms",a,c.numItems,+Date.now()-d)}return e&&console.timeEnd("total time"),this}getClusters(t,e){let s=((t[0]+180)%360+360)%360-180;const n=Math.max(-90,Math.min(90,t[1]));let i=t[2]===180?180:((t[2]+180)%360+360)%360-180;const o=Math.max(-90,Math.min(90,t[3]));if(t[2]-t[0]>=360)s=-180,i=180;else if(s>i){const l=this.getClusters([s,n,180,o],e),h=this.getClusters([-180,n,i,o],e);return l.concat(h)}const c=this.trees[this._limitZoom(e)],a=c.range(P(s),$(o),P(i),$(n)),d=c.data,u=[];for(const l of a){const h=this.stride*l;u.push(d[h+M]>1?ot(d,h,this.clusterProps):this.points[d[h+b]])}return u}getChildren(t){const e=this._getOriginId(t),s=this._getOriginZoom(t),n="No cluster with the specified id.",i=this.trees[s];if(!i)throw new Error(n);const o=i.data;if(e*this.stride>=o.length)throw new Error(n);const c=this.options.radius/(this.options.extent*Math.pow(2,s-1)),a=o[e*this.stride],d=o[e*this.stride+1],u=i.within(a,d,c),l=[];for(const h of u){const p=h*this.stride;o[p+H]===t&&l.push(o[p+M]>1?ot(o,p,this.clusterProps):this.points[o[p+b]])}if(l.length===0)throw new Error(n);return l}getLeaves(t,e,s){e=e||10,s=s||0;const n=[];return this._appendLeaves(n,t,e,s,0),n}getTile(t,e,s){const n=this.trees[this._limitZoom(t)],i=Math.pow(2,t),{extent:o,radius:c}=this.options,a=c/o,d=(s-a)/i,u=(s+1+a)/i,l={features:[]};return this._addTileFeatures(n.range((e-a)/i,d,(e+1+a)/i,u),n.data,e,s,i,l),e===0&&this._addTileFeatures(n.range(1-a/i,d,1,u),n.data,i,s,i,l),e===i-1&&this._addTileFeatures(n.range(0,d,a/i,u),n.data,-1,s,i,l),l.features.length?l:null}getClusterExpansionZoom(t){let e=this._getOriginZoom(t)-1;for(;e<=this.options.maxZoom;){const s=this.getChildren(t);if(e++,s.length!==1)break;t=s[0].properties.cluster_id}return e}_appendLeaves(t,e,s,n,i){const o=this.getChildren(e);for(const c of o){const a=c.properties;if(a&&a.cluster?i+a.point_count<=n?i+=a.point_count:i=this._appendLeaves(t,a.cluster_id,s,n,i):i<n?i++:t.push(c),t.length===s)break}return i}_createTree(t){const e=new Y(t.length/this.stride|0,this.options.nodeSize,Float32Array);for(let s=0;s<t.length;s+=this.stride)e.add(t[s],t[s+1]);return e.finish(),e.data=t,e}_addTileFeatures(t,e,s,n,i,o){for(const c of t){const a=c*this.stride,d=e[a+M]>1;let u,l,h;if(d)u=pt(e,a,this.clusterProps),l=e[a],h=e[a+1];else{const g=this.points[e[a+b]];u=g.properties;const[f,y]=g.geometry.coordinates;l=P(f),h=$(y)}const p={type:1,geometry:[[Math.round(this.options.extent*(l*i-s)),Math.round(this.options.extent*(h*i-n))]],tags:u};let m;d||this.options.generateId?m=e[a+b]:m=this.points[e[a+b]].id,m!==void 0&&(p.id=m),o.features.push(p)}}_limitZoom(t){return Math.max(this.options.minZoom,Math.min(Math.floor(+t),this.options.maxZoom+1))}_cluster(t,e){const{radius:s,extent:n,reduce:i,minPoints:o}=this.options,c=s/(n*Math.pow(2,e)),a=t.data,d=[],u=this.stride;for(let l=0;l<a.length;l+=u){if(a[l+_]<=e)continue;a[l+_]=e;const h=a[l],p=a[l+1],m=t.within(a[l],a[l+1],c),g=a[l+M];let f=g;for(const y of m){const k=y*u;a[k+_]>e&&(f+=a[k+M])}if(f>g&&f>=o){let y=h*g,k=p*g,E,Q=-1;const B=((l/u|0)<<5)+(e+1)+this.points.length;for(const yt of m){const C=yt*u;if(a[C+_]<=e)continue;a[C+_]=e;const tt=a[C+M];y+=a[C]*tt,k+=a[C+1]*tt,a[C+H]=B,i&&(E||(E=this._map(a,l,!0),Q=this.clusterProps.length,this.clusterProps.push(E)),i(E,this._map(a,C)))}a[l+H]=B,d.push(y/f,k/f,1/0,B,-1,f),i&&d.push(Q)}else{for(let y=0;y<u;y++)d.push(a[l+y]);if(f>1)for(const y of m){const k=y*u;if(!(a[k+_]<=e)){a[k+_]=e;for(let E=0;E<u;E++)d.push(a[k+E])}}}}return d}_getOriginId(t){return t-this.points.length>>5}_getOriginZoom(t){return(t-this.points.length)%32}_map(t,e,s){if(t[e+M]>1){const o=this.clusterProps[t[e+ht]];return s?Object.assign({},o):o}const n=this.points[t[e+b]].properties,i=this.options.map(n);return s&&i===n?Object.assign({},i):i}}function ot(r,t,e){return{type:"Feature",id:r[t+b],properties:pt(r,t,e),geometry:{type:"Point",coordinates:[Tt(r[t]),St(r[t+1])]}}}function pt(r,t,e){const s=r[t+M],n=s>=1e4?`${Math.round(s/1e3)}k`:s>=1e3?`${Math.round(s/100)/10}k`:s,i=r[t+ht],o=i===-1?{}:Object.assign({},e[i]);return Object.assign(o,{cluster:!0,cluster_id:r[t+b],point_count:s,point_count_abbreviated:n})}function P(r){return r/360+.5}function $(r){const t=Math.sin(r*Math.PI/180),e=.5-.25*Math.log((1+t)/(1-t))/Math.PI;return e<0?0:e>1?1:e}function Tt(r){return(r-.5)*360}function St(r){const t=(180-r*360)*Math.PI/180;return 360*Math.atan(Math.exp(t))/Math.PI-90}/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */function Pt(r,t){var e={};for(var s in r)Object.prototype.hasOwnProperty.call(r,s)&&t.indexOf(s)<0&&(e[s]=r[s]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,s=Object.getOwnPropertySymbols(r);n<s.length;n++)t.indexOf(s[n])<0&&Object.prototype.propertyIsEnumerable.call(r,s[n])&&(e[s[n]]=r[s[n]]);return e}class w{static isAdvancedMarkerAvailable(t){return google.maps.marker&&t.getMapCapabilities().isAdvancedMarkersAvailable===!0}static isAdvancedMarker(t){return google.maps.marker&&t instanceof google.maps.marker.AdvancedMarkerElement}static setMap(t,e){this.isAdvancedMarker(t)?t.map=e:t.setMap(e)}static getPosition(t){if(this.isAdvancedMarker(t)){if(t.position){if(t.position instanceof google.maps.LatLng)return t.position;if(t.position.lat&&t.position.lng)return new google.maps.LatLng(t.position.lat,t.position.lng)}return new google.maps.LatLng(null)}return t.getPosition()}static getVisible(t){return this.isAdvancedMarker(t)?!0:t.getVisible()}}class K{constructor({markers:t,position:e}){this.markers=t,e&&(e instanceof google.maps.LatLng?this._position=e:this._position=new google.maps.LatLng(e))}get bounds(){if(this.markers.length===0&&!this._position)return;const t=new google.maps.LatLngBounds(this._position,this._position);for(const e of this.markers)t.extend(w.getPosition(e));return t}get position(){return this._position||this.bounds.getCenter()}get count(){return this.markers.filter(t=>w.getVisible(t)).length}push(t){this.markers.push(t)}delete(){this.marker&&(w.setMap(this.marker,null),this.marker=void 0),this.markers.length=0}}class $t{constructor({maxZoom:t=16}){this.maxZoom=t}noop({markers:t}){return Dt(t)}}const Dt=r=>r.map(e=>new K({position:w.getPosition(e),markers:[e]}));class Ft extends $t{constructor(t){var{maxZoom:e,radius:s=60}=t,n=Pt(t,["maxZoom","radius"]);super({maxZoom:e}),this.state={zoom:-1},this.superCluster=new It(Object.assign({maxZoom:this.maxZoom,radius:s},n))}calculate(t){let e=!1;const s={zoom:t.map.getZoom()};if(!st(t.markers,this.markers)){e=!0,this.markers=[...t.markers];const n=this.markers.map(i=>{const o=w.getPosition(i);return{type:"Feature",geometry:{type:"Point",coordinates:[o.lng(),o.lat()]},properties:{marker:i}}});this.superCluster.load(n)}return e||(this.state.zoom<=this.maxZoom||s.zoom<=this.maxZoom)&&(e=!st(this.state,s)),this.state=s,e&&(this.clusters=this.cluster(t)),{clusters:this.clusters,changed:e}}cluster({map:t}){return this.superCluster.getClusters([-180,-90,180,90],Math.round(t.getZoom())).map(e=>this.transformCluster(e))}transformCluster({geometry:{coordinates:[t,e]},properties:s}){if(s.cluster)return new K({markers:this.superCluster.getLeaves(s.cluster_id,1/0).map(i=>i.properties.marker),position:{lat:e,lng:t}});const n=s.marker;return new K({markers:[n],position:w.getPosition(n)})}}class Nt{constructor(t,e){this.markers={sum:t.length};const s=e.map(i=>i.count),n=s.reduce((i,o)=>i+o,0);this.clusters={count:e.length,markers:{mean:n/e.length,sum:n,min:Math.min(...s),max:Math.max(...s)}}}}class Ut{render({count:t,position:e},s,n){const o=`<svg fill="${t>Math.max(10,s.clusters.markers.mean)?"#ff0000":"#0000ff"}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50">
<circle cx="120" cy="120" opacity=".6" r="70" />
<circle cx="120" cy="120" opacity=".3" r="90" />
<circle cx="120" cy="120" opacity=".2" r="110" />
<text x="50%" y="50%" style="fill:#fff" text-anchor="middle" font-size="50" dominant-baseline="middle" font-family="roboto,arial,sans-serif">${t}</text>
</svg>`,c=`Cluster of ${t} markers`,a=Number(google.maps.Marker.MAX_ZINDEX)+t;if(w.isAdvancedMarkerAvailable(n)){const l=new DOMParser().parseFromString(o,"image/svg+xml").documentElement;l.setAttribute("transform","translate(0 25)");const h={map:n,position:e,zIndex:a,title:c,content:l};return new google.maps.marker.AdvancedMarkerElement(h)}const d={position:e,zIndex:a,title:c,icon:{url:`data:image/svg+xml;base64,${btoa(o)}`,anchor:new google.maps.Point(25,25)}};return new google.maps.Marker(d)}}function Bt(r,t){for(let e in t.prototype)r.prototype[e]=t.prototype[e]}class X{constructor(){Bt(X,google.maps.OverlayView)}}var T;(function(r){r.CLUSTERING_BEGIN="clusteringbegin",r.CLUSTERING_END="clusteringend",r.CLUSTER_CLICK="click"})(T||(T={}));const Rt=(r,t,e)=>{e.fitBounds(t.bounds)};class Zt extends X{constructor({map:t,markers:e=[],algorithmOptions:s={},algorithm:n=new Ft(s),renderer:i=new Ut,onClusterClick:o=Rt}){super(),this.markers=[...e],this.clusters=[],this.algorithm=n,this.renderer=i,this.onClusterClick=o,t&&this.setMap(t)}addMarker(t,e){this.markers.includes(t)||(this.markers.push(t),e||this.render())}addMarkers(t,e){t.forEach(s=>{this.addMarker(s,!0)}),e||this.render()}removeMarker(t,e){const s=this.markers.indexOf(t);return s===-1?!1:(w.setMap(t,null),this.markers.splice(s,1),e||this.render(),!0)}removeMarkers(t,e){let s=!1;return t.forEach(n=>{s=this.removeMarker(n,!0)||s}),s&&!e&&this.render(),s}clearMarkers(t){this.markers.length=0,t||this.render()}render(){const t=this.getMap();if(t instanceof google.maps.Map&&t.getProjection()){google.maps.event.trigger(this,T.CLUSTERING_BEGIN,this);const{clusters:e,changed:s}=this.algorithm.calculate({markers:this.markers,map:t,mapCanvasProjection:this.getProjection()});if(s||s==null){const n=new Set;for(const o of e)o.markers.length==1&&n.add(o.markers[0]);const i=[];for(const o of this.clusters)o.marker!=null&&(o.markers.length==1?n.has(o.marker)||w.setMap(o.marker,null):i.push(o.marker));this.clusters=e,this.renderClusters(),requestAnimationFrame(()=>i.forEach(o=>w.setMap(o,null)))}google.maps.event.trigger(this,T.CLUSTERING_END,this)}}onAdd(){this.idleListener=this.getMap().addListener("idle",this.render.bind(this)),this.render()}onRemove(){google.maps.event.removeListener(this.idleListener),this.reset()}reset(){this.markers.forEach(t=>w.setMap(t,null)),this.clusters.forEach(t=>t.delete()),this.clusters=[]}renderClusters(){const t=new Nt(this.markers,this.clusters),e=this.getMap();this.clusters.forEach(s=>{s.markers.length===1?s.marker=s.markers[0]:(s.marker=this.renderer.render(s,t,e),s.markers.forEach(n=>w.setMap(n,null)),this.onClusterClick&&s.marker.addListener("click",n=>{google.maps.event.trigger(this,T.CLUSTER_CLICK,s),this.onClusterClick(n,s,e)})),w.setMap(s.marker,e)})}}const D=0,at=1,F=2;let v={};async function I({dateShift:r,plug:t,site:e,date:s}={}){var c,a,d,u;s&&(v.date=s),r===-1&&(v.date=jt(v.date)),r===1&&(v.date=Ht(v.date)),t&&(v.plug=t),e&&(v.site=e),console.log("drawHistogram called ",v);let n=await Mt(v.site,v.plug,v.date.toISOString()),i,o;Gt(v.date)&&(i=new Date().getUTCHours(),o=v.plug==="ccs"?v.site.busynessCcs:v.site.busynessType2),document.getElementById("histogram").innerHTML=ft(n,i,o,v.date),(c=document.getElementById("date-prev"))==null||c.addEventListener("click",()=>I({dateShift:-1})),(a=document.getElementById("date-next"))==null||a.addEventListener("click",()=>I({dateShift:1})),(d=document.getElementById("hist-ccs"))==null||d.addEventListener("click",()=>I({plug:"ccs"})),(u=document.getElementById("hist-type2"))==null||u.addEventListener("click",()=>I({plug:"type2"}))}function ft(r,t,e,s){let n=`
	<div class="outer">
	  <div class="axis-line"></div>
		<button id="date-prev" class="left-arrow icon-button"><img src="img/left-arrow.svg" /></button>
		<button id="date-next" class="right-arrow icon-button"><img src="img/right-arrow.svg" /></button>
		<div class="date">${s?s.toLocaleDateString():""}</div>
		<div class="graph">`;for(let i=0;i<24;i++){if(n+='<div class="column">',r){if(i==t&&e!==void 0){let o=bt(e);if(o[F]>0){let a=o[F]/o[D]*100;n+=`<div class="broken now" style="height:${a}%"></div>`}let c=o[at]/o[D]*100;c===0&&(c=1),n+=`<div class="busy now" style="height:${c}%"></div>`}else if(r[i]&&r[i].length){if(r[i][F]>0){let c=r[i][F]/r[i][D]*100;n+=`<div class="broken" style="height:${c}%"></div>`}let o=r[i][at]/r[i][D]*100;(o===0||Number.isNaN(o))&&(o=1),n+=`<div class="busy" style="height:${o}%"></div>`}}n+="</div>"}return n+=`
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
	`,n}function jt(r){let t=new Date(r);return t.setUTCDate(t.getUTCDate()-1),t}function Ht(r){let t=new Date(r);return t.setUTCDate(t.getUTCDate()+1),t}function Gt(r){let t=new Date;return r.getFullYear()===t.getFullYear()&&r.getMonth()===t.getMonth()&&r.getDate()===t.getDate()}const Vt="http://localhost:8082/siteLogDump";let N;async function mt(r,t){var i;const{InfoWindow:e}=await google.maps.importLibrary("maps");N||(N=new e({content:""})),N.setContent(Kt(r)),N.open({anchor:r.marker,map:t,shouldFocus:!1});let n=((i=lt(r).ccs)==null?void 0:i.total)>0?"ccs":"type2";I({site:r,plug:n,date:new Date})}function Kt(r){var n,i;let t=lt(r),e=`
	<div id="info-window" class="row-top">
		<div class="operator-logo">
			<img src="img/operator-logo/${r.party_id}.png" />
		</div>
		<div>
			<div class="name">${r.name}</div>
			<div class="network">${r.operatorName}</div>
		</div>
	</div>
	<div id="histogram">${ft()}</div>
	<div class="row-bottom">
		<div class="devices">`;for(let o of ct(r,"IEC_62196_T2_COMBO"))e+=`<div class="device">
				  <img src="img/ccs${o.status}.png" class="device-icon" />
				  <div class="device-speed">${o.powerKw}</div>
				</div>`;for(let o of ct(r,"IEC_62196_T2"))e+=`<div class="device">
				  <img src="img/type2${o.status}.png" class="device-icon">
				  <div class="device-speed">${o.powerKw}</div>
				</div>`;e+=`
		</div>
		<div class="price">${r.priceCcs?r.priceCcs*100+"p/kwh":"price unknown"}</div>`;let s=parseInt(r.statusCcs);return r.statusCcs===null||r.statusCcs===void 0?e+="<span></span>":s>75?e+='<span class="pill red">FULL</span>':s>=50?e+='<span class="pill orange">BUSY</span>':s>=0&&(e+='<span class="pill green"><span class="dot dark-green"></span>QUIET</span>'),e+=`
	</div>
	<div class="second-row-bottom">`,((n=t.ccs)==null?void 0:n.total)>0&&(e+='<button id="hist-ccs">CCS</button>&nbsp;'),((i=t.type2)==null?void 0:i.total)>0&&(e+='<button id="hist-type2">Type 2</button>&nbsp;'),e+=`<a href="${Vt}?site=${r.id}" target="_blank">log dump</a>
	</div>
	`,e}function ct(r,t){let e=[];for(let s of r.evses)for(let n of s.connectors)if(n.standard===t){let i=Ct(s.status)||_t(s.status)?"_grey":"";e.push({powerKw:(n.max_electric_power/1e3).toFixed(0)+"kW",status:i})}return e}let q=[],U,z;async function qt(r,t){z=await google.maps.importLibrary("marker");const e=document.createElement("div");e.className="list-marker",e.append(gt(r)),r.marker=new z.AdvancedMarkerElement({map:t,position:{lat:r.latitude,lng:r.longitude},content:e}),r.marker.site=r,U.addMarker(r.marker),q.push(r.marker),r.marker.addListener("click",async()=>{console.log(r.name+" clicked"),mt(r,t)})}async function zt(r,t){}function gt(r,t=!0,e=!0){let{colour:s,speed:n,price:i}=W(r);const o=document.createElement("div");o.className="row"+(t?" first":"")+(e?" last":"")+(s?" "+s:"");let c=document.createElement("img");c.className="icon",c.src=`pins/operator-${r.party_id}.png`,o.append(c),n&&n!=="slow"&&(c=document.createElement("img"),c.className="lightning",c.src=`pins/speed-${n}.png`,o.append(c));const a=document.createElement("div");return a.className=i,a.textContent=r.priceCcs?Math.round(r.priceCcs*100)+"p":"---",o.append(a),o}function Wt(r,t){const e=document.createElement("div");e.className="row-footer last",e.style.backgroundColor=t;const s=document.createElement("div");return s.textContent=r,e.append(s),e}function Yt(r){U||(U=new Zt({map:r,renderer:Xt,onClusterClick:Qt}))}let Xt={render:(r,t,e)=>{const n=r.markers.length,i=Jt(r.markers),o=document.createElement("div");o.className="list-marker";for(let c=0;c<n&&c<3;c++){const a=i[c].site,d=gt(a,c===0,c===n-1);o.append(d)}if(n>3){const c=Wt(`+${n-3}`,"#777");o.append(c)}return new z.AdvancedMarkerElement({map:e,position:r.position,content:o})}};function Jt(r){return[...r].sort((e,s)=>{let n=W(e.site),i=W(s.site),o=n.colour=="green"?3:n.colour=="orange"?2:1,c=i.colour=="green"?3:i.colour=="orange"?2:1;return c===o&&(o=n.price=="low"?3:n.price=="fair"?2:1,c=i.price=="low"?3:i.price=="fair"?2:1),c-o})}async function Qt(r,t,e){const s=t.markers[0].site;console.log("Cluster clicked. first site is "+s.name),await mt(s,e)}function W(r){let t=parseInt(r.statusCcs||r.statusType2),e="",s="";(r.statusCcs||r.statusType2)===void 0?(e="gray",s="full"):t>75?(e="red",s="full"):t>=50?(e="orange",s="busy"):t<50&&(e="green",s="quiet");let n="low";r.priceCcs>=.7&&(n="fair"),r.priceCcs>=.76&&(n="high"),r.priceCcs==null&&(n="");let{speed:i}=kt(r,"IEC_62196_T2_COMBO");return{colour:e,availability:s,price:n,speed:i}}function vt(){for(let r of q)r.map=void 0;U.clearMarkers(),q=[]}let x,A=[],S="ccs";async function te(){const{Map:r}=await google.maps.importLibrary("maps");x=new r(document.getElementById("map"),{zoom:11,center:{lat:53.3,lng:-2.402},mapId:"available_chargers"}),x.addListener("bounds_changed",t=>{G()}),x.addListener("drag",t=>{G()}),x.addListener("zoom_changed",t=>{G()})}te();async function J(){let r=x.getBounds(),t=r.getNorthEast().lat(),e=r.getNorthEast().lng(),s=r.getSouthWest().lat(),n=r.getSouthWest().lng();console.log(`getbounds latlon (${s.toFixed(3)}, ${n.toFixed(3)}), latlon2 (${t.toFixed(3)}, ${e.toFixed(3)}) `);let i=await Et(s,n,t,e,S);Yt(x);for(let o of i){let c=ee(o),a=c==-1?void 0:A[c];a&&(o.marker=a.marker,A[c]=o),a?await zt():(await qt(o,x),A.push(o))}}const G=wt(()=>J(),500);function ee(r){return A.findIndex(t=>t.id===r.id)}function se(){document.getElementById("fast-tab-button").classList.add("selected"),document.getElementById("slow-tab-button").classList.remove("selected"),S!=="ccs"&&(S="ccs",vt(),A=[],J())}function re(){document.getElementById("fast-tab-button").classList.remove("selected"),document.getElementById("slow-tab-button").classList.add("selected"),S!=="any"&&(S="any",vt(),A=[],J())}window.onload=function(){document.getElementById("fast-tab-button").addEventListener("click",se),document.getElementById("slow-tab-button").addEventListener("click",re)};
