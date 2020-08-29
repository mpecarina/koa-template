/* eslint-disable no-unused-vars */
import { BaseContext } from "koa"
import { authenticate } from "../oauth"
import { queryDB } from "../postgres"

export const code = async (ctx: BaseContext | any) => {
  return authenticate(ctx)
}

export const logout = async (ctx: BaseContext | any) => {
  const userId = ctx.session.id
  ctx.session = null
  if (process.env.STORE_TOKEN === "true") {
    try {
      const queryStr = `UPDATE tokens SET session = '${ctx.session}' WHERE google_id = '${userId}'`
      await queryDB(queryStr)
    } catch (e) {
      console.log(e)
    }
  }
  return ctx.redirect("/sso/status")
}

export const status = async (ctx: BaseContext | any) => {
  const message = ctx.session.isAuthenticated
    ? `session is authenticated for user ${ctx.session.name}`
    : "session for anonymous is unauthenticated."
  return (ctx.body = {
    status: "success",
    msg: message,
  })
}
