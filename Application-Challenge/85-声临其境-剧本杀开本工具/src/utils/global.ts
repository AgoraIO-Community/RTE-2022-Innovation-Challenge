import { FastboardApp } from "@netless/fastboard-react";
import type { AppContext, Room } from "@netless/window-manager";
import { UserManager } from "../users/UserManager";
declare global {
    interface Window {
        appContext: AppContext;
        userManager: UserManager;
        fastboardApp: FastboardApp;
        room: Room;
    }
}

window.appContext = window.appContext || {};
window.userManager = new UserManager();
window.fastboardApp = window.fastboardApp || null;
window.room = window.room || null;