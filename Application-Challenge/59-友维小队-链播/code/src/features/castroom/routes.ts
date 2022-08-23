import { defineAsyncComponent } from "vue";
import { RouteRecordRaw } from "vue-router";
import { LoginGuard } from "../user/api";
import { GuardRoomAccess, GuardRoomInfo, GuardRoomIsMine } from "./guards";

export default [
    {
        path: "/castroom/:id",
        component: () => import("./pages/RoomWatch.vue"),
        beforeEnter: [GuardRoomInfo, GuardRoomAccess],
    },
    {
        path: "/castroom/dir/:id",
        component: () => import("./pages/RoomCaster.vue"),
        beforeEnter: [LoginGuard, GuardRoomInfo, GuardRoomIsMine],
    },
    {
        path: "/castroom/mana/crt",
        component: () => import("./pages/ManaCreate.vue"),
        beforeEnter: [LoginGuard],
    },
    {
        path: "/castroom/mana/info/:id",
        component: () => import("./pages/ManaCreateInfo.vue"),
        beforeEnter: [LoginGuard, GuardRoomInfo, GuardRoomIsMine],
    },
    // {
    //     path: "/castrooms",
    //     component: () => import("./pages/RoomList.vue"),
    // },
] as RouteRecordRaw[];
