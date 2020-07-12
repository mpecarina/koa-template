/* eslint-disable no-unused-vars */
import { BaseContext } from "koa"
import {
  oAuth2Client,
  authenticate,
  getUserInfo,
  authenticateServiceAccount,
  getGroupMembers,
  superAdminsGroupKey,
  SCOPES,
  generateAuthUrl,
} from "../oauth"

export const code = async (ctx: BaseContext | any) => {
  const client = await authenticate(oAuth2Client, ctx.request.query.code)
  const userInfo = await getUserInfo(client)
  const jwtClient = await authenticateServiceAccount(SCOPES)
  const authorized = await getGroupMembers(jwtClient, superAdminsGroupKey, userInfo)
  if (authorized?.flat().length > 0) {
    ctx.session = { isAuthenticated: true, id: userInfo.data.id, name: userInfo.data.name }
    ctx.redirect("/sso-test")
  } else {
    ctx.status = 403
    ctx.body = { status: "error", msg: "unauthorized user, forbidden access" }
  }
}

export const logout = async (ctx: BaseContext | any) => {
  ctx.session = null
  ctx.redirect(generateAuthUrl())
}

export const test = async (ctx: BaseContext | any) => {
  if (!ctx.session.isAuthenticated) {
    ctx.redirect(generateAuthUrl())
  } else {
    ctx.body = { status: "success", msg: "sso authentication granted" }
  }
}
