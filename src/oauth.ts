/* eslint-disable no-unused-vars */
import fs from "fs"
import http from "http"
import url from "url"
import opn from "open"
import destroyer from "server-destroy"
import { queryDB } from "./postgres"
import { google } from "googleapis"

const GATEWAY_KEY_PATH: string = process.env.GATEWAY_KEY_PATH || ""
const SERVICE_ACCOUNT_JSON: string = process.env.SERVICE_ACCOUNT_JSON || ""
const TOKEN_PATH: string = process.env.TOKEN_PATH || "token.json"
const REFRESH_TOKEN: string = process.env.REFRESH_TOKEN || ""
const NODE_ENV: string = process.env.NODE_ENV || "test-refresh-token"
const IMPERSONATE_USER_EMAIL: string = process.env.IMPERSONATE_USER_EMAIL || ""
const STORE_TOKEN: string = process.env.STORE_TOKEN || "false"

export const superAdminsGroupKey: string = process.env.GOOGLE_SUPER_ADMINS || "auth-super-admins@example.com"
export const SCOPES: string[] = [
  "https://www.googleapis.com/auth/admin.directory.group.readonly",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/admin.directory.group.member.readonly",
]

const keys: { client_id: string; client_secret: string; redirect_uris: string[] } = GATEWAY_KEY_PATH
  ? require(GATEWAY_KEY_PATH)
  : null

export let oAuth2Client: any = keys
  ? new google.auth.OAuth2(keys.client_id, keys.client_secret, keys.redirect_uris[0])
  : null

google.options({ auth: oAuth2Client })

/**
 * Open an http server to accept the oauth callback in test environment.
 * In this example, the only request to our webserver is to /sso?code=<code>
 */
const authenticateTestServer = async (scopes: string[]) => {
  return new Promise((resolve, reject) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    })
    const server = http
      .createServer(async (req: any, res: any) => {
        try {
          if (req.url.indexOf("/sso/code") > -1) {
            const qs = new url.URL(req.url, "http://localhost:3000").searchParams
            res.end("Authentication successful! Please return to the console.")
            server.destroy()
            const code = qs.get("code") || ""
            const { tokens } = await oAuth2Client.getToken(code)
            tokens.refresh_token = REFRESH_TOKEN
            oAuth2Client.setCredentials(tokens)
            storeTokensFile(tokens)
            resolve(oAuth2Client)
          }
        } catch (e) {
          reject(e)
        }
      })
      .listen(3000, () => {
        opn(authorizeUrl, { wait: false }).then((cp) => cp.unref())
      })
    destroyer(server)
  })
}

export const authenticate = async (ctx: any) => {
  const { tokens } = await oAuth2Client.getToken(ctx.request.query.code)
  tokens.refresh_token = REFRESH_TOKEN
  oAuth2Client.setCredentials(tokens)
  const userInfo = await getUserInfo(oAuth2Client)
  const jwtClient = await authenticateServiceAccount(SCOPES)
  const authorized = await getGroupMembers(jwtClient, superAdminsGroupKey, userInfo)
  if (authorized?.flat().length > 0) {
    const host = ctx.request.header.host
    const url: URL = new URL(`${host}${ctx.request.url}`)
    const state = url.searchParams.get("state")
    ctx.session = { isAuthenticated: true, id: userInfo.data.id, name: userInfo.data.name }
    if (STORE_TOKEN === "true") {
      try {
        const queryStr = `INSERT INTO tokens(google_id, name, data, session) VALUES('${userInfo.data.id}', '${
          userInfo.data.name
        }', '${JSON.stringify(tokens)}', null)`
        await queryDB(queryStr)
      } catch (e) {
        if (e.message === 'duplicate key value violates unique constraint "tokens_pkey"') {
          console.log(e.message, "updating existing user")
          const queryStr = `UPDATE tokens SET name = '${userInfo.data.name}', data = '${JSON.stringify(
            tokens,
          )}', session = '${JSON.stringify(ctx.session)}' WHERE google_id = '${userInfo.data.id}'`
          await queryDB(queryStr)
        }
      }
    }
    ctx.set("api-gateway-token", tokens.access_token)
    ctx.set("api-gateway-user-id", userInfo.data.id)
    console.log(ctx.origin)
    return ctx.redirect(state)
  } else {
    ctx.status = 403
    return (ctx.body = { status: "error", msg: "unauthorized user, forbidden access" })
  }
}

export const getUserInfo = async (auth: any) => {
  const oauth2 = google.oauth2({
    auth: auth,
    version: "v2",
  })
  return oauth2.userinfo.v2.me.get()
}

export const getGroupMembers = async (auth: any, groupKey: string, userInfo: any) => {
  try {
    const directory = google.admin({ version: "directory_v1", auth: auth })
    const groups = await directory.members.list({ groupKey: groupKey })
    const members: any = groups.data.members?.filter((member: any) => {
      return member.id == userInfo.data.id ? member : false
    })
    if (members && members.length > 0) return members
    const membersList: any = groups.data.members?.map(async (member: any) => {
      const nestedMembersList = await directory.members.list({ groupKey: member.email.toString() })
      const match = nestedMembersList.data.members?.filter((m: any) => {
        return m.id == userInfo.data.id ? m : false
      })
      return match && match.length > 0 ? match : false
    })
    const nestedMatch = await Promise.all(membersList)
    if (nestedMatch[0] && nestedMatch.length > 0) return nestedMatch
  } catch (e) {
    e.message === "Resource Not Found: groupKey" ? console.log(e.message) : console.error(e)
  }
}

export const storeTokensFile = (tokens: any) => {
  fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), (err) => {
    if (err) return console.warn(`Token not stored to ${TOKEN_PATH}`, err)
    console.log(`Token stored to ${TOKEN_PATH}`)
  })
}

export const authenticateServiceAccount = async (scopes: string[]) => {
  return new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_JSON,
    scopes: scopes,
    clientOptions: { subject: IMPERSONATE_USER_EMAIL },
  })
}

export const generateAuthUrl = (state: string | null = null) => {
  return state
    ? oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "select_account",
        scope: SCOPES,
        state: state,
      })
    : oAuth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "select_account",
        scope: SCOPES,
      })
}

const run = async () => {
  if (!fs.existsSync(TOKEN_PATH)) {
    if (NODE_ENV === "test") {
      oAuth2Client = await authenticateTestServer(SCOPES)
    } else {
      const authorizeUrl = generateAuthUrl()
      opn(authorizeUrl, { wait: false }).then((cp) => cp.unref())
    }
  } else if (fs.existsSync(TOKEN_PATH) && NODE_ENV === "test") {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH).toString())
    oAuth2Client.setCredentials(tokens)
  }
}

if (!module.parent) {
  run().catch(console.error)
}
