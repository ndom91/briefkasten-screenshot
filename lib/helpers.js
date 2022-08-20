export const setTiming = (name, obj) => {
  const now = performance.now()
  if (obj[name]?.start) {
    obj[name].end = now
    obj[name].dur = now - obj[name].start
  } else {
    obj[name] = { start: now }
  }
}
