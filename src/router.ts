import Router from "koa-router"
import { readFileSync } from "fs"

/**
 * Exports router for tests.
 */
export const router: Router = new Router()

/**
 * Load dictionary object from JSON.
 * @param {string} pkgPath Path to file.
 * @returns {object|Array} Parsed dictionary object.
 */
export const loadJSON = (pkgPath: string): any => {
  return JSON.parse(readFileSync(pkgPath, { encoding: "utf-8" }))
}

/**
 * Loads Koa routes from JSON description.
 * @param routesPath Path to routes file.
 * @returns {Koa.Middleware} Koa router middleware.
 */
export const koaRouter = (routesPath?: string, controllerPath?: string): Router.IMiddleware => {
  let routes
  try {
    routes = loadJSON(routesPath || "./routes.json")
  } catch (err) {
    if (err.code === "ENOENT") {
      routes = loadJSON("./node_modules/@mpecarina/koa-template/routes.json")
    } else {
      throw err
    }
  }
  routes.forEach((r: any) => {
    r.method.forEach((m: any) => {
      const handler = eval(`require("${controllerPath || "./controllers.json"}/${r.controller}").${r.handler}`)
      if (m.match("post", "i")) {
        router.post(r.route, handler)
      } else if (m.match("get", "i")) {
        router.get(r.route, handler)
      } else if (m.match("put", "i")) {
        router.put(r.route, handler)
      } else if (m.match("patch", "i")) {
        router.patch(r.route, handler)
      } else if (m.match("delete", "i")) {
        router.delete(r.route, handler)
      }
    })
  })
  return router.routes()
}
