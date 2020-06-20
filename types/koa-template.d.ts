export = index

declare const index: {
  app: any
  metricsApp: any
  inspectObj?: string
  initApps?: object[]
  getSecret?: Promise<string>
  loadJSON?: object
  pkg?: object
  sortProperties?: object[] | object
}
