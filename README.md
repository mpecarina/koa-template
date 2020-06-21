# koa-template

### install package:

```sh
yarn add @mpecarina/koa-template
```

### import and use:

```js
import { initApps, logger, bodyParser, json, koaRouter } from "@mpecarina/koa-template"
import path from "path"

const routes = path.join(__dirname, "../routes.json")
const controllers = path.join(__dirname, "./controllers")

const [app, metricsApp] = initApps([
  logger(),
  bodyParser(),
  json({ pretty: false, param: "pretty", spaces: 4 }),
  koaRouter(routes, controllers),
])

app.listen(process.env.APP_PORT_0 || 3000)
metricsApp.listen(process.env.APP_PORT_1 || 3001)
```

### serve static files

static files are served at `"/"` from the directory `"dist/${pkg.name}"` where `pkg.name` is the name value in package.json

### create routes.json

a health check endpoint is enabled for static servers by default at `/ping` when no `routes.json` file is present but can be recreated with additional routes by creating a `routes.json` file in the root of your package

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
    "route": "/ping",
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

create a function matching the handler value in `routes.json` in the controllers file `controllers/health-check.ts`

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

curl http://localhost:3000/ping

```sh
{"msg":"pong","status":"success"}
```

curl http://localhost:3000/ping?pretty

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
