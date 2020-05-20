import Router from "koa-router"
import { readFileSync } from "fs"

/**
 * Exports router for tests.
 */
export const router: Router = new Router()

/**
 * Load dictionary object from JSON.
 * @param {string} path Path to file.
 * @returns {object|Array} Parsed dictionary object.
 */
export const loadJSON = (path: string): any => {
  return JSON.parse(readFileSync(path, { encoding: "utf-8" }))
}

/**
 * Loads Koa routes from JSON description.
 * @param path Path to routes file.
 * @returns {Koa.Middleware} Koa router middleware.
 */
export const koaRouter = (path = "./routes.json"): Router.IMiddleware => {
  let routes
  try {
    routes = loadJSON(path)
  } catch (err) {
    if (err.code === "ENOENT") {
      routes = loadJSON("./node_modules/@mpecarina/koa-template/routes.json")
    } else {
      throw err
    }
  }
  routes.forEach((r: any) => {
    r.method.forEach((m: any) => {
      if (m.match("post", "i")) {
        router.post(r.route, async (ctx) => {
          try {
            ctx.body = JSON.parse(ctx.request.rawBody)
          } catch (err) {
            if (err.message.includes("Unexpected")) {
              ctx.body = ctx.request
            }
          }
        })
      } else if (m.match("get", "i")) {
        router.get(r.route, async (ctx) => {
          ctx.body = r.body || r
        })
      } else if (m.match("put", "i")) {
        router.put(r.route, async (ctx) => {
          ctx.body = r.body || r
        })
      } else if (m.match("patch", "i")) {
        router.patch(r.route, async (ctx) => {
          ctx.body = r.body || r
        })
      } else if (m.match("delete", "i")) {
        router.delete(r.route, async (ctx) => {
          ctx.body = r.body || r
        })
      }
    })
  })
  return router.routes()
}
