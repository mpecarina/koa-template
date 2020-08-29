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
    - "/path*"
  method:
    - get
    - post
    - put
    - patch
    - delete
    - trace
    - options
  auth:
    sso: true
  proxy:
    enabled: true
    raw: true
    redirect: false
    url: https://postman-echo.com
    filter:
      enabled: true
      find: https://localhost
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
