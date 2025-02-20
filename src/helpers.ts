

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
