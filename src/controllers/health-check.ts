/* eslint-disable no-unused-vars */
import { BaseContext } from "koa"

export const ping = async (ctx: BaseContext) => {
  ctx.body = { status: "success", msg: "pong" }
}
