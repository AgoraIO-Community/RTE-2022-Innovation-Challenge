import { rest } from "@/common/api";
import { useExecTree } from "@/common/ExecTree";
import websdk, { EasemobChat } from "easemob-websdk";
import {
    auditTime,
    BehaviorSubject,
    debounceTime,
    map,
    Observable,
    Subject,
} from "rxjs";
import { IMessagenProcessed, Message } from "./message.type";
import { user$ } from "@/common/meteor/meteor";

const messages$$ = new BehaviorSubject<Array<EasemobChat.TextMsgBody>>([]);
interface IContactRequest {
    to: string;
    from: string;
    status: string;
}
const WebIM = {
    conn: null as null | EasemobChat.Connection,
    token: {},
    status$: new BehaviorSubject({ connected: false, connecting: false }),
    messages$: messages$$.pipe(auditTime(200)),
    getTargetMessages$<D = EasemobChat.TextMsgBody>(
        id: string,
        elMap?: (m: EasemobChat.TextMsgBody) => D
    ) {
        console.info(`get ${id}' messgae`);
        return new Observable<D[]>((suber) => {
            return messages$$
                .pipe(
                    map((arr) => {
                        const narr = arr.filter(
                            (el) =>
                                (el.from === id || el.to === id) &&
                                el.chatType === "singleChat"
                        );
                        console.log({ arr, narr });
                        return elMap ? narr.map(elMap) : narr;
                    })
                )
                .subscribe(suber as any);
        });
    },
    contacts$: new BehaviorSubject<string[]>([]),
    contactRequests$: new BehaviorSubject<IContactRequest[]>([]),
    message$: new Subject<EasemobChat.TextMsgBody>(),
};
export const addLocalMessage = (
    msg: Message,
    chatType = "singleChat" as "singleChat" | "groupChat"
) => {
    const list = messages$$.value;
    list.push({
        id: msg._id,
        to: msg.targetId,
        from: msg.senderId,
        chatType,
        time: msg.createdAt,
        type: "txt",
        msg: msg.data,
        ext: { type: msg.type, ...msg.meta },
    });
    console.log(list);
    messages$$.next(list);
};
const tree = useExecTree("", false);
const syncContacts = () => {
    if (!WebIM.conn) {
        return;
    }
    WebIM.conn.getContacts().then((res) => {
        console.error(res);
        WebIM.contacts$.next(res.data ?? []);
    });
};
// const addContact = (e: IContactRequest) => {};
const tryLogin = async (loginParams: any) => {
    if (!WebIM.conn) {
        return;
    }
    WebIM.token = await WebIM.conn.open(loginParams);
    syncContacts();
    // WebIM.conn.getConversationList().then((res) => console.log(res));
    tree.add(() => {
        WebIM.conn?.close();
        console.warn(`end connect-------`);
        WebIM.conn?.removeEventHandler("connection&message");
        messages$$.next([]);
        WebIM.status$.next({ connecting: false, connected: false });
    });
    WebIM.conn.addEventHandler("connection&message", {
        onConnected: () => {
            console.log(`connected`);
            WebIM.status$.next({ connected: true, connecting: false });
        },
        onDisconnected: () => {
            WebIM.status$.next({ connected: false, connecting: false });
        },
        onTextMessage: (message) => {
            console.info(`text message `, message);
            if (message.chatType === "singleChat") {
                messages$$.value.push(message);
                messages$$.next(messages$$.value);
            }
            WebIM.message$.next(message);
        },
        onReceivedMessage(message) {
            console.info(`recived message `, message);
            // messages$$.value.push(message);
            // messages$$.next(messages$$.value);
        },
        onError: (error) => {
            console.log("on error", error);
        },
        onContactInvited(msg) {
            console.log(`invide`, msg);
            WebIM.contactRequests$.value.push(msg);
            WebIM.contactRequests$.next(WebIM.contactRequests$.value);
        },
        onContactAdded(msg) {
            console.log("added", msg);
            const i = WebIM.contactRequests$.value.findIndex(
                (e) => e.from === msg.from && e.to === msg.to
            );
            WebIM.contactRequests$.value.splice(i, 1);
            WebIM.contactRequests$.next(WebIM.contactRequests$.value);
            syncContacts();
        },
        onContactAgreed(msg) {
            console.log("agreed", msg);
            syncContacts();
        },
        onContactChange() {
            syncContacts();
        },
        onGroupEvent(ev) {
            console.info(`group ev`, ev);
            switch (ev.operation) {
                case "unmuteAllMembers":
                    break;
                // 聊天室一键禁言。聊天室所有成员（除操作者外）会收到该事件。
                case "muteAllMembers":
                    break;
                // 将成员移出聊天室白名单。被移出的成员收到该事件。
                case "removeAllowlistMember":
                    break;
                // 添加成员至聊天室白名单。被添加的成员收到该事件。
                case "addUserToAllowlist":
                    break;
                // 删除聊天室公告。聊天室的所有成员会收到该事件。
                case "deleteAnnouncement":
                    break;
                // 更新聊天室公告。聊天室的所有成员会收到该事件。
                case "updateAnnouncement":
                    break;
                // 解除对指定成员的禁言。被解除禁言的成员会收到该事件。
                case "unmuteMember":
                    break;
                // 禁言指定成员。被禁言的成员会收到该事件。
                case "muteMember":
                    break;
                // 移除管理员。被移除的管理员会收到该事件。
                case "removeAdmin":
                    break;
                // 设置管理员。被添加的管理员会收到该事件。
                case "setAdmin":
                    break;
                // 转让聊天室。聊天室全体成员会收到该事件。
                case "changeOwner":
                    break;
                // 主动退出聊天室。聊天室的所有成员（除退出的成员）会收到该事件。
                case "memberAbsence":
                    break;
                // 有成员被移出聊天室。被踢出聊天室的成员会收到该事件。
                case "removeMember":
                    break;
                // 有用户加入聊天室。聊天室的所有成员（除新成员外）会收到该事件。
                case "memberPresence":
                    break;
            }
        },
    });
};
export const messageTransfer = (el: EasemobChat.TextMsgBody) => {
    let d = el.msg as any;
    if (typeof d === "string") {
        try {
            d = JSON.parse(el.msg);
        } catch (error) {
            d = {
                text: el.msg,
            };
        }
    }
    return {
        _id: el.id,
        data: d,
        meta: el.ext,
        createdAt: el.time,
        senderId: el.from!!,
        targetId: el.to,
        type: el.ext?.type || "text",
        isMe: el.from === Meteor.user()?.profile.id,
    } as IMessagenProcessed;
};
const connect = async (appKey: string, loginParams: any) => {
    if (WebIM.status$.value.connecting) {
        return;
    }
    WebIM.status$.next({ connected: false, connecting: true });
    const conn = (WebIM.conn = new websdk.connection({
        appKey,
    }));
    try {
        await tryLogin(loginParams);
    } catch (err: any) {
        console.error(err);
        WebIM.status$.next({ connected: false, connecting: false });
    }
};

export const setupChat = () => {
    const api = rest;
    let subed = "";
    user$.pipe(debounceTime(2000)).subscribe((u) => {
        if (!u?._id) {
            return tree.run();
        }
        if (u._id === subed) {
            return;
        }
        subed = u._id;
        tree.add(() => (subed = ""));
        const cacheKey = "easemob-cache-" + u._id;
        const cacheStr = localStorage.getItem(cacheKey);
        const cache = cacheStr ? JSON.parse(cacheStr) : ({} as any);
        // console.log({ ttl: cache?.ttl ?? 0, big: cache?.ttl ?? 0 > Date.now() - 1800000, n: Date.now() - 1800000 })
        if ((cache?.ttl ?? 0) > Date.now() + 1800000) {
            console.info(`use local cached params`);
            connect(cache.appkey, cache.loginParams);
            return;
        }
        api.get("auth/easemob")
            .then((res) => api.useLink(res.getLink("appkey")))
            .then((res) => {
                localStorage.setItem(cacheKey, JSON.stringify(res.json()));
                connect(res.get("appkey"), res.get("loginParams"));
            });
    });
    return WebIM;
};

export const useEaseMob = () => {
    return {
        requestRelation(id: string) {
            if (!WebIM.conn) {
                throw new Error(`need connected`);
            }
            WebIM.conn.addContact(id, `我是${Meteor.user()?.profile!.name}`);
        },
    };
};

export const useChat = () => {
    return WebIM;
};

export const useEaseMobContactRequest = () => {
    return {
        requests: WebIM.contactRequests$.asObservable(),
        accept: (id: string) => {
            WebIM.conn?.acceptContactInvite(id);
        },
    };
};

export const useEaseMobContacts = () => {
    return {
        list$: WebIM.contacts$.asObservable(),
        reqNum$: WebIM.contactRequests$.pipe(map((v) => v.length)),
    };
};

export const useEaseMobMessages = () => {
    return {
        messages$: WebIM.messages$,
        status$: WebIM.status$,
    };
};

export const sendMessage = (
    message: Message,
    chatType = "singleChat" as "singleChat" | "groupChat"
) => {
    const d = websdk.message.create({
        chatType,
        type: "txt" as any,
        to: message.targetId, // 消息接收方（用户 ID)。
        from: message.senderId,
        msg: JSON.stringify(message.data),
        ext: {
            type: message.type,
            ...message.meta,
        },
    });
    console.log(`try send`, d, message);
    return WebIM.conn!.send(d);
};
