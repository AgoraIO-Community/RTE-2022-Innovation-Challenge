import {
    CastRooms,
    CastRoomWatchType,
} from "./../../../server/mcore/imports/castroom/shared";
import { NavigationGuardWithThis } from "vue-router";
import { overlay } from "@/common/overlay";

export const GuardRoomInfo: NavigationGuardWithThis<any> = function (
    to,
    _from,
    next
) {
    const id = to.params.id as string;
    if (!id) {
        overlay.showWarn(`无效的房间id`);
        return next(false);
    }
    const r = CastRooms.findOne({ _id: id });
    if (!r) {
        overlay.showLoading();
        const ob = CastRooms.find({ _id: id }).observe({
            added() {
                setTimeout(() => {
                    overlay.hideLoading();
                    ob.stop();
                    next();
                    clearTimeout(t);
                });
            },
        });
        const t = setTimeout(() => {
            ob.stop();
            overlay.hideLoading();
            overlay.showWarn(`未能找到对应的房间信息`);
            console.warn(`timeout get room data`);
            next("/");
        }, 2000);
        return;
    }
    next(true);
};

export const GuardRoomIsMine: NavigationGuardWithThis<any> = async function (
    to
) {
    const id = to.params.id as string;
    const r = CastRooms.findOne({ _id: id });
    return r?.createdBy === Meteor.userId();
};

export const GuardRoomAccess: NavigationGuardWithThis<any> = async function (
    to
) {
    const id = to.params.id as string;
    const r = CastRooms.findOne({ _id: id });
    if (r?.watchType === CastRoomWatchType.Login) {
        return !!Meteor.userId();
    }
    if (r?.watchType === CastRoomWatchType.Password) {
        const p = await overlay.showInput("密码", "", "房间需要密码", false, {
            attrs: { type: "password" },
        });
        return false;
    }
    return true;
};
