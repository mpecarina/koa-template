import Koa from "koa"
import bodyParser from "koa-bodyparser"
import json from "koa-json"
import { koaRouter, loadJSON } from "./router"
import { logger, koaPrometheus } from "./middleware"
import { inspect } from "util"

/**
 * Exports package.json for test.
 */
export let pkg: any

try {
  pkg = loadJSON("./package.json")
} catch (err) {
  console.log(err)
  pkg = {}
}

/**
 * Sort properties of an object alphabetically by key.
 * @param {object[]} obj
 * @param {number|null} limit
 * @returns Array of sorted properties.
 */
export const sortProperties = (obj: object[], limit: number | null = null) => {
  const sortable = []
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      sortable.push([key, obj[key]])
    }
  }
  sortable.sort((a, b): any => {
    try {
      const x = a[1]
      const y = b[1]
      return x < y ? -1 : x > y ? 1 : 0
    } catch (err) {
      console.log(err)
    }
  })
  if (!limit) {
    return sortable
  }
  return sortable.slice(Number(-limit))
}

/**
 * Inspect nested object properties.
 * @param {object} obj Object to inspect.
 * @returns {string} Recursive properties.
 */
export const inspectObj = (obj: object): any => {
  return inspect(obj, { colors: true, depth: null })
}

/**
 * Initializes the basic and metrics apps.
 * @param {Koa.Middleware[]|null} middleware
 * @returns {Koa[]} Array containing the apps.
 */
export const initApps = (middleware: Koa.Middleware[]): Koa[] => {
  metricsApp = new Koa().use(koaPrometheus())
  app = new Koa()
  if (middleware) {
    middleware.forEach((m: Koa.Middleware) => {
      app.use(m)
    })
  }
  app.use(
    require("koa-static-server")({
      rootDir: process.env.STATIC_DIR || `./dist/${pkg.name}`,
      rootPath: process.env.ROOT_PATH || "/",
    }),
  )
  return [app, metricsApp]
}

/**
 * Starts apps.
 */
export let [app, metricsApp] = initApps([
  logger(),
  bodyParser(),
  json({ pretty: false, param: "pretty", spaces: 4 }),
  koaRouter(),
])

/**
 * Main application entrypoint.
 */
if (!module.parent) {
  try {
    app.listen(process.env.APP_PORT_0 || 3000)
    metricsApp.listen(process.env.APP_PORT_1 || 3001)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
