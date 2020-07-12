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

const healthControllers = path.join(__dirname, "../node_modules/@mpecarina/koa-template/dist/controllers")
const healthRoutes = path.join(__dirname, "../node_modules/@mpecarina/koa-template/dist/routes.yaml")

const [app, metricsApp] = initApps([
  logger(),
  bodyParser(),
  json({ pretty: false, param: "pretty", spaces: 2 }),
  koaRouter(healthRoutes, healthControllers),
])

app.listen(APP_PORT_0 || 3000)
metricsApp.listen(APP_PORT_1 || 3001)
```

### serve static files

static files are served at the static path `"/"` from the static directory of `"dist/${pkg.name}"` by default. this can be overridden with the environment variables `STATIC_PATH` and `STATIC_DIR`.

```js
/* eslint-disable no-unused-vars */
import { BaseContext } from "koa"

export const ping = async (ctx: BaseContext) => {
  ctx.body = { msg: "pong", status: "success" }
}

export const test = async (ctx: BaseContext) => {
  ctx.body = { msg: "test response", status: "success" }
}
```

curl http://localhost:3000/health/ping

```sh
{"msg":"pong","status":"success"}
```

curl http://localhost:3000/health/ping?pretty

```sh
{
  "msg": "pong",
  "status": "success"
}
```

## access static files

create a static folder and `index.html` file at `static/index.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>static file server</title>
  </head>
  <body>
    <p>serving files at /</p>
  </body>
</html>
```

http://localhost:3000/

http://localhost:3000/index.html

### proxy downstream requests

enable the proxy section for a route in `routes.yaml` and enter the url destination. kibana is an example transparent redirection while the postman example endpoint is set to `redirect: false` and rewrites the string `https://localhost` to `http://localhost:3000` within the url field of the json response body

```yaml

- name: postman-echo
  controller: ""
  proxy:
    filter:
      enabled: true
      find: "https://localhost"
      replace: "http://localhost:3000"
      fields:
        - url
    enabled: true
    redirect: false
    url: https://postman-echo.com
  description: ""
  method:
    - get
  route: "/get:path*"
  handler: ""
  auth:
    sso: false

- name: health-check
  controller: health-check
  version: v1
  proxy:
    enabled: false
    redirect: false
    url: ""
    headers: []
  description: ""
  method:
    - get
  route: "/health/ping"
  handler: ping
  auth:
    ldap: false
    sso: false

- name: test
  controller: health-check
  version: v1
  proxy:
    filter:
      enabled: false
  description: ""
  method:
    - get
  route: "/health/test"
  handler: test
  auth:
    ldap: false
    sso: false

- name: kibana
  controller: ""
  version: v1
  proxy:
    enabled: true
    redirect: true
    url: http://kibana:5601
    headers: []
  description: ""
  method:
    - get
  route: "/kibana"
  handler: ""
  auth:
    ldap: false
    sso: false
```
