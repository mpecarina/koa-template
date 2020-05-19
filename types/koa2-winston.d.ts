export const defaultSchemas: {
    info: {
        definitions: {
            req: {};
            res: {};
        };
        properties: {
            duration: {
                type: any;
            };
            level: {
                type: any;
            };
            message: {
                type: any;
            };
            req: {
                $ref: any;
            };
            res: {
                $ref: any;
            };
            started_at: {
                type: any;
            };
        };
        title: string;
        type: string;
    };
    req: {
        properties: {
            URL: {
                type: any;
            };
            body: {
                additionalProperties: any;
                type: any;
            };
            charset: {
                type: any;
            };
            header: {
                additionalProperties: any;
                type: any;
            };
            hostname: {
                type: any;
            };
            href: {
                type: any;
            };
            httpVersion: {
                type: any;
            };
            ip: {
                type: any;
            };
            length: {
                type: any;
            };
            method: {
                type: any;
            };
            origin: {
                type: any;
            };
            originalUrl: {
                type: any;
            };
            path: {
                type: any;
            };
            protocol: {
                type: any;
            };
            query: {
                additionalProperties: any;
                type: any;
            };
            querystring: {
                type: any;
            };
            search: {
                type: any;
            };
            secure: {
                type: any;
            };
            type: {
                type: any;
            };
            url: {
                type: any;
            };
        };
        title: string;
        type: string;
    };
    res: {
        properties: {
            body: {
                additionalProperties: any;
                type: any;
            };
            header: {
                additionalProperties: any;
                type: any;
            };
            status: {
                type: any;
            };
        };
        title: string;
        type: string;
    };
};
export function generateFormat(payload?: any): any;
export function generateSchema(payload?: any): any;
export function getLogLevel(statusCode?: any, defaultLevel?: any): any;
export function logger(payload?: any): any;
