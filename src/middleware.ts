// eslint-disable-next-line no-unused-vars
import { BaseContext } from "koa"

export { logger } from "koa2-winston"
export { koaMiddleware as koaPrometheus } from "prometheus-api-metrics"

export const printUri = () => async (ctx: BaseContext, next: () => Promise<any>) => {
  console.log(JSON.stringify({ uri: ctx.url }))
  await next()
}

export const printContext = () => async (ctx: BaseContext, next: () => Promise<any>) => {
  console.log(ctx)
  await next()
}
