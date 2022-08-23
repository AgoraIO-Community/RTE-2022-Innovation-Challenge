import { Mongo as MG } from "meteor/mongo";
import { Tracker as TA } from "meteor/tracker";

const Package = (window as any).Package;

import { EJSON as E } from "meteor/ejson";

import { DDP as MDDP } from "meteor/ddp";
import { reactive } from "vue";
import {
    BehaviorSubject,
    Observable,
    Subject,
    throttleTime,
    distinctUntilChanged,
} from "rxjs";
import { AppConfig, DEVICE_ID_KEY } from "../../config";
import { hashString } from "../utils";
import { useExecTree } from "../ExecTree";
import { isPlatform } from "@ionic/vue";
import { Capacitor } from "@capacitor/core";

export const Mcore = (Package as any).meteor.Meteor as typeof Meteor;

export const EJSON = (Package as any).ejson.EJSON as typeof E;

export const onReady = (cb: () => void) => Mcore.startup(cb);

export const MTracker = (Package as any).tracker.Tracker as typeof TA;

export const MMongo = (Package as any).mongo.Mongo as typeof MG;

export const randomString = (len = 12) => {
    return (Package as any).random.Random.hexString(len);
};
const urls: string[] = AppConfig.ddpUrls;

let resolve: any = null;
let testing = false;
const connectTest = async function () {
    testing = true;
    console.info("retry start ---  ");
    try {
        for (const url of urls) {
            console.info(`retry ${url}`);
            Mcore.disconnect();
            const ok = await new Promise((res) => {
                resolve = res;
                (Mcore as any).reconnect({ url });
            });
            if (ok) {
                (
                    window as any
                ).__meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = url;
                localStorage.setItem(ddpUrlSaveKey, url);
                break;
            }
        }
    } catch (error) {
        console.error(error);
    }
    console.info(`retry end --- ${localStorage.getItem("success-url")} `);
    testing = false;
};
export const ddpState = reactive({
    connected: false,
    status: "connecting" as MDDP.Status,
    inited: false,
    tried: false,
    booted: false,
});
const reconnectSub = new Subject();
const ddpUrlSaveKey = "def-ddp-url";
reconnectSub.pipe(throttleTime(3000)).subscribe(() => connectTest());


window.onerror = (err) => console.warn(err);
const ddp$$ = new BehaviorSubject({ connected: false, status: "waiting" });
export const ddpState$ = ddp$$.asObservable();
interface SubDesc {
    count: number;
    sub: Meteor.SubscriptionHandle;
    state: 0 | 1 | 2;
    name: string;
    conf: any;
}
const subscribes = new Map<string, SubDesc>();
const sChange = new Subject<string>();
export const isSubReady$ = (name: string) =>
    new Observable<boolean>((suber) => {
        const s = subscribes.get(name);
        if (s?.state === 1) {
            suber.next(true);
        }
        suber.add(
            sChange.subscribe((n) => {
                if (n === name) {
                    setTimeout(() => {
                        suber.next(subscribes.get(name)?.state === 1);
                    }, 10);
                }
            })
        );
    }).pipe(distinctUntilChanged());
export const subscribe = (
    name: string,
    args: any[],
    opts?: { only?: boolean }
) => {
    let handler: any;
    let key = name;
    const sameName = Array.from(subscribes.values()).find(
        (el) => el.name === name
    );
    let hasError = false;
    if (opts?.only) {
        handler = subscribes.get(name)!;
        key = name;
        hasError = !!sameName;
    }
    else if (sameName?.conf?.only) {
        hasError = true;
    } else {
        key = hashString(name + JSON.stringify(args));
        handler = subscribes.get(key);
    }
    if (hasError) {
        throw new Error(`${name} is already subscribed and not only`);
    }
    console.log("mhash", handler, args);
    if (!handler) {
        const s = Mcore.subscribe(name, ...args, {
            onStop() {
                handler.state = 0;
                subscribes.delete(key);
                console.log(`${name}-sub - stopped`);
                sChange.next(name);
            },
            onReady() {
                handler.state = 1;
                console.log(`${name}-sub - ready`);
                sChange.next(name);
            },
        });
        handler = { count: 1, sub: s, state: 2, name, conf: opts };
        subscribes.set(key, handler);
        console.log(subscribes);
        console.log(`subscribe ${name}`);
    } else {
        handler.count++;
        console.log(`subscribe reuse ${name}`);
    }
    return {
        stop: () => {
            if (handler.state === 0)
                return console.error("存在订阅闭包在订阅取消后");
            handler.count--;
            if (handler.count === 0) {
                handler.sub.stop();
            }
        },
        ready() {
            return handler.sub.ready();
        },
        ready$(once = true) {
            return new Observable<boolean>((suber) => {
                if (handler.state === 0) return suber.error("订阅已经取消了");
                if (handler.state === 1) {
                    suber.next(true);
                    once && suber.complete();
                    return;
                }
                const t = MTracker.autorun(() => {
                    if (handler.sub.ready()) {
                        suber.next(true);
                        once && suber.complete();
                    } else if (handler.state === 0) {
                        suber.complete();
                    }
                });
                return () => t.stop();
            });
        },
    };
};

subscribe(
    "connected",
    [
        {
            isNative: Capacitor.isNativePlatform(),
            platform: Capacitor.getPlatform(),
        },
    ],
    { only: true }
);

export const isSubscribed = (name: string, args?: any[]): boolean => {
    const mhash = hashString(name + JSON.stringify(args));
    return Object.entries(subscribes).some(([hash, val]) => {
        if (args ? mhash === hash : val.name === name) {
            return val.state === 1;
        }
    });
};

export const callDDPMethod = (name: string, args: any[], opts?: any) => {
    return new Promise((resolve, reject) => {
        Mcore.apply(name, args, opts, (err, res) => {
            err ? reject(err) : resolve(res);
        });
    });
};

MTracker.autorun(() => {
    const state = Mcore.status();
    let result = false;
    if (state.status === "connecting") {
        ddpState.tried = true;
    }
    const status = state.status;
    ddpState.status = status;
    const needRetry =
        status === "waiting" || status === "failed" || status === "offline";
    const retryEnd = needRetry || status === "connected";
    if (state.status === "connected") {
        ddpState.connected = true;
        ddpState.booted = true;
        result = true;
    }
    if (resolve) {
        if (retryEnd && ddpState.tried) {
            console.info(`resolve result ${result}`);
            resolve(result);
            resolve = null;
            ddpState.tried = false;
        }
    } else if (!testing && ddpState.inited && !result && state.retryCount > 2) {
        reconnectSub.next(true);
    }
    ddp$$.next({
        connected: state.status === "connected",
        status: state.status,
    });
});

export const parseUFSURL = (url: string) => {
    const base = localStorage.getItem(ddpUrlSaveKey);
    return base + url;
};

export const getErrorDesc = (err: any, def = "错误发生了！") => {
    if (!err) return def;
    if (typeof err == "string") return err;
    return (
        err.reason ||
        err.message ||
        err.datails ||
        err?.find((el: any) => typeof el == "string") ||
        def
    );
};

const user$$ = new BehaviorSubject<Meteor.User | null>(null);
export const user$ = user$$.pipe(distinctUntilChanged());
const userId$$ = new BehaviorSubject(Meteor.userId());
export const userId$ = userId$$.pipe(distinctUntilChanged());
if (!localStorage.getItem(DEVICE_ID_KEY)) {
    let type = "unknown";
    if (Capacitor.isNativePlatform()) {
        type = "native";
    } else if (isPlatform("mobile")) {
        type = "mobile";
    } else if (isPlatform("desktop")) {
        type = "desktop";
    } else if (isPlatform("tablet")) {
        type = "tablet";
    }
    const type2 = isPlatform("android")
        ? "android"
        : isPlatform("ios")
        ? "ios"
        : "win+";

    localStorage.setItem(
        DEVICE_ID_KEY,
        `${type}-${type2}-${Date.now()}-${navigator.language}-${randomString(
            10
        )}`
    );
}
const tree = useExecTree("logined", false);

MTracker.autorun(() => {
    userId$$.next(Meteor.userId());
    user$$.next(Meteor.user());
});

Accounts.onLogin((e: any) => {
    Accounts.logoutOtherClients(() => {
        // after successfully setup
        const s = subscribe(
            "user.logined",
            [
                {
                    deviceId: localStorage.getItem(DEVICE_ID_KEY),
                    // cachedAt,
                    timestamp: Date.now(),
                },
            ],
            { only: true }
        );
        tree.add(() => s.stop());
    });
});
