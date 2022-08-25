<template>
    <div>
        <h-view v-if="!isCasting" class="guide-view fcol cntx pd">
            <h-list>
                <h-list-header> <h-h3>导播指引</h-h3></h-list-header>
                <h-el> 1. 从下方选择视频源，可以提取本人视频 </h-el>
                <h-el> 2. 可以添加四个备选视频，随时进行切换 </h-el>
            </h-list>
        </h-view>
        <video
            v-show="hasVideo"
            class="w100p h100p"
            muted
            ref="vid"
            @canplay="tryPlay"
        ></video>
    </div>
</template>

<script lang="ts" setup>
import { useOverlay } from "@/common/overlay";
import { distinctUntilChanged } from "rxjs/operators";
import { onMounted, ref } from "vue";
import { useCastRoomService } from "../../services";
import { SourceManager } from "./source";
const vid = ref<HTMLVideoElement>();
const serv = useCastRoomService();
const isCasting = serv.cast.isCasting$.refRef();
const hasVideo = ref(false);
const overlay = useOverlay();
const source = SourceManager.get(serv.roomId);
const tryPlay = () => {
    vid.value
        ?.play()
        .then(() => {
            serv.markModeReady(true);
        })
        .catch(() => {
            overlay.showWarn("需要同意才能播放", "注意").then(() => {
                vid.value?.play();
                serv.markModeReady(true);
            });
        });
};
const sess = serv.sess.child("guide-show-stage");
onMounted(() => {
    sess.add(
        source.localStream$.subscribe((v) => {
            hasVideo.value = v?.getVideoTracks().length > 0;
            vid.value!.srcObject = v;
        })
    );
});
</script>

<style lang="scss" scoped>
video {
    object-fit: cover;
    z-index: 1;
    position: relative;
}
.guide-view {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 0;
}
</style>
