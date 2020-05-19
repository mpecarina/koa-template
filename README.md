# koa-template

### install package:

``` sh
npm i -g yarn
yarn add @mpecarina/koa-template
```

### import and use:
``` js
const { app, metricsApp } = require("@mpecarina/koa-template")

app.listen(process.env.APP_PORT_0 || 3000)
metricsApp.listen(process.env.APP_PORT_1 || 3001)
```

### with typescript:
``` js
import { app, metricsApp } from "@mpecarina/koa-template"
```

### create routes.json in project:
``` json
[
    {
        "name": "example-endpoint",
        "version": "v1",
        "description": "",
        "method": [
            "get",
            "post"
        ],
        "route": "/example",
        "body": {
            "msg": "example route"
        },
        "template": "",
        "auth": {
            "required": false
        }
    }
]
```

``` http://localhost:3000/example ```
``` json
{"msg":"example route"}
```

``` http://localhost:3001/metrics ```
``` ini
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.040445 1556429207673
...
```

### or test with default routes:
``` http://localhost:3000/uri?pretty ```
``` json
{
    "name": "wildcard-route",
    "version": "v1",
    "description": "",
    "method": [
        "get",
        "post",
        "put",
        "patch",
        "delete"
    ],
    "route": "/*",
    "template": "",
    "auth": {
        "required": false
    }
}
```

``` http://localhost:3000/ping ```
``` json
{"msg":"pong"}
```

``` curl -X POST -H "application/json" -d '{"msg": "hello world"}' http://localhost:3000 ```
``` json
{"msg": "hello world"}
```

### directory structure:
``` ini
[bin]
[coverage]
[dist]
[mocks]
[node_modules]
[src]
    [lib]
[test]
    [unit]
    [e2e]
[types]
.dockerignore
.editorconfig
.gitignore
binci.yml
docker-compose.yml
Dockerfile
Jenkinsfile
package.json
routes.json
README.md
tsconfig.json
tslint.json
yarn.lock
```

# development

### set environment variables:
``` ini
NODE_ENV=development
APP_NAME=koa-template
APP_PORT_0=3000
APP_PORT_1=3001
SECRET_KEY=sS3cr3tkK3ySs
```

### getting started:
``` sh
npm i yarn -g
yarn install
yarn dev
```
