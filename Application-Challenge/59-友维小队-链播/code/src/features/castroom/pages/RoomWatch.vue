<script lang="ts" setup>
import { ref, shallowRef, provide, onMounted } from "vue";
import { useMediaTool } from "@/services/media";
import { starOutline, star } from "ionicons/icons";
import { useRoute } from "vue-router";
import { useMeteor } from "@/common/meteor";
import RoomChat from "../../chat/views/RoomChat.vue";
import {
    CastRoomInfoService,
    setupCastRoomInfo,
} from "../services/CastRoomInfo";
import RoomPersonCount from "../views/RoomPersonCount.vue";
import { useExecTree } from "../deps";
import CastInfo from "../views/shared/CastInfo.vue";
import { overlay } from "@/common/overlay";
import { useApi } from "@/common/api";
import { ApiLink } from "@/common/shared";
import { ModeManager } from "../ModeManager";
import { WatchSourceProvider } from "../types";
const vid = ref<HTMLVideoElement>();
const route = useRoute();
const rid = route.params.id as string;
const pureMode = route.query.f === "caster";
const info = new CastRoomInfoService(rid);

const modeMana = new ModeManager();

const sess = useExecTree();
const subsess = sess.child("sub");
const m = useMeteor();
const infoWrap = m.wrapObservale$(info.info$);
const room = infoWrap.refRef();

const hasStream = ref(false);

provide("room", room);

setupCastRoomInfo(rid);
let wsp: WatchSourceProvider;
const getProvider = () => {
    if (!wsp) {
        const roomId = room.value!._id;
        const conf = modeMana.getModeConfig(room.value!.showType);
        wsp = new conf.watcher.source(roomId);
    }
    return wsp;
};

onMounted(() => {
    sess.add(
        infoWrap
            .map((v) => !!v.session)
            .ifChanged()
            .subscribe((v) => {
                if (v) {
                    const sp = getProvider();
                    subsess.add(
                        sp.getStream$().subscribe((v) => {
                            hasStream.value = !!v?.getTracks().length;
                            console.log(v);
                            if (v) {
                                vid.value!.srcObject = v;
                            } else {
                                vid.value!.srcObject = null;
                            }
                        })
                    );
                    subsess.add(() => (hasStream.value = false));
                } else {
                    subsess.run();
                }

                console.log(`has tream?` + hasStream.value);
            })
    );
});

const mt = useMediaTool();

// favor
const isFavor = ref(false);
const favorApi = shallowRef<ApiLink>();
const api = useApi();
api.get("castroom/favor", { roomId: rid }, { quiet: true }).then((res) => {
    favorApi.value = res.getLink();
    isFavor.value = !!res.get("isFavor");
});
const favor = () => {
    if (!Meteor.userId()) {
        return overlay.showWarn("仅登录用户可以收藏");
    }
    api.useLink(favorApi.value, {
        data: { roomId: rid },
    }).then((res) => {
        isFavor.value = !isFavor.value;
        favorApi.value = res.getLink();
    });
};
const showLayer = ref(true);
const toggleLayers = () => {
    showLayer.value = !showLayer.value;
};
const tryPlay = (ev: any) => {
    if (!hasStream.value) {
        return;
    }
    mt.playElement(ev.target);
};
</script>

<template>
    <h-page>
        <template #head>
            <h-header-pure :show="showLayer">
                <template #start>
                    <h-back-btn class="back-btn"></h-back-btn>
                </template>
                <CastInfo v-if="room" class="mgr"></CastInfo>
                <h-btn fill="clear" @click="favor" :disabled="!favorApi">
                    <h-icon :icon="isFavor ? star : starOutline"></h-icon>
                </h-btn>
            </h-header-pure>
        </template>
        <!-- <template #buttons>
            <h-btn class="pure" size="small">收藏</h-btn>
        </template> -->
        <h-view wrapper class="box" @click="toggleLayers">
            <video
                v-show="hasStream"
                @canplay="tryPlay"
                ref="vid"
                class="player"
            ></video>
        </h-view>
        <RoomPersonCount
            :class="{ show: showLayer }"
            class="person-count transition"
        ></RoomPersonCount>
        <template v-if="room?.chatChannel && !pureMode">
            <RoomChat
                class="room-chat transition"
                :class="{ show: showLayer }"
                :channel="room.chatChannel"
            ></RoomChat>
        </template>
    </h-page>
</template>

<style lang="scss" scoped>
.person-count {
    bottom: 40px;
    left: -100px;
    &.show {
        left: -14px;
    }
}
.box {
    height: 100%;
    background: linear-gradient(
        135deg,
        rgba(240, 30, 30) 0%,
        rgb(241, 124, 13) 20%,
        rgb(204, 161, 21) 35%,
        rgb(28, 218, 11) 50%,
        rgb(6, 179, 223) 65%,
        rgba(35, 56, 243, 0.5) 80%,
        rgba(216, 41, 216, 0.5) 100%
    );
}
.player {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.room-chat {
    right: -60vw;
    &.show {
        right: 0px;
    }
}
.back-btn {
    width: 32px;
    height: 32px;
    margin-left: 8px;
}
</style>
