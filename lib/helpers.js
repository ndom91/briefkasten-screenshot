export const serverTiming = {
  perf: global?.performance
    ? global.performance
    : { now: () => new Date().getTime() },
  timings: {},
  start: () => {
    serverTiming.timings = {
      total: {
        start: serverTiming.perf.now(),
      },
    }
  },
  measure: (name) => {
    const now = serverTiming.perf.now()
    if (serverTiming.timings[name]?.start) {
      serverTiming.timings[name].end = now
      serverTiming.timings[name].dur = now - serverTiming.timings[name].start
      /* if (desc) serverTiming.timings[name].desc = desc */
    } else {
      serverTiming.timings[name] = { start: now }
      /* if (desc) serverTiming.timings[name].desc = desc */
    }
  },
  setHeader: () => {
    serverTiming.measure('total')
    return Object.entries(serverTiming.timings)
      .map(([name, measurements]) => {
        return `${name};${
          measurements.desc ? `desc="${measurements.desc}";` : ''
        }dur=${measurements.dur}`
      })
      .join(',')
  },
}
