import { routes } from "./routes";
import { createRouter, createWebHistory } from "@ionic/vue-router";
import { RouteRecordRaw } from "vue-router";

const history = createWebHistory(process.env.BASE_URL);

export const router1 = createRouter({
    history,
    routes,
});

export const setupRouter = (app: any) => {
    app.use(router1);
    router1.isReady().then(() => {
        app.mount("#app");
        console.log(router1.getRoutes());
        console.error("router ready...");
    });
};

router1.beforeEach(async (to, from, next) => {
    console.info(`try nav to ${to.fullPath} from ${from.fullPath}`);
    next();
});
export const addRoute = async (route: RouteRecordRaw, name?: string) => {
    router1.addRoute(name || route.path, route);
};
export const addRoutes = async (routes: RouteRecordRaw[]) => {
    routes.forEach((route) => {
        router1.addRoute(route.name || route.path, route);
    });
};

export { useRouter } from "./routerState";
