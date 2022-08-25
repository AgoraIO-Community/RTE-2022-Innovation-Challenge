<template>
    <h-page>
        <template #head>
            <h-header-pure :back="back" class="row cnty" page-name="导播室">
                <RoomCastState @click="infoEdit"></RoomCastState>
            </h-header-pure>
        </template>
        <div class="fcol page">
            <StageBodyProxy
                v-show="isReady"
                class="w100p h100p"
                :key="roomType"
            ></StageBodyProxy>
            <div
                v-if="!isReady"
                style="
                    position: absolute;
                    width: 200px;
                    top: 200px;
                    left: calc(50% - 100px);
                    z-index: 333;
                    text-align: center;
                "
            >
                准备中，请稍后
            </div>
        </div>
        <template #foot>
            <StageFooterProxy :key="roomType"></StageFooterProxy>
        </template>
        <RoomChat
            v-if="room?.chatChannel"
            :channel="room.chatChannel"
            class="chat-board"
        ></RoomChat>
        <RoomPersonCount style="left: -14px; top: 40px"></RoomPersonCount>
    </h-page>
</template>

<script lang="ts" setup>
import StageFooterProxy from "../views/StageFooterProxy.vue";
import StageBodyProxy from "../views/StageBodyProxy.vue";
 
import RoomChat from "../../chat/views/RoomChat.vue";
import { useBackButton } from "@ionic/vue";
import { setupCastRoomService } from "../services";
import { useOverlay } from "@/common/overlay";

import { useDisableSwipeBack } from "@/services/ionic";
import { useMeteor } from "@/common/meteor";
import RoomCastState from "../views/RoomCastState.vue";
import RoomPersonCount from "../views/RoomPersonCount.vue";
import { setupCastRoomInfo } from "../services/CastRoomInfo";
import { useRouter } from "@/router";
const router = useRouter();
const m = useMeteor();
const serv = setupCastRoomService();
const room = serv.info.infoRef;
useDisableSwipeBack();
useBackButton(10, () => {
    //
    back();
});
setupCastRoomInfo(room.value?._id!, true);
const isReady = m.wrapObservale$(serv.ready$).refRef();
const roomType = m.wrapObservale$(serv.roomType$).refRef<string>();
const q = useOverlay();
const back = async () => {
    if (serv.cast.state.status !== 0) {
        const ok = await q.showConfirm("直播中，是否退出");
        if (!ok) {
            return;
        }
    }
    router.back();
};
const infoEdit = () => {
    //
    // infoEditor.value?.open(!!room.value?.session);
    router.to("/castroom/mana/info/" + serv.roomId + "?f=room");
};
</script>

<style lang="scss" scoped>
.vid {
    width: 64px;
    height: 64px;
    object-fit: cover;
}

.stage {
    overflow: hidden;
    width: 100%;
}

.tabzone {
    position: absolute;
    bottom: calc(100% + 2px);
    background-color: rgba(255, 255, 255, 0.4);
    width: 100vw;
    min-height: 64px;
}

.tabpannel {
    background: transparent;
}

.page {
    height: 100%;
    overflow: hidden;
}
.chat-board {
    left: 0;
    top: 78px;
}
</style>
