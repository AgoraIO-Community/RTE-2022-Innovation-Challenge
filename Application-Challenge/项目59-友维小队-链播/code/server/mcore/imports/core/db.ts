import { CacheLevel } from "./types";

export const getColName = (name: string) => `ll_${name}`;
export const DBLog = new Mongo.Collection<{
    userId: string;
    col: string;
    db: string;
    _id: string;
    time: Date;
    modifier?: any;
    doc?: any;
    kind: "insert" | "update" | "upsert" | "remove";
}>(getColName("db_logs"));
export class MongoCollection<
    T = any & { _id: string }
> extends Mongo.Collection<T, T> {
    static readonly collections = {} as { [key: string]: MongoCollection };
    static cacher?: {
        added: any;
        removed: any;
        changed: any;
        findOne: any;
        find: any;
        remove: any;
        findAll: (bane?: any) => Promise<any[]>;
        clear: any;
    };
    constructor(
        public readonly name: string,
        public readonly options?: {
            cache?: CacheLevel;
            track?: boolean;
            connection?: any;
            transform?: any;
            refresh?: boolean;
            initFunc?: (col: MongoCollection) => void;
        }
    ) {
        if (MongoCollection.collections[name]) {
            return MongoCollection.collections[name];
        }
        super(name, options);
        if (options?.initFunc) {
            options.initFunc(this);
            delete options.initFunc;
        }
        MongoCollection.collections[name] = this;
        if (Meteor.isClient && options?.cache) {
            const Tracker = (Package as any).tracker.Tracker;
            const valids = new Set<string>();
            const isSoftCache = options.cache === CacheLevel.Soft;
            const isTemp = options.cache === CacheLevel.Temp;
            if (isTemp) {
                let cleared = false;
                Tracker.autorun(() => {
                    const connected = Meteor.status().connected;
                    if (!Meteor.status().connected) {
                        cleared = false;
                    }
                    if (connected && !cleared) {
                        MongoCollection.cacher?.clear(this);
                        cleared = true;
                    }
                });
            } else if (isSoftCache) {
                console.info(`schedule refreshes after reconnect`);
                Tracker.autorun(() => {
                    const connected = Meteor.status().connected;
                    if (valids.size && !Meteor.status().connected) {
                        valids.clear();
                    }
                    if (connected) {
                        console.info(`start refreshes for ${this.name}`);
                    }
                });
            }
            super.find({}).observe({
                added: (doc: any) => {
                    MongoCollection.cacher?.added?.(this, doc);
                },
                removed: (doc: any) => {
                    if (isSoftCache || isTemp) {
                        MongoCollection.cacher?.removed?.(this, doc);
                    }
                },
                changed: (doc: any) => {
                    MongoCollection.cacher?.changed?.(this, doc);
                },
            });
        }
    }
    clearMemo() {
        if (Meteor.isClient) {
            console.info(`clear ${this.name}`);
            (this as any)._collection.remove({}, { multi: true });
        }
    }
    ownBy(_userId: string | null) {
        return false;
    }
}

export class MongoCollectionUser<
    T = any & { _id: string }
> extends MongoCollection {
    constructor(
        base: MongoCollection<T> | string,
        public readonly userId: string
    ) {
        super((typeof base === "string" ? base : base.name) + "_" + userId, {
            initFunc(col) {
                if (Meteor.isServer) {
                    const valid = (uid: string) => userId === uid;
                    col.allow({
                        insert: valid,
                        update: valid,
                        remove: valid,
                    });
                } else {
                    MongoCollection?.cacher?.findAll(this).then((list) => {
                        console.log(`start sync`, list);
                    });
                }
            },
        });
    }
    ownBy(userId: string) {
        return (this as any).userId === userId;
    }
}

export const userSpecCollection = (col: MongoCollection, userId: string) => {
    return new MongoCollection(col.name + "_" + userId, {
        cache: CacheLevel.Hard,
        initFunc: (col: MongoCollection) => {
            if (Meteor.isServer) {
                const valid = (uid: string) => userId === uid;
                col.allow({
                    insert: valid,
                    update: valid,
                    remove: valid,
                });
            } else {
                MongoCollection?.cacher?.findAll().then((list) => {
                    console.log(`start sync`, list);
                });
            }
        },
    });
};
