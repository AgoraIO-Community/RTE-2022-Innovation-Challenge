import { Storage, Drivers } from "@ionic/storage";
import { BehaviorSubject, firstValueFrom, Observable } from "rxjs";

class LTSStorage {
    static stores = new Map<string, LTSStorage>();
    store!: Storage;
    ready$$ = new BehaviorSubject(false);
    constructor(public readonly name: string) {
        if (LTSStorage.stores.has(name)) {
            return LTSStorage.stores.get(name)!;
        }
        LTSStorage.stores.set(name, this);
        this.store = new Storage({
            name,
            driverOrder: [
                Drivers.IndexedDB,
                Drivers.SecureStorage,
                Drivers.LocalStorage,
            ],
        });
        this.store.create().then(() => this.ready$$.next(true));
    }
    public get$<T = any>(key: string, def?: T) {
        return new Observable<T>((suber) => {
            return this.ready$$.subscribe((v) => {
                if (v) {
                    this.store
                        .get(key)
                        .then((val) => {
                            try {
                                if (val === null) {
                                    suber.next(undefined);
                                } else if (typeof val === "string") {
                                    suber.next(JSON.parse(val));
                                } else {
                                    suber.next(val);
                                }
                            } catch (error) {
                                def !== undefined ? suber.next(def) : suber.error(error);
                            }
                        })
                        .catch((err) => suber.error(err));
                }
            });
        });
    }
    public async get<T = any>(key: string, def?: T) {
        return await firstValueFrom(this.get$(key, def));
    }
    public set$<T = any>(key: string, val: T) {
        return new Observable<T>((suber) => {
            return this.ready$$.subscribe((v) => {
                if (v) {
                    this.store
                        .set(key, val instanceof Blob ? val : JSON.stringify(val))
                        .then((val) => {
                            try {
                                suber.next(val);
                            } catch (error) {
                                suber.error(error);
                            }
                        })
                        .catch((err) => suber.error(err));
                }
            });
        });
    }
    public async set<T = any>(key: string, val: T) {
        return await firstValueFrom(this.set$<T>(key, val));
    }
    public keys$() {
        return new Observable<string[]>((suber) => {
            return this.ready$$.subscribe((v) => {
                if (v) {
                    this.store
                        .keys()
                        .then((keys) => {
                            try {
                                suber.next(keys);
                            } catch (error) {
                                suber.error(error);
                            }
                        })
                        .catch((err) => suber.error(err));
                }
            });
        });
    }
    public async keys() {
        return await firstValueFrom(this.keys$());
    }
    public del$(key: string) {
        return new Observable((suber) => {
            return this.ready$$.subscribe((v) => {
                if (v) {
                    this.store
                        .remove(key)
                        .then((val) => {
                            try {
                                suber.next(val);
                            } catch (error) {
                                suber.error(error);
                            }
                        })
                        .catch((err) => suber.error(err));
                }
            });
        });
    }
    public async del(key: string) {
        return await firstValueFrom(this.del$(key));
    }
    public clear() {
        this.store.clear();
    }
}

export const sharedStorage = new LTSStorage("shared");

export const useStorage = (name: string) => {
    return new LTSStorage(name);
};
