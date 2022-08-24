import { RouteRecordRaw } from "vue-router";
import { LoginGuard } from "../user/api";

export default [
    {
        path: "/chat/contacts",
        component: () => import("./pages/ChatContact.vue"),
        beforeEnter: [LoginGuard],
    },
    {
        path: "/chat/contacts/search",
        component: () => import("./pages/ChatContactSearch.vue"),
        beforeEnter: [LoginGuard],
    },
    {
        path: "/chat/contacts/req",
        component: () => import("./pages/ChatContactRequest.vue"),
        beforeEnter: [LoginGuard],
    },
    {
        path: "/chat/p2p/:id",
        component: () => import("./pages/ChatSingleRoom.vue"),
        beforeEnter: [LoginGuard],
    },
] as RouteRecordRaw[];
