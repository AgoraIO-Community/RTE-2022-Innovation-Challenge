import { promisefy } from "./utils";

export const fileTool = {
    /**
     * @description 一个解析系统url的通用方法，能够解析类url或者上传文件返回的id
     * @param src 一个url/fileId
     * @param def 默认url，在path为空时使用
     * @returns Promise<string>
     */
    async parseUrlUniverse(src?: string, def = "") {
        if (!src || src.includes("/")) return this.parseUrl(src, def);
        const info = await promisefy(Meteor.call)("/file/info", src);
        if (!info?.path) return "";
        return this.parseUrl(info.path);
    },
    parseUrl(path?: string, def = "", isMeteor = true): string {
        if (!path) {
            if (def) return this.parseUrl(def);
            return def;
        }
        if (
            [
                "http:",
                "https:",
                "blob:",
                "data:",
                "file:",
                "assets",
                "static",
            ].some((key) => path?.startsWith(key))
        ) {
            return path;
        }
        const base = (window as any).__meteor_runtime_config__
            .DDP_DEFAULT_CONNECTION_URL;
        let finalPath = path;
        if (isMeteor) finalPath = base + path;
        return finalPath;
    },
};
