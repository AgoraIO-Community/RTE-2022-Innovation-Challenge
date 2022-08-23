import { DBItemBase, DBItemNorm } from "../core/types";

export enum CastRoomShowType {
    Single = "single", // 个秀, 可以选择协议 - 免费/分成/会员
    Guide = "guide", // 导视, 可以选择一个其它的视频源，组合本人的视频，无法联动
    LiveStory = "lstory", // 专场, 多人联合，由导演即时组合专场演员的视频进行直播
    Focus = "focus", // 焦点, 选择视频源后，可以通过指定关键字生成多个视图，单个视图可是一个Broadcast
}

export const CastRoomShowTypeDesc = {
    single: {
        name: "个秀",
    },
    guide: {
        name: "导播",
    },
    lstory: {
        name: "直映",
    },
    focus: {
        name: "焦点",
    },
} as {
    [key: string]: {
        name: string;
    };
};

export enum CastRoomWatchType {
    Public = "pub", //
    Password = "pwd", //
    Secret = "sec",
    Login = "usr",
}

export enum CastRoomShareType {
    Free = "free",
    Share = "share",
    Subscribe = "sub",
}

export interface CastRoom extends DBItemBase {
    id: number;
    admin: string;
    adminId: string;
    chatChannel?: string;
    showType: CastRoomShowType;
    watchType?: CastRoomWatchType;
    shareType?: CastRoomShareType;
    shareContactId?: string; // 转发合同id
    password?: string;
    name: string;
    members?: string[];
    watchers: string[];
    desc: string; // 预告一类
    lastActive?: Date;
    session?: string;
    postHoz?: string;
    postVer?: string;
    frame?: string;
}

export interface CastRoomRecord extends DBItemNorm {
    roomId: string;
    startAt: Date;
    closeAt?: Date;
    closeReason?: string;
    hotCount: number;
    status: 0 | 1;
    records?: any[];
}

export interface CastRoomUserFavor extends DBItemNorm {
    roomId: string;
    userId: string;
}
