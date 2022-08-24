import { ApiLink } from "../types";

export type RoutePlugin = (
    this: Meteor.MethodThisType,
    req: { query: any; body: any; path: string; config?: any },
    res: {
        data: (e: any) => void;
        error: (e: any | Meteor.Error | undefined) => void;
    },
    pluginConfig?: any
) => Promise<any[] | void> | void;

type ResponseUnit = string | any | any[] | void;
type Respone = {
    data: (e: any & { links?: ApiLink[] }) => Respone;
    error: (e: any | Meteor.Error | undefined) => void;
    link: (e: ApiLink[] | ApiLink) => Respone;
};
export type RouteHandler = (
    this: Meteor.MethodThisType,
    req: { query: any; body: any; path: string },
    res: Respone
) => Promise<ResponseUnit> | ResponseUnit;

const runHandlerWithPlugins = async (
    path: string,
    data: any,
    fh: { handler: any; conf: any },
    plugins: Array<{ p: RoutePlugin; c?: any }>,
    ctx: any
) => {
    const req = {} as any;
    console.log({ path, data });
    req.path = path;
    req.config = fh.conf;
    req.body = data?.body;
    req.query = data.query ?? {};
    let respData = undefined as any;
    let respLinks = [] as ApiLink[];
    const res: Respone = {
        data(e: any) {
            respData = e;
            return res;
        },
        error(err: string | number | Meteor.Error | undefined, code?: number) {
            if (err instanceof Meteor.Error) {
                throw err;
            }
            code = typeof err === "number" ? err : code || 500;
            throw new Meteor.Error(
                code,
                typeof err === "string" ? err : "出现错误"
            );
        },
        link(link: ApiLink | ApiLink[]) {
            if (Array.isArray(link)) {
                link.forEach((el) => this.link(el));
                return this;
            }
            if (
                !respLinks.find(
                    (el) =>
                        el.rel === link.rel &&
                        el.url === link.url &&
                        el.method === link.method
                )
            ) {
                link.rel = link.rel || "default";
                respLinks.push(link);
            }
            return res;
        },
    };
    const getRespData = () => {
        const d = { _links: respLinks, ...respData };
        console.log(`${path} resp`);
        console.log(d);
        return d;
    };
    for (const p of plugins.filter((el) => el?.c?.phase !== 1)) {
        try {
            await p.p.call(ctx, req, res, p.c);
            if (respData !== undefined) {
                return getRespData();
            }
        } catch (error) {
            throw error;
        }
    }
    try {
        const hr = await fh.handler.call(ctx, req, res);
        if (hr !== undefined) {
            respData = hr;
        }
    } catch (error: any) {
        if (error instanceof Meteor.Error) {
            throw error;
        }
        if (error?.message?.includes("Maximum call stack size exceeded")) {
            console.error(`${path} 存在代码错误`);
        }
        console.error(error);
        throw new Meteor.Error(500, `服务[${path}]暂不可用`);
    }
    for (const p of plugins.filter((el) => el?.c?.phase === 2)) {
        try {
            await p.p.call(ctx, req, res, p.c);
        } catch (error) {
            throw error;
        }
    }
    return getRespData();
};

export const route = (
    path: string,
    baseConf?: any,
    plugins = [] as Array<{ p: RoutePlugin; c?: any }>
) => {
    const mark = {
        get: 0,
        put: 0,
        del: 0,
        post: 0,
    };
    const conf = {
        get(handler: RouteHandler, conf?: any) {
            if (mark.get) {
                return this;
            }
            mark.get = 1;
            conf = Object.freeze({ ...baseConf, ...conf });
            Meteor.methods({
                [`GET.${path}`]: async function (data = {} as any) {
                    console.log(`GET.${path}   @`);
                    return runHandlerWithPlugins(
                        path,
                        data,
                        { handler, conf: { ...baseConf, conf } },
                        plugins,
                        this
                    );
                },
            });
            return this;
        },
        post(handler: RouteHandler, conf?: any) {
            if (mark.post) {
                return this;
            }
            mark.post = 1;
            conf = Object.freeze({ ...baseConf, ...conf });
            Meteor.methods({
                [`POST.${path}`]: async function (data = {} as any) {
                    console.log(`POST.${path}   @`);
                    return runHandlerWithPlugins(
                        path,
                        data,
                        { handler, conf: { ...baseConf, conf } },
                        plugins,
                        this
                    );
                },
            });
            return this;
        },
        delete(handler: RouteHandler, conf?: any) {
            if (mark.del) {
                return this;
            }
            mark.del = 1;
            conf = Object.freeze({ ...baseConf, ...conf });
            Meteor.methods({
                [`DELETE.${path}`]: async function (data = {} as any) {
                    console.log(`DELETE.${path}   @`);
                    return runHandlerWithPlugins(
                        path,
                        data,
                        { handler, conf: { ...baseConf, conf } },
                        plugins,
                        this
                    );
                },
            });
            return this;
        },
        put(handler: RouteHandler, conf?: any) {
            if (mark.put) {
                return this;
            }
            mark.put = 1;
            conf = Object.freeze({ ...baseConf, ...conf });
            Meteor.methods({
                [`PUT.${path}`]: async function (data = {} as any) {
                    console.log(`PUT.${path}   @`);
                    return runHandlerWithPlugins(
                        path,
                        data,
                        { handler, conf: { ...baseConf, conf } },
                        plugins,
                        this
                    );
                },
            });
            return this;
        },
        use(p: RoutePlugin, c?: any) {
            plugins.push({ p, c });
            return this;
        },
        sub(subpath: string) {
            return route(path + "/" + subpath, baseConf, plugins.slice(0));
        },
    };
    return conf;
};
