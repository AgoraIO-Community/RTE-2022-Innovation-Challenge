import { useIonRouter, UseIonRouterResult } from "@ionic/vue";
import { Subject } from "rxjs";
import { inject, InjectionKey, provide } from "vue";
import { RouteLocationNormalized, Router, useRouter as ur } from "vue-router";
//useBackButton, reactive import { sleep, TaskQueue } from "../utils";
import { useRouter as urr } from "vue-router";
class StackedRouter {
    private stack = 1;
    private stacks = [] as Array<{
        from?: string;
        path: string;
        kind: "redirect" | "push";
    }>;
    events = new Subject<{ name: "noback" }>();
    // private rq = new TaskQueue("ROUTER-NAV");
    constructor(private router: Router, private br: Router) {}
    public phase = "";
    async back() {
        return this.br.back();
    }
    async go(num = -1) {
        while (num < 0) {
            this.br.back();
            num++;
        }
    }
    async redirect(path: string, op?: any) {
        op = op ? { path, ...op } : path;
        return this.br.replace(op);
    }
    async to(path: string, op?: any) {
        op = op ? { path, ...op } : path;
        this.br.push(op);
    }
    async rebase(path: string, op?: any) {
        this.br.replace({ path, ...op });
    }
    get route() {
        return this.router.currentRoute.value;
    }
    ready() {
        return this.router.isReady();
    }
    public record(to: RouteLocationNormalized, from?: RouteLocationNormalized) {
        if (!from) {
            console.log("init");
            this.stacks.push({ path: to.fullPath, from: "", kind: "push" });
            return;
        }
        if (to.fullPath === from.fullPath) {
            if (!this.stacks.find((el) => el.path === to.fullPath)) {
                this.stacks.push({ path: to.fullPath, from: "", kind: "push" });
            }
            return;
        }
        console.error({ to, from });
        if (to.redirectedFrom) {
            const i = this.stacks.findIndex(
                (el) => el.path === to.redirectedFrom!.path
            );
            if (i < 0) {
                this.stacks.splice(0);
                this.stacks.push({ path: to.path, kind: "redirect" });
            } else {
                this.stacks.splice(0, i);
            }
            return;
        } else {
            const i = this.stacks.findIndex((el) => el.path === from.path);
            if (i < 0) {
                this.stacks.splice(0);
            } else {
                this.stacks.splice(0, i);
            }
        }
    }
    public getStacks() {
        return this.stacks.slice();
    }
    change$ = new Subject<{
        to: RouteLocationNormalized;
        from?: RouteLocationNormalized;
    }>();
}

const routerKey: InjectionKey<StackedRouter> = Symbol();

export const useRouter = (
    isProvider = false,
    serv?: StackedRouter
): StackedRouter => {
    if (isProvider) {
        const r = ur();
        if (!serv) {
            serv = new StackedRouter(r, urr());
        }
        provide(routerKey, serv);
        r.afterEach((to, from) => {
            serv?.record(to, from);
            serv?.change$.next({ to, from });
        });
    } else {
        serv = inject(routerKey)!;
    }
    return serv;
};
