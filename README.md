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

static files are served at `"/"` from the directory `"dist/${pkg.name}"` where `pkg.name` is the name value in package.json. in this example we override to the root of our repo in the `static` folder

### create routes.json

a health check endpoint is enabled for static servers by default at `/health/ping` when no `routes.json` file is present but can be recreated with additional routes by creating a `routes.json` file in the root of your package

```json
[
  {
    "name": "health-check",
    "controller": "health-check",
    "version": "v1",
    "proxy": {
      "enabled": false,
      "redirect": false,
      "url": "",
      "headers": []
    },
    "description": "",
    "method": ["get"],
    "route": "/health/ping",
    "handler": "ping",
    "auth": {
      "ldap": false,
      "sso": false
    }
  },
  {
    "name": "test",
    "controller": "health-check",
    "version": "v1",
    "proxy": {
      "enabled": false,
      "redirect": false,
      "url": "",
      "headers": []
    },
    "description": "",
    "method": ["get"],
    "route": "/test",
    "handler": "test",
    "auth": {
      "ldap": false,
      "sso": false
    }
  }
]
```

create a function matching the controller and handler values in `routes.json`. for this example bother handlers are in the controllers file `controllers/health-check.ts`

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

### proxy downstream requests

enable the proxy section for a route in `routes.json` and enter the url destination. kibana is an example transparent redirection while the postman example endpoint is set to `redirect: false`

```json
[
  {
    "name": "kibana",
    "controller": "",
    "version": "v1",
    "proxy": {
      "enabled": true,
      "redirect": true,
      "url": "http://kibana:5601",
      "headers": []
    },
    "description": "",
    "method": ["get"],
    "route": "/kibana",
    "handler": "",
    "auth": {
      "ldap": false,
      "sso": false
    }
  },
  {
    "name": "postman",
    "controller": "",
    "version": "v1",
    "proxy": {
      "enabled": true,
      "redirect": false,
      "url": "https://postman-echo.com/get?foo1=bar1&foo2=bar2",
      "headers": []
    },
    "description": "",
    "method": ["get"],
    "route": "/postman",
    "handler": "",
    "auth": {
      "ldap": false,
      "sso": false
    }
  }
]
```

### proxy downstream requests

enable the proxy section for a route in `routes.json` and enter the url destination. kibana is an example transparent redirection while the postman example endpoint is set to `redirect: false`

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

## koa-template also supports yaml

optionally create routes in yaml file `routes.yaml` or `routes.yml`

```yaml
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
    enabled: false
    redirect: false
    url: ""
    headers: []
  description: ""
  method:
    - get
  route: "/test"
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

- name: postman
  controller: ""
  version: v1
  proxy:
    enabled: true
    redirect: false
    url: https://postman-echo.com/get?foo1=bar1&foo2=bar2
    headers: []
  description: ""
  method:
    - get
  route: "/postman"
  handler: ""
  auth:
    ldap: false
    sso: false
```
