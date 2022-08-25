import { showToast, showWarn, wrapPromisWithLoading } from "../overlay";
import { MongoCollection } from "../shared";
import { getErrorDesc } from "./meteor";

export interface MongoRemoveOption {
    multi?: boolean | undefined;
    notice?: string;
    loading?: string;
    onlyLocal?: boolean;
}

export function removeMongoItem<T = any>(
    col: MongoCollection<T>,
    se: string,
    op?: MongoRemoveOption
) {
    const options = {
        notice: "删除成功",
        loading: "删除中...",
        ...op,
    };
    const p = new Promise<number>((res, rej) => {
        if (!Meteor.status().connected) {
            showWarn("在线后重试");
            return rej(`不在线`);
        }
        (col.remove as any)(se, (err: any, num: any) => {
            if (options?.notice) {
                err
                    ? showWarn(getErrorDesc(err))
                    : showToast(options?.notice, { color: "success" });
            }
            err ? rej(err) : res(num);
        });
    });
    return options?.loading
        ? wrapPromisWithLoading<string | number>(p, options.loading)
        : p;
}

export interface MongoUpdateOptions {
    multi?: boolean | undefined;
    notice?: string;
    loading?: string;
}

export const updateMongoItem = async <T = any>(
    col: MongoCollection<T>,
    se: string | Mongo.Selector<T> | Mongo.ObjectID,
    up: Mongo.Modifier<T>,
    op?: MongoUpdateOptions
) => {
    if (!Meteor.status().connected) {
        showWarn("在线后重试");
        throw new Error(`not online`);
    }
    const options = {
        notice: "更新成功",
        loading: "更新中...",
        ...op,
    };
    const p = new Promise<number>((res, rej) => {
        col.update(se, up, options, (err: any, num: any) => {
            if (options?.notice) {
                err
                    ? showWarn(getErrorDesc(err))
                    : showToast(options.notice, { color: "success" });
            }
            err ? rej(err) : res(num);
        });
    });
    return options?.loading
        ? wrapPromisWithLoading<string | number>(p, options.loading)
        : p;
};

export const insertMongoItem = async <T = any>(
    col: MongoCollection<T>,
    doc: Mongo.OptionalId<T>,
    opts?: { notice?: string | false; loading?: string }
) => {
    if (!Meteor.status().connected) {
        showWarn("在线后重试");
        throw new Error(`not online`);
    }
    opts = { notice: "新建成功", loading: "更新中...", ...opts };
    const p = new Promise<string>((res, rej) => {
        col.insert(doc as any, (err: any, id: any) => {
            if (opts?.notice) {
                err
                    ? showWarn(getErrorDesc(err))
                    : showToast(opts.notice, { color: "success" });
            }
            err ? rej(err) : res(id);
        });
    });
    return opts?.loading ? wrapPromisWithLoading<string>(p, opts?.loading) : p;
};
