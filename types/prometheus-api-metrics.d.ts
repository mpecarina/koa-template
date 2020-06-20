export = index
declare function index(options?: any): any
declare namespace index {
  class HttpMetricsCollector {
    static collect(res: any): void
    static init(options?: any): void
    constructor(options?: any)
    southboundResponseTimeHistogram: any
    southboundClientErrors: any
    collect(res: any): void
  }
  function expressMiddleware(payload?: any): any
  function koaMiddleware(payload?: any): any
}
