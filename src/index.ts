import Koa from "koa"
import bodyParser from "koa-bodyparser"
import json from "koa-json"
import { koaRouter, loadJSON } from "./router"
import { logger, koaPrometheus } from "./middleware"
import { inspect } from "util"
import session from "koa-session"
import passport from "koa-passport"
import path from "path"

const { STATIC_DIR, STATIC_PATH, SECRET_KEY, APP_PORT_0, APP_PORT_1, NOT_FOUND_FILE } = process.env

/**
 * Exports default middleware.
 */
exports.logger = logger
exports.koaRouter = koaRouter
exports.bodyParser = bodyParser
exports.json = json

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
  const app = new Koa()
  app.keys = [SECRET_KEY || "co0k13co0k13s"]
  app.proxy = true
  app.use(
    session(
      {
        key: app.keys[0],
        maxAge: 86400000,
        overwrite: true,
        httpOnly: true,
        signed: true,
        rolling: false,
        renew: false,
      },
      app,
    ),
  )
  app.use(passport.initialize())
  app.use(passport.session())
  if (middleware) {
    middleware.forEach((m: Koa.Middleware) => {
      app.use(m)
    })
  }
  app.use(
    require("koa-static-server")({
      rootDir: STATIC_DIR || "./static",
      rootPath: STATIC_PATH || "/",
      notFoundFile: NOT_FOUND_FILE || "index.html",
    }),
  )
  const metricsApp = new Koa().use(koaPrometheus())
  return [app, metricsApp]
}

/**
 * Main application entrypoint.
 */
if (!module.parent) {
  try {
    const [app, metricsApp] = initApps([
      logger(),
      bodyParser(),
      json({ pretty: false, param: "pretty", spaces: 2 }),
      koaRouter(path.join(__dirname, `../routes.yaml`)),
    ])
    app.listen(APP_PORT_0 || 3000)
    metricsApp.listen(APP_PORT_1 || 3001)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
