import axios from "axios"
import { readFileSync } from "fs"
import Router from "koa-router"

/**
 * Ignore certificate errors.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

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
export const koaRouter = (routesPath?: string, controllersPath?: string): Router.IMiddleware => {
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
      let handler
      if (r.controller && r.handler) {
        handler = eval(`require("${controllersPath || "./controllers"}/${r.controller}").${r.handler}`)
      }
      if (m.match("get", "i")) {
        if (r.proxy.enabled && r.proxy.redirect) {
          router.get(r.route, (ctx: any) => {
            ctx.redirect(r.proxy.url)
          })
        } else if (r.proxy.enabled && !r.proxy.redirect) {
          router.get(r.route, async (ctx: any) => {
            const callUrl = axios({
              method: m.toLowerCase(),
              url: r.proxy.url,
              headers: ctx.request.header,
            })
            const response = await callUrl
            ctx.body = response.data
          })
        } else {
          router.get(r.route, handler)
        }
      } else if (m.match("post", "i")) {
        if (r.proxy.enabled && !r.proxy.redirect) {
          router.post(r.route, async (ctx: any) => {
            const callUrl = axios({
              method: m.toLowerCase(),
              url: r.proxy.url,
              headers: ctx.request.header,
            })
            const response = await callUrl
            ctx.body = response.data
          })
        } else {
          router.post(r.route, handler)
        }
      } else if (m.match("put", "i")) {
        if (r.proxy.enabled && !r.proxy.redirect) {
          router.put(r.route, async (ctx: any) => {
            const callUrl = axios({
              method: m.toLowerCase(),
              url: r.proxy.url,
              headers: ctx.request.header,
            })
            const response = await callUrl
            ctx.body = response.data
          })
        } else {
          router.put(r.route, handler)
        }
      } else if (m.match("patch", "i")) {
        if (r.proxy.enabled && !r.proxy.redirect) {
          router.patch(r.route, async (ctx: any) => {
            const callUrl = axios({
              method: m.toLowerCase(),
              url: r.proxy.url,
              headers: ctx.request.header,
            })
            const response = await callUrl
            ctx.body = response.data
          })
        } else {
          router.patch(r.route, handler)
        }
      } else if (m.match("delete", "i")) {
        if (r.proxy.enabled && !r.proxy.redirect) {
          router.delete(r.route, async (ctx: any) => {
            const callUrl = axios({
              method: m.toLowerCase(),
              url: r.proxy.url,
              headers: ctx.request.header,
            })
            const response = await callUrl
            ctx.body = response.data
          })
        } else {
          router.delete(r.route, handler)
        }
      } else {
        throw `invalid method: "${m}" for route: ${r.name}`
      }
    })
  })
  return router.routes()
}
