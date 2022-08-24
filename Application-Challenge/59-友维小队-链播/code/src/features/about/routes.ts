import { NavigationGuardWithThis, RouteRecordRaw } from "vue-router";

export default [
    {
        path: "/about/us",
        component: () => import("./pages/AboutUs.vue"),
    },
    {
        path: "/about/app",
        component: () => import("./pages/AboutApp.vue"),
    },
    {
        path: "/about",
        component: () => import("./pages/AboutHome.vue"),
    },
] as RouteRecordRaw[];
