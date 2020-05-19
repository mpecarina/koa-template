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
VAULT_ROOT_TOKEN=token
VAULT_ADDR=localhost
SECRET_KEY=sS3cr3tkK3ySs
```

### getting started:
``` sh
npm i yarn -g
yarn install
yarn dev
```

### run with docker-compose:
``` sh
docker-compose up
docker-compose down
```

```sh
docker-compose run nodejs yarn mock && yarn test

Starting koa-template_vault_1 ... done
yarn run v1.15.2
$ ./bin/mock-vault.js
{
  request_id: '5b4e9d6a-1b90-fa2c-e4a4-eec6a47c39cf',
  lease_id: '',
  renewable: false,
  lease_duration: 0,
  data: { value: 'sS3cr3tkK3ySs' },
  wrap_info: null,
  warnings: null,
  auth: null
}
Done in 1.24s.
yarn run v1.15.2
$ jest test/unit --verbose --passWithNoTests
No tests found, exiting with code 1
Run with `--passWithNoTests` to exit with code 0
In /Users/mpecarina/koa-template
  18 files checked.
  testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x) - 0 matches
  testPathIgnorePatterns: /node_modules/ - 18 matches
  testRegex:  - 0 matches
Pattern: test/unit - 0 matches
  Done in 1.50s.
```

### rebuild docker image:
```sh
docker-compose up --build --force-recreate
```

### watch mode with nodemon:
```sh
~/mpecarina/ git clone https://github.com/mpecarina/koa-template.git
~/mpecarina/ cd koa-template
~/mpecarina/koa-template/ [master] docker-compose up
Recreating koa-template_nodejs_1 ... done
Attaching to koa-template_nodejs_1
nodejs_1  | yarn run v1.10.1
nodejs_1  | $ nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/index.ts
nodejs_1  | [nodemon] 1.18.11
nodejs_1  | [nodemon] to restart at any time, enter `rs`
nodejs_1  | [nodemon] watching: src/**/*.ts
nodejs_1  | [nodemon] starting `ts-node src/index.ts`
```

### remove all exited containers:
```sh
docker rm $(docker ps -a -f status=exited -q)
```

### force delete all images:
```sh
docker rmi -f $(docker images -a -q)
```

### run scripts with binci:
```sh
~/mpecarina/koa-template/ [master] binci dev       
✔ Starting service vault
✔ Running Task
‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧‧
fetch http://dl-cdn.alpinelinux.org/alpine/v3.9/main/x86_64/APKINDEX.tar.gz
fetch http://dl-cdn.alpinelinux.org/alpine/v3.9/community/x86_64/APKINDEX.tar.gz
v3.9.3-27-g287dc987d0 [http://dl-cdn.alpinelinux.org/alpine/v3.9/main]
v3.9.3-26-g0711692c66 [http://dl-cdn.alpinelinux.org/alpine/v3.9/community]
OK: 9754 distinct packages available
(1/1) Installing unzip (6.0-r4)
Executing busybox-1.29.3-r10.trigger
OK: 7 MiB in 17 packages
Connecting to releases.hashicorp.com (151.101.129.183:443)
vault_0.9.3_linux_am 100% |************************************************************************************************************************************************| 17.3M  0:00:00 ETA
Archive:  vault_0.9.3_linux_amd64.zip
  inflating: /usr/local/bin/vault    
yarn config v1.15.2
success Set "cache-folder" to "./.yarn-cache".
Done in 0.08s.
yarn run v1.15.2
$ rm -rf dist/ && tsc
Done in 5.21s.
yarn run v1.15.2
$ ./bin/mock-vault-data.sh
Success! Enabled the transit secrets engine at: transit/
Success! Data written to: cubbyhole/secret
Done in 0.29s.
yarn run v1.15.2
$ nodemon --watch 'src/**/*.ts' --exec 'ts-node' src/index.ts
[nodemon] 1.18.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching: src/**/*.ts
[nodemon] starting `ts-node src/index.ts`

~/mpecarina/koa-template/ [master] binci --cleanup
  Stopping 1 containers:
  bc_vault_mrZXBuoEh
```
