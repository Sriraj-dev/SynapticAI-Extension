import log from "loglevel"

const isDev = process.env.ENV !== "production"

if (isDev) {
  log.setLevel("debug")
} else {
  log.setLevel("warn")
}

log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = (console as any)[methodName].bind(console)

  return function (...args: any[]) {
    rawMethod(`[Synaptic AI] [${methodName.toUpperCase()}]:`, ...args)
  }
}

// log.setLevel(log.getLevel())

export { log as logger }
