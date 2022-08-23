import { route } from "../core/server/restproxy";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";
import { Axios } from "axios";
import { sleep } from "hjcore";

const { agora, easemob } = Meteor.settings;

route("auth").get(async function (_, res) {
    res.link({
        url: "auth/agora",
        rel: "agora",
    });
    if (!this.userId!) {
        return;
    }
    res.link({
        url: "auth/easemob",
        rel: "easemob",
    });
});
route("auth/agora").get(async function (_, res) {
    res.link({
        url: "auth/agora/watch",
        rel: "watch",
    });
    if (!this.userId!) {
        return;
    }
    res.link({
        url: "auth/agora/pub",
        rel: "pub",
    });
});

route("auth/agora/pub").get(async function ({ query }, _res) {
    const channel = query.channel;
    if (!channel || typeof channel !== "string") {
        throw new Meteor.Error(400, "缺少频道id");
    }
    const uid: string = this.userId!;
    const role = RtcRole.PUBLISHER;
    const sec = Math.round(Date.now() / 1000) + 3600 * 2;
    const token = RtcTokenBuilder.buildTokenWithAccount(
        agora.llAppId,
        agora.llCert,
        channel,
        uid,
        role,
        sec
    );
    return {
        token,
        expireBefore: sec * 1000,
        appId: agora.llAppId,
        uid,
    };
});

route("auth/agora/watch").get(async function ({ query }, _res) {
    const channel = query.channel;
    if (!channel || typeof channel !== "string") {
        throw new Meteor.Error(400, "缺少频道id");
    }
    const uid = this.connection!.id;
    const role = RtcRole.SUBSCRIBER;
    const sec = Math.round(Date.now() / 1000) + 3600 * 10;
    const token = RtcTokenBuilder.buildTokenWithAccount(
        agora.llAppId,
        agora.llCert,
        channel,
        uid,
        role,
        sec
    );
    return {
        token,
        expireBefore: sec * 1000,
        appId: agora.llAppId,
        uid,
    };
});
const easeUrl = "https://a1.easecdn.com/1115180802177876/livelink";
const eaxios = new Axios({
    baseURL: easeUrl,
    method: "post",
    headers: {
        ["Content-Type"]: "application/json",
    },
    responseType: "json",
});
let easeKey = {
    token: "",
    ttl: 0,
    appId: "",
    taking: false,
};

const getEaseToken = async () => {
    while (easeKey.taking && !easeKey.token) {
        await sleep(1);
    }
    if (!easeKey.token || easeKey.ttl < Date.now()) {
        easeKey.taking = true;
        const grant_type = "client_credentials";
        const client_id = easemob.llClientId;
        const client_secret = easemob.llSecret;
        const token = await eaxios
            .post(
                "/token",
                JSON.stringify({
                    grant_type,
                    client_id,
                    client_secret,
                })
            )
            .then((res) => res.data)
            .catch((err) => {
                console.error(err);
                throw new Meteor.Error(500, "抱歉，暂时无法获取环信token");
            })
            .finally(() => {
                easeKey.taking = false;
            });
        console.log(token);
        easeKey.token = token.access_token;
        easeKey.appId = token.application;
        easeKey.ttl = token.expires_in * 1000 + Date.now();
    }
    return easeKey;
};

const base = route("auth/easemob").get(async function (_req, res) {
    await getEaseToken();
    res.link({ rel: "appkey", url: "auth/easemob/appkey", method: "get" });
    res.link({
        rel: "chatgroup",
        url: "auth/easemob/chatgroup",
        method: "get",
    });
});
base.sub("appkey").get(async function (_req, _res) {
    const user = Meteor.users.findOne(this.userId!, {
        fields: { easemob: 1, profile: 1 },
    });
    let em: any = user?.easemob;
    let username: string = user?.profile?.id!;
    const password = username;
    if (!em?.imtoken || em.imttl - 1800000 < Date.now()) {
        const ures1 = await eaxios.get("/users/" + username, {
            headers: {
                Authorization: `Bearer ${easeKey.token}`,
                Accept: "application/json",
            },
        });
        const ud = ures1.data;
        console.log(`ures`);
        console.log(ud);
        if (ud.error) {
            const ureg = await eaxios.post(
                "/users",
                JSON.stringify({
                    username,
                    password,
                    nickname: user?.profile?.name!,
                }),
                {
                    headers: {
                        Authorization: `Bearer ${easeKey.token}`,
                        Accept: "application/json",
                    },
                }
            );
            console.log(`ureg`);
            console.log(ureg);
        }
        const grant_type = "password";
        const auto_create_user = "true";
        console.log({ grant_type, password, username, auto_create_user });
        const {
            access_token,
            expires_in,
            user: eu,
            error,
        } = await eaxios
            .post(
                "/token",
                JSON.stringify({
                    grant_type,
                    password,
                    username,
                    auto_create_user,
                }),
                {
                    headers: {
                        Authorization: `Bearer ${easeKey.token}`,
                        Accept: "application/json",
                    },
                }
            )
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                console.error(err);
                throw new Meteor.Error(500, "抱歉，暂时无法获取环信token");
            });
        if (error) {
            throw new Meteor.Error(500, "抱歉，暂时无法使用聊天服务");
        }
        console.log({ expires_in });
        em = {
            uuid: eu.uuid,
            imtoken: access_token,
            imttl: Date.now() + expires_in * 1000,
        };
        Meteor.users.update(user?._id!, {
            $set: {
                easemob: em,
            },
        });
    }
    return {
        appkey: easemob.llAppKey,
        loginParams: {
            user: username,
            accessToken: em.imtoken,
        },
        ttl: em.imttl,
    };
});

eaxios.interceptors.response.use((res) => {
    const d = JSON.parse(res.data);
    return { data: d };
});
export const createChannel = async (data: {
    name: string;
    desc: string;
    owner: string;
}) => {
    const easeKey = await getEaseToken();
    const res = await eaxios.post(
        `chatrooms`,
        JSON.stringify({
            name: data.name,
            description: data.desc,
            owner: data.owner,
        }),
        {
            headers: {
                Authorization: `Bearer ${easeKey.token}`,
                Accept: "application/json",
            },
        }
    );
    console.log(res);
    return res.data.data.id as string;
};
