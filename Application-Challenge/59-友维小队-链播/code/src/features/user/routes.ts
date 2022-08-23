import { NavigationGuardWithThis, RouteRecordRaw } from "vue-router";
import { LoginGuard } from "./api";
const notLogin: NavigationGuardWithThis<any> = (_t, _f, nex) => {
    if (Meteor.userId()) {
        return nex("/")
    }
    nex()
}
export default [
    {
        path: "/user/signin",
        component: () => import("./pages/LoginPage.vue"),
        beforeEnter: [notLogin]
    },
    {
        path: "/user/signup",
        component: () => import("./pages/SignupPage.vue"),
        beforeEnter: [notLogin]
    },
    {
        path: "/mine/profile",
        component: () => import("./pages/MineProfile.vue"),
        beforeEnter: [LoginGuard]
    },
] as RouteRecordRaw[];
