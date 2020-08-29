# koa-template

### install package:

```sh
yarn add @mpecarina/koa-template
```

### import and use:

```js
import { initApps, logger, bodyParser, json, koaRouter } from "@mpecarina/koa-template"
import path from "path"

const routes = path.join(__dirname, "./node_modules/@mpecarina/koa-template/dist/controllers")
const controllers = path.join(__dirname, "./node_modules/@mpecarina/koa-template/dist/controllers")

const [app, metricsApp] = initApps([
  logger(),
  bodyParser(),
  json({ pretty: false, param: "pretty", spaces: 2 }),
  koaRouter(routes, controllers),
])

app.listen(process.env.APP_PORT_0 || 3000)
metricsApp.listen(process.env.APP_PORT_1 || 3001)
```

## example proxy routes definition file

## example route for health check controller