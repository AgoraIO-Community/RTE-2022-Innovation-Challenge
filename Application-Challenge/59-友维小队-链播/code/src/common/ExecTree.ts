import { getCurrentInstance, onUnmounted } from "vue";

interface Unsubscribeable {
    unsubscribe(...args: any[]): void;
}
interface Stopable {
    stop(...args: any[]): void;
}
interface Destoryable {
    destroy(...args: any[]): void;
}
type teardown =
    | ((data?: any) => any)
    | Unsubscribeable
    | Stopable
    | Destoryable;
const voidFun = () => {
    /** */
};

interface Runner {
    fun: (arg?: any) => any;
    ctx: any;
}
export class ExecTree {
    protected readonly runners = new Set<Runner>();
    private readonly childs: { [key: string]: ExecTree } = {};
    private parents = new Set<ExecTree>();
    constructor(public readonly name: string) {
        //
    }
    run(data?: any) {
        for (const key of Object.keys(this.childs)) {
            const el = this.childs[key];
            el.run(data);
        }
        const list = Array.from(this.runners);
        this.runners.clear();
        list.forEach((runner) => {
            this.exec(runner, this.runners, data);
        });
    }
    track(fun: () => teardown | void) {
        const teardown = fun();
        if (teardown) {
            return this.add(teardown);
        }
        return voidFun;
    }
    child(name: string) {
        let el = this.childs[name];
        if (!el) {
            el = new ExecTree(name);
            el.parents.add(this);
            this.childs[name] = el;
        }
        return el;
    }
    add(cb?: teardown) {
        const runner = this.getExecAndCtx(cb);
        if (!runner.fun) {
            return voidFun;
        }
        this.runners.add(runner);
        return (run = true) => {
            run && this.exec(runner);
            this.runners.delete(runner);
        };
    }
    private getExecAndCtx(el: any) {
        let fun: any;
        let ctx = null;
        if (typeof el === "function") {
            fun = el;
        } else if (typeof el?.stop === "function") {
            fun = el.stop;
            ctx = el;
        } else if (typeof el?.unsubscribe === "function") {
            fun = el.unsubscribe;
            ctx = el;
        } else if (typeof el?.destroy === "function") {
            fun = el.destory;
            ctx = el;
        }
        return { fun, ctx };
    }
    private exec(el: Runner, backers?: Set<Runner>, data?: any) {
        try {
            const { fun, ctx } = el;
            const res = fun?.call(ctx, data);
            if (res && backers) {
                backers.add(res);
            }
        } catch (error) {
            console.warn(error);
        }
    }
    dropChild(name: string | ExecTree) {
        const el = typeof name === "string" ? this.childs[name] : name;
        el.parents.delete(this);
        delete this.childs[typeof name === "string" ? name : name.name];
    }
    detach(parent?: ExecTree) {
        if (!this.parents.size) {
            return;
        }
        if (!parent) {
            this.parents.forEach((e) => {
                delete e.childs[this.name];
            });
            this.parents.clear();
        } else if (this.parents.has(parent)) {
            this.parents.delete(parent);
            delete parent.childs[this.name];
        }
    }
    attach(child: ExecTree) {
        child.parents.add(this);
        this.childs[child.name] = child;
        return () => {
            delete this.childs[child.name];
            child.parents.delete(this);
        };
    }
    join(target: ExecTree) {
        this.parents.add(target);
        target.childs[this.name] === this;
        return () => {
            this.parents.delete(target);
            delete target.childs[this.name];
        };
    }
}
let unid = Date.now();
export const useExecTree = (name?: string, auto = true) => {
    const i = getCurrentInstance();
    if (!i && !name && auto) {
        throw new Error("name or use in setup");
    }
    name = name || String(i?.uid ?? "");
    const tree = new ExecTree(name || String(unid++));
    if (i && auto) {
        onUnmounted(() => {
            tree.run();
        });
    }
    return tree;
};
