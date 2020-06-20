# koa-template

### install package:

```sh
yarn add @mpecarina/koa-template
```

### import and use:

```js
import { app, metricsApp } from "@mpecarina/koa-template"

app.listen(process.env.APP_PORT_0 || 3000)
metricsApp.listen(process.env.APP_PORT_1 || 3001)
```

### static files

static files are served at `"/"` from the directory `"dist/${pkg.name}"` where `pkg.name` is the name value in package.json

### routes.json

optionally create a `routes.json` file. a health check endpoint is enabled for static servers by default when no `routes.json` file is present but can be recreated with additional routes

```json
[
  {
    "name": "health-check",
    "controller": "health-check",
    "version": "v1",
    "description": "",
    "method": ["get"],
    "route": "/ping",
    "handler": "ping",
    "auth": {
      "required": false
    }
  }
]
```

create a function matching the handler value in `routes.json` in the controllers file `controllers/health-check.ts`

```js
export const ping = async (ctx: any) => {
  ctx.body = { msg: "pong" }
}
```
