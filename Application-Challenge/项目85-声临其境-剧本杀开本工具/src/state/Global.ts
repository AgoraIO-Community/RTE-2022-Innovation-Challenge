import { FastboardApp } from "@netless/fastboard-react";
import { AppContext, Room } from "@netless/window-manager";
import { User } from "../users/UserManager";

export default class GlobalContext {
    appContext: AppContext | undefined;
    fastboardApp: FastboardApp | undefined;
    room: Room | undefined;
    // userManager: UserManager = new UserManager();
    isAdmin: boolean = false;
    currentUser: User | undefined;
    players: User[] = [];

    public setPlayer(user: User): any {
        if (user == undefined || user == null) {
            return;
        }

        const u = this.players.find((u) => {
            return u.roomUserId == user.roomUserId;
        })
        if (u != undefined) {
            u.update(user);
        } else {
            this.players.push(user);
        }
    }
}

