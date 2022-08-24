export function getCurrentRoomUID(): string {
    return `${window?.appContext?.getRoom()?.uid}`;
}

export class UserManager {
    admin: User | undefined;
    currentUser: User | undefined;
    players: User[] = [];
    isAdmin = false;
    public setUser(user: User): any {
        if (user == undefined || user == null) {
            return;
        }
        console.log("user ======= ", user)
        if (user.roomUserId == getCurrentRoomUID()) {
            this.currentUser = user;
        }
        if (user.isAdmin) {
            this.admin = user;
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


export class User {
    isAdmin: boolean | undefined;
    userName: string | undefined;
    roomUserId: string | undefined;
    rtcUserId: string | undefined;
    roleId: number | undefined;

    constructor(roomUserId: string, userName: string, rtcUserId: string, roleId: number, isAdmin?: boolean | false) {
        this.roomUserId = roomUserId;
        this.userName = userName;
        this.rtcUserId = rtcUserId;
        this.isAdmin = isAdmin;
        this.roleId = roleId;
    }

    equals(u: User): boolean {
        if (u == undefined || u == null) {
            return false;
        }

        return u.roomUserId == this.roomUserId;
    }

    update(u: User) {
        this.userName = u.userName;
        this.roomUserId = u.roomUserId;
        this.isAdmin = u.isAdmin;
        this.roleId = u.roleId;
    }

    toJson() {
        return {
            isAdmin: this.isAdmin,
            userName: this.userName,
            roomUserId: this.roomUserId,
            rtcUserId: this.rtcUserId
        }
    }

}