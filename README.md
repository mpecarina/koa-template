# koa-template

### install package:

```sh
yarn add @mpecarina/koa-template
```

### import and use:

```js
import { initApps, logger, bodyParser, json, koaRouter } from "@mpecarina/koa-template"
import path from "path"

const { NODE_ENV, APP_PORT_0, APP_PORT_1 } = process.env
const postmanProxyRoutes = path.join(__dirname, `../service_definitions/postman-echo-routes-${NODE_ENV}.yaml`)

const [app, metricsApp] = initApps([
  logger(),
  bodyParser(),
  json({ pretty: false, param: "pretty", spaces: 2 }),
  koaRouter(postmanProxyRoutes),
])

app.listen(APP_PORT_0 || 3000)
metricsApp.listen(APP_PORT_1 || 3001)
```

## example postman echo proxy routes definition

`service_definitions/postman-echo-routes-test.yaml`

```yaml
- name: postman-echo
  origin:
    - localhost
    - "localhost:3000"
  description: ""
  controller: ""
  handler: ""
  routes:
    - "/:path*"
  method:
    - get
    - post
    - put
    - patch
    - delete
    - trace
    - options
  auth:
    sso: false
  proxy:
    enabled: true
    raw: true
    redirect: false
    url: https://postman-echo.com
    filter:
      enabled: true
      find: https://postman-echo.com
      replace: http://localhost:3000
      fields:
        - url
```

## default handler function used in health check service

`src/controllers/health-check.ts`

```js
import { BaseContext } from "koa"

export const ping = async (ctx: BaseContext) => {
  ctx.status = 200
  ctx.body = { status: "success", msg: "pong" }
}
```

## call the postman echo proxy route

http://localhost:3000/get?foo=bar

```sh
{"args":{"foo":"bar"},"headers":{"x-forwarded-proto":"https","x-forwarded-port":"443","host":"postman-echo.com","x-amzn-trace-id":"Root=1-5f4aaefe-fd51ab6c267499c8a63b245c","accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9","cache-control":"max-age=0","upgrade-insecure-requests":"1","user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36","sec-fetch-site":"none","sec-fetch-mode":"navigate","sec-fetch-user":"?1","sec-fetch-dest":"document","accept-encoding":"gzip, deflate, br","accept-language":"en-US,en;q=0.9","cookie":"_ga=GA1.1.54043150.1593003926; hubspotutk=5a444a8d8277c6687ed5d5f5b3ce1663; __hstc=181257784.5a444a8d8277c6687ed5d5f5b3ce1663.1597153074511.1597153074511.1597167095022.2","api-gateway-request-id":"dbe75cd4-cf19-455f-83c5-69803d61d8c9"},"url":"http://localhost:3000/get?foo=bar"}
```

## call the health check route

```sh
curl http://localhost:3000/health/ping
```

```sh
{"status":"success","msg":"pong"}
```
