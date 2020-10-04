/* eslint-disable no-unused-vars */
import axios from "axios"
import fs from "fs"
import Router from "koa-router"
import yaml from "js-yaml"
import { BaseContext } from "koa"
import { generateAuthUrl } from "./oauth"
import { v4 as uuidv4 } from "uuid"

/**
 * Ignore certificate errors.
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

/**
 * Configure axios default requests.
 */
axios.defaults.withCredentials = true

/**
 * Export router for tests.
 */
export const router: Router = new Router()

/**
 * Load dictionary object from JSON.
 * @param {string} pkgPath Path to file.
 * @returns {object|Array} Parsed dictionary object.
 */
export const loadJSON = (pkgPath: string): any => {
  return JSON.parse(fs.readFileSync(pkgPath, { encoding: "utf-8" }))
}

/**
 * Filter response fields in JSON api response object.
 * @param {any} response JSON api response object.
 * @param {string} find Search for in fields.
 * @param {string} replace Replace if found.
 * @param {string[]} fields JSON fields to filter.
 * @returns {any} Filtered JSON response.
 */
export const filterResponseFields = (response: any, find: string, replace: string, fields: string[]): any => {
  fields.forEach((field: string) => {
    const rewriteResponseField = response[field]
    if (rewriteResponseField && typeof rewriteResponseField === "string") {
      if (find && replace && rewriteResponseField.includes(find)) {
        const rewritten = rewriteResponseField.replace(find, replace)
        console.log(
          JSON.stringify({
            rewrite_response: { data_field: field, original_value: rewriteResponseField, new_value: rewritten },
          }),
        )
        response[field] = rewritten
      }
    }
  })
  return response
}

/**
 * Load dictionary object from YAML.
 * @param {string} pkgPath Path to file.
 * @returns {object|Array} Parsed dictionary object.
 */
export const loadYAML = (pkgPath: string): any => {
  return yaml.safeLoad(fs.readFileSync(pkgPath, { encoding: "utf-8" }))
}

/**
 * Execute common proxy logic.
 * @param {any} r Route object from parsed routes.yaml file.
 * @param {BaseContext|any} ctx Koa context object.
 * @returns {Promise<any>} Axios call response.
 */
const opaqueProxy = async (r: any, ctx: BaseContext | any): Promise<any> => {
  const urlPath = `${r.proxy.url}${ctx.request.url}`
  ctx.request.header["api-gateway-request-id"] = uuidv4()
  ctx.request.header["accept-encoding"] = "gzip"
  if (r.proxy.raw) {
    const lowerPath = urlPath.toLowerCase()
    if (lowerPath.endsWith(".css")) {
      ctx.set("content-type", "text/css")
    }
    if (lowerPath.endsWith(".js")) {
      ctx.set("content-type", "application/javascript")
    }
  }
  const method = ctx.method.toLowerCase()
  const axiosCall: any =
    method === "get" || method === "delete"
      ? axios({
          headers: ctx.request.header,
          method: method,
          url: urlPath,
        })
      : axios({
          method: method,
          url: urlPath,
          data: ctx.request.body,
          headers: ctx.request.header,
        })

  console.log(JSON.stringify({ call_url: urlPath, method: method, data: ctx.request.body }))
  try {
    const rawResponse: any = await axiosCall
    const response: any = rawResponse.data ? rawResponse.data : rawResponse.config.response.data
    return r.proxy.filter?.enabled
      ? filterResponseFields(response, r.proxy.filter.find, r.proxy.filter.replace, r.proxy.filter.fields)
      : response
  } catch (e) {
    ctx.status = e.response.status
    return e.response.data
  }
}

/**
 * Check if route method matches current context.
 * @param {string[]} methods Array of method strings.
 * @param {BaseContext|any} ctx Koa context object.
 * @returns {boolean}
 */
const validRouteMethod = (methods: string[] | any, ctx: BaseContext | any): boolean => {
  if (methods.indexOf(ctx.method.toLowerCase()) > -1) {
    return true
  }
  return false
}

/**
 * Common logic for all requests.
 * @param {any} r Route object from parsed routes.yaml file.
 * @returns {Promise<any>} Response context.
 */
const routeRequest = async (r: any): Promise<any> => {
  let handler: any
  if (r.controller && r.handler) {
    handler = eval(`require("${r.controllerPath || "./controllers"}/${r.controller}").${r.handler}`)
  }
  r.method.forEach((m: string) => {
    if (handler) {
      router.all(r.routes, async (ctx: any, next: any) => {
        try {
          if (r.auth?.sso && !ctx.session.isAuthenticated) {
            const callBackURL = `${ctx.protocol}://${ctx.request.header.host}${ctx.request.url}`
            return ctx.redirect(generateAuthUrl(callBackURL))
          }
          const hostOriginNotFound = r.origin?.indexOf(ctx.request.header.host) <= -1
          if (!validRouteMethod(m, ctx) || hostOriginNotFound) {
            return next()
          } else {
            return handler(ctx)
          }
        } catch (e) {
          return (ctx.body = { status: "error", msg: JSON.stringify(e) })
        }
      })
    }
    if (r.proxy.enabled && r.proxy.redirect) {
      router.all(r.routes, async (ctx: any, next: any) => {
        try {
          if (r.auth?.sso && !ctx.session.isAuthenticated) {
            const callBackURL = `${ctx.protocol}://${ctx.request.header.host}${ctx.request.url}`
            return ctx.redirect(generateAuthUrl(callBackURL))
          }
          const hostOriginNotFound = r.origin?.indexOf(ctx.request.header.host) <= -1
          if (!validRouteMethod(m, ctx) || hostOriginNotFound) {
            return next()
          } else {
            return ctx.redirect(`${r.proxy.url}${ctx.request.url}`)
          }
        } catch (e) {
          ctx.status = 500
          return (ctx.body = { status: "error", msg: JSON.stringify(e) })
        }
      })
    } else if (r.proxy.enabled && !r.proxy.redirect) {
      router.all(r.routes, async (ctx: any, next: any) => {
        try {
          if (r.auth?.sso && !ctx.session.isAuthenticated) {
            const callBackURL = `${ctx.protocol}://${ctx.request.header.host}${ctx.request.url}`
            return ctx.redirect(generateAuthUrl(callBackURL))
          }
          const hostOriginNotFound = r.origin?.indexOf(ctx.request.header.host) <= -1
          if (!validRouteMethod(m, ctx) || hostOriginNotFound) {
            return next()
          } else {
            ctx.request.header.host = new URL(r.proxy.url).hostname
            const resp = await opaqueProxy(r, ctx)
            return r.proxy.raw ? (ctx.body = resp) : (ctx.body = JSON.stringify(resp))
          }
        } catch (e) {
          return (ctx.body = { status: "error", msg: JSON.stringify(e) })
        }
      })
    }
  })
}

/**
 * Loads Koa routes from YAML service definitions file.
 * @param {string} routesPath Path to routes file.
 * @param {string} controllersPath Path to controllers file.
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
    r.controllerPath = controllersPath
    routeRequest(r)
  })
  return router.routes()
}
