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

create a `routes.json` file with an example health check endpoint (this route is enabled for static servers by default when no `routes.json` file is present)

```json
[
  {
    "name": "health-check",
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

create a controllers directory in the application `src` folder

create a route handler function in the controller file `controllers/health-check.ts`

```js
export const ping = async (ctx: any) => {
  ctx.body = { msg: "pong" }
}
```
