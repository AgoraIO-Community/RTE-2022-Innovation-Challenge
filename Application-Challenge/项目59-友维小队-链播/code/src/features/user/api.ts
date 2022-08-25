import { sleep } from "hjcore";
import { NavigationGuardWithThis, RouteLocationNormalized } from "vue-router";

export const LoginGuard: NavigationGuardWithThis<any> = async function (
    _to: RouteLocationNormalized,
    _f,
    next
) {
    while (Accounts.loggingIn() || Accounts.loggingOut()) {
        await sleep(0.02);
    }
    if (!Meteor.userId()) {
        console.log(`need login`);
        return next("/user/signin?to=" + encodeURIComponent(_to.fullPath));
    }
    next();
};
