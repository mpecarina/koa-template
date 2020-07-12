/* eslint-disable no-unused-vars */
import axios from "axios"
import { readFileSync } from "fs"
import { BaseContext } from "koa"
import Router from "koa-router"
import yaml from "js-yaml"
import { generateAuthUrl } from "./oauth"

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
 * Load dictionary object from YAML.
 * @param {string} pkgPath Path to file.
 * @returns {object|Array} Parsed dictionary object.
 */
export const loadYAML = (pkgPath: string): any => {
  return yaml.safeLoad(readFileSync(pkgPath, { encoding: "utf-8" }))
}

/**
 * Execute common proxy logic.
 * @param {any} r Route object from parsed routes.yaml file.
 * @param {any} method Method string.
 * @param {BaseContext|any} ctx Koa context object.
 * @returns {Promise<any>} Axios call response.
 */
const opaqueProxy = async (r: any, method: any, ctx: BaseContext | any): Promise<any> => {
  if (r.auth.sso && !ctx.session.isAuthenticated) {
    ctx.status = 403
    ctx.body = { status: "error", msg: "unauthorized user" }
  } else {
    const urlPath = `${r.proxy.url}${ctx.request.url}`
    const m = method.toLowerCase()
    let axiosCall: Promise<any>
    if (m === "get" || m === "delete") {
      axiosCall = axios({
        headers: ctx.request.header,
        method: m.toLowerCase(),
        url: urlPath,
      })
    } else {
      axiosCall = axios({
        method: method.toLowerCase(),
        url: urlPath,
        data: ctx.request.body,
        headers: ctx.request.header,
      })
    }
    const response = await axiosCall
    if (r.proxy.filter?.enabled) {
      r.proxy.filter.fields.forEach((field: string) => {
        const rewriteResponseField = response.data[field]
        if (rewriteResponseField) {
          const key = r.proxy.filter.find
          const val = r.proxy.filter.replace
          if (key && val && rewriteResponseField.includes(key)) {
            response.data[field] = rewriteResponseField.replace(key, val)
          }
        }
      })
    }
    return response.data
  }
}

/**
 * Loads Koa routes from JSON description.
 * @param {string} routesPath Path to routes file.
 * @param {string} controllersPath Path to routes file.
 * @returns {Koa.Middleware} Koa router middleware.
 */
export const koaRouter = (routesPath: string = "./routes.yaml", controllersPath?: string): Router.IMiddleware => {
  let routes
  try {
    if (routesPath?.includes(".yaml") || routesPath?.includes(".yml")) {
      routes = loadYAML(routesPath)
    } else {
      routes = loadJSON(routesPath)
    }
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
            if (r.auth.sso && !ctx.session.isAuthenticated) {
              ctx.redirect(generateAuthUrl())
            } else {
              ctx.redirect(`${r.proxy.url}${ctx.request.url}`)
            }
          })
        } else if (r.proxy.enabled && !r.proxy.redirect) {
          router.get(r.route, async (ctx: any) => {
            ctx.body = await opaqueProxy(r, m, ctx)
          })
        } else {
          router.get(r.route, handler)
        }
      } else if (m.match("post", "i")) {
        if (r.proxy.enabled && !r.proxy.redirect) {
          router.post(r.route, async (ctx: any) => {
            ctx.body = await opaqueProxy(r, m, ctx)
          })
        } else {
          router.post(r.route, handler)
        }
      } else if (m.match("put", "i")) {
        if (r.proxy.enabled && !r.proxy.redirect) {
          router.put(r.route, async (ctx: any) => {
            ctx.body = await opaqueProxy(r, m, ctx)
          })
        } else {
          router.put(r.route, handler)
        }
      } else if (m.match("patch", "i")) {
        if (r.proxy.enabled && !r.proxy.redirect) {
          router.patch(r.route, async (ctx: any) => {
            ctx.body = await opaqueProxy(r, m, ctx)
          })
        } else {
          router.patch(r.route, handler)
        }
      } else if (m.match("delete", "i")) {
        if (r.proxy.enabled && !r.proxy.redirect) {
          router.delete(r.route, async (ctx: any) => {
            ctx.body = await opaqueProxy(r, m, ctx)
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
