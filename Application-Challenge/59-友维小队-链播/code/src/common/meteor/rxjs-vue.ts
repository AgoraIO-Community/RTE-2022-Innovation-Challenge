import {
    auditTime,
    debounceTime,
    distinctUntilChanged,
    filter,
    firstValueFrom,
    map,
    Observable,
    Observer,
    OperatorFunction,
    share,
    shareReplay,
    take,
    tap,
    throttleTime,
    timeout,
} from "rxjs";
import {
    getCurrentInstance,
    onUnmounted,
    reactive,
    Ref,
    ref,
    shallowReactive,
    shallowRef,
} from "vue";
import { looksEqual, Endable, clearObjectProps } from "../utils";

export class ObservableChainable<T = any> extends Endable {
    protected finalOb: Observable<T>;
    constructor(
        private ob: Observable<T>,
        protected option: any,
        private pipes: any[] = []
    ) {
        super();
        if (option instanceof Set) {
            this.clears = option;
        }
        this.finalOb = ob;
    }
    public subscribe(observer: Partial<Observer<T>> | ((value: T) => void)) {
        return this.addEnder(this.finalOb.subscribe(observer as any));
    }
    public unwrap() {
        return this.finalOb;
    }
    protected addPipe<D = T>(...args: any[]) {
        this.pipes.push(...args);
        this.finalOb = (this.ob as any).pipe(...this.pipes);
        return this as any as ObserableVue<D>;
    }
    public tap(c: (a: T) => any) {
        return this.addPipe(tap(c));
    }
    public map<D = any>(d: (d: T) => D, skipUndefined = false) {
        const pipes = [map(d)];
        skipUndefined &&
            pipes.unshift(
                filter(
                    (v: T) => v !== null && v !== undefined && !Number.isNaN(v)
                ) as any
            );
        return this.addPipe<D>(...pipes);
    }
    public clone() {
        return new ObservableChainable<T>(this.finalOb, this.clears);
    }
    public debounce(ms: number) {
        return this.addPipe(debounceTime(ms));
    }
    public audit(s: number) {
        return this.addPipe(auditTime(s));
    }
    public throttle(s: number) {
        return this.addPipe(throttleTime(s));
    }
    public filter<D = T>(c: (d: T) => boolean) {
        return this.addPipe<D>(filter(c));
    }
    public pipe<D = T>(c: OperatorFunction<T, D>) {
        return this.addPipe<D>(c);
    }
    public toPromise(t?: number) {
        return firstValueFrom(t ? this.finalOb.pipe(timeout(t)) : this.finalOb);
    }
    public ifChanged(judger = (p: T, c: T) => looksEqual(p, c)) {
        return this.addPipe(distinctUntilChanged(judger));
    }
    public first() {
        return this.map<(T extends Array<infer U> ? U : T) | undefined>((v) =>
            Array.isArray(v) ? v[0] : v
        );
    }
    public defined() {
        return this.filter<Exclude<T, undefined>>(
            (v) => v !== null && v !== undefined
        );
    }
    public one() {
        return this.addPipe(take(1));
    }
}

/**
 * (￣y▽￣)╭ Ohohoho..... observable -> vue 的魔术对象
 */
export class ObserableVue<T = any> extends ObservableChainable<T> {
    constructor(
        ob: Observable<T>,
        option: any | boolean = true,
        pipes: any[] = []
    ) {
        super(ob, option, pipes);
    }
    private binded = false;
    private bindClear() {
        if (this.option === true && !this.binded) {
            if (getCurrentInstance()) {
                onUnmounted(() => {
                    this.end();
                    this.binded = false;
                });
            }
        }
        this.binded = true;
    }
    public ref<D = T>(op?: {
        def?: D;
        key?: keyof D;
        shallow?: boolean;
        keepUnexistKey?: boolean;
    }) {
        this.bindClear();
        const container =
            typeof op?.def === "object"
                ? op.def
                : op?.shallow
                ? (shallowReactive({}) as any)
                : (reactive({}) as D);
        const cancel = this.subscribe(((v: T) => {
            if (op?.key) {
                assignMemo(container, op.key, v);
            } else if (v === undefined || v === null) {
                clearObjectProps(container);
                (container as any)!.cancel = cancel;
            } else if (typeof v === "object") {
                const okeys = new Set(Object.keys(container!));
                okeys.delete("cancel");
                for (const key of Object.keys(v)) {
                    okeys.delete(key);
                    assignMemo(container, key, v[key as keyof T]);
                }
                if (!op?.keepUnexistKey) {
                    okeys.forEach((key) => delete (container as any)![key]);
                }
            } else {
                (container as any).value = v;
            }
        }) as any);
        Object.defineProperty(container, "cancel", {
            enumerable: false,
            value: cancel,
            configurable: false,
            writable: false,
        });
        return container as D & { cancel(): void };
    }
    public refArr<D = T>(op?: { def?: T; shallow?: boolean }) {
        this.bindClear();
        const container = Array.isArray(op?.def)
            ? op?.def
            : op?.shallow
            ? shallowReactive([])
            : (reactive([]) as any);
        const cancel = this.subscribe(((v: D) => {
            (container as any).splice(
                0,
                (container as any).length,
                ...(v as any)
            );
        }) as any);
        Object.defineProperty(container, "cancel", {
            enumerable: false,
            value: cancel,
            configurable: false,
            writable: false,
        });
        return container! as any as D & { cancel(): void };
    }
    public refRef<D = T | null>(op?: {
        def?: T;
        shallow?: boolean;
        ref?: { value: any };
    }) {
        this.bindClear();
        const container = op?.shallow ? shallowRef(op?.def) : ref(op?.def);
        const cancel = this.subscribe(((v: D) => {
            (container as any).value = v;
        }) as any);
        Object.defineProperty(container, "cancel", {
            enumerable: false,
            value: cancel,
            configurable: false,
            writable: false,
        });
        return container! as any as Ref<D> & { cancel(): void };
    }
    public clone() {
        return new ObserableVue<T>(this.finalOb, this.clears);
    }
    public state() {
        return this.addPipe(shareReplay(1));
    }
    public share() {
        return this.addPipe(share());
    }
    public toString() {
        return "[Object ObservableVue]You'd ref - Str";
    }
    public toJSON() {
        return "[Object ObservableVue]You'd ref - Json";
    }
}

function assignMemo(container: any, key: any, nv: any) {
    if (!container || container[key] === nv) return; //console.log(`skip same assign of ${key}`);
    container![key] = nv;
}

export const wrapObservale = <T = any>(ob: Observable<T>) => {
    return new ObserableVue(ob);
};
