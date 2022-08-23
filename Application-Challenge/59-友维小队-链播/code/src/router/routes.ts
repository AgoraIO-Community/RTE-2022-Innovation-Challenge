import { RouteRecordRaw } from "vue-router";

import castRoutes from "@/features/castroom/routes";
import userRoutes from "@/features/user/routes";
import chatRoutes from "@/features/chat/routes";
import aboutRoutes from "@/features/about/routes";
import Tabs from "@/views/Tabs.vue";
import TabHome from "@/views/TabHome.vue";
export const routes: Array<RouteRecordRaw> = [
    // {
    //     path: "/",
    //     redirect: "/tabs/tab1",
    // },
    {
        path: "/tabs/",
        component: Tabs,
        children: [
            {
                path: "",
                redirect: "tab1",
            },
            {
                path: "tab1",
                component: TabHome,
            },
            {
                path: "tab2",
                component: () => import("@/views/TabFavor.vue"),
            },
            {
                path: "message",
                component: () => import("@/features/chat/pages/TabMessage.vue"),
            },
            {
                path: "mineroom",
                component: () => import("@/views/TabMine.vue"),
            },
            {
                path: "tab3",
                component: () => import("@/views/TabUser.vue"),
            },
        ],
    },
    ...userRoutes,
    ...castRoutes,
    ...chatRoutes,
    ...aboutRoutes,
    {
        path: "/:catchAll(.*)*",
        redirect: "/tabs/tab1",
    },
];
