import { sleep } from "hjcore";
import { Mongo } from "meteor/mongo";
import { map, Observable } from "rxjs";
import { provide, inject } from "vue";
import { RestError } from "../api";
export { ddpState } from "./meteor";

import {
    ddpState$,
    isSubReady$,
    Mcore,
    MTracker,
    subscribe,
    user$,
    userId$,
} from "./meteor";
import {
    insertMongoItem,
    removeMongoItem,
    updateMongoItem,
} from "./meteor-mongo";
import { ObserableVue, wrapObservale } from "./rxjs-vue";

let currentCounters = 0;
let lastCall = 0;
export const meteor = {
    call<T = any & { error?: RestError }>(
        name: string,
        params?: EJSONable,
        args?: {
            wait?: boolean;
            noRetry?: boolean;
        }
    ) {
        return new Promise<T>(async (resolve, reject) => {
            if (!Meteor.status().connected && args?.noRetry) {
                return reject({
                    code: 100,
                    reason: "请求失败",
                    details: "暂时无法连接网络",
                    message: "暂时无法连接网络，请稍后再试",
                    type: "EONET",
                });
            }
            const gap = Date.now() - lastCall;
            console.warn(`${name}= ${gap}`);
            lastCall = Date.now();
            if (!Meteor.userId()) {
                const wt = (currentCounters * (200 - gap)) / 1000;
                if (wt > 0.005) {
                    await sleep(wt);
                    console.error(`wait call ${wt}`);
                }
            } else {
                const wt = (currentCounters * (100 - gap)) / 1000;
                if (wt > 0.005) {
                    await sleep(wt);
                    console.error(`wait call ${wt}`);
                }
            }
            console.info(`current call out ${++currentCounters}`);
            Mcore.apply(
                name,
                params === undefined ? [] : [params],
                args,
                (err, res) => {
                    currentCounters--;
                    if (err) {
                        const e = {
                            code: 100 as string | number,
                            reason: "请求失败",
                            details: err.cause || (err as any).details,
                            message: err.message,
                            type: (err as any).errorType || "UNKNOW_TYPE",
                        };
                        if ((err as any)?.errorType === "Meteor.Error") {
                            e.code = (err as any).error;
                            e.reason = (err as any).reason || "未知原因";
                            e.details = (err as any).details || "";
                        }
                        return reject(e);
                    }
                    resolve(res as any);
                }
            );
        });
    },
    cursorToObservable$<T = any>(cursor: Mongo.Cursor<T, T>) {
        return new Observable<T[]>((suber) => {
            const t = MTracker.autorun(() => {
                suber.next(cursor.fetch());
            });
            return () => {
                t.stop();
            };
        });
    },
    wrapCursor$<T = any>(cursor: Mongo.Cursor<T, T>) {
        return new ObserableVue(
            new Observable<T[]>((suber) => {
                const t = MTracker.autorun(() => {
                    suber.next(cursor.fetch());
                });
                return () => {
                    t.stop();
                };
            })
        );
    },
    wrapObservale$<T = any>(ob: Observable<T>) {
        return new ObserableVue(ob);
    },
    watchCursor$<T = any>(cursor: Mongo.Cursor<T>) {
        return new Observable<{ added?: T; removed?: T; changed?: T }>(
            (suber) => {
                const t = cursor.observe({
                    added(doc) {
                        suber.next({
                            added: doc,
                        });
                    },
                    changed(doc) {
                        suber.next({
                            changed: doc,
                        });
                    },
                    removed(doc) {
                        suber.next({
                            removed: doc,
                        });
                    },
                });
                return () => t.stop();
            }
        );
    },
    connect(url: string) {
        (Meteor as any).reconnect({ url });
    },
    subscribe$(name: string, args?: any, o?: { only?: boolean }) {
        return wrapObservale<boolean>(
            new Observable((suber) => {
                const { stop, ready$ } = subscribe(name, [args], o);
                ready$().subscribe((ok) => {
                    suber.next(ok);
                });
                return () => {
                    stop();
                };
            })
        );
    },
    currentUser$: user$,
    userId$: userId$,
    userInfo$(userId?: string) {
        if (!userId) {
            return this.wrapObservale$(user$).pipe(map((v) => v?.profile));
        }
        return this.wrapCursor$(Meteor.users.find({ _id: userId })).map(
            (v) => v[0]?.profile
        );
    },
    insert: insertMongoItem,
    remove: removeMongoItem,
    update: updateMongoItem,
    isReady$() {
        return this.wrapObservale$(isSubReady$("user.logined"));
    },
    status$: ddpState$,
    userId() {
        return Meteor.userId();
    },
};

export const setupMeteor = () => {
    provide("meteor-api", meteor);
};

export const useMeteor = () => {
    return inject("meteor-api") as typeof meteor;
};

export type MeteorApi = typeof meteor;
