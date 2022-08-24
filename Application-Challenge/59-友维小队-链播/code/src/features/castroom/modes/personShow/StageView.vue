<template>
    <div>
        <video class="w100p h100p" muted ref="vid" @canplay="tryPlay"></video>
        <CastBtn></CastBtn>
        <CameraStream ref="camera" class="cam"> </CameraStream>
    </div>
</template>

<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useOverlay } from "@/common/overlay";
import { onMounted, ref } from "vue";
import { useCastRoomService } from "../../services";
import CastBtn from "./FootView.vue";
import CameraStream from "../../views/shared/CameraStream.vue";
import { map } from "rxjs";
const vid = ref<HTMLVideoElement>();
const camera = ref<InstanceType<typeof CameraStream>>();
const serv = useCastRoomService();
const m = useMeteor();
const sess = serv.modeSess.child(`person-show-stage`);
const overlay = useOverlay();
const tryPlay = () => {
    vid.value
        ?.play()
        .then(() => {
            //
        })
        .catch(() => {
            overlay.showWarn("需要同意才能播放", "注意").then(() => {
                vid.value?.play();
            });
        });
};
onMounted(() => {
    sess.add(
        camera
            .value!.capture(
                serv.config.videoSize$.pipe(
                    map((v) => ({
                        video: { width: v.width, height: v.height },
                        audio: true,
                    }))
                )
            )
            .subscribe((stream) => {
                vid.value!.srcObject = stream;
                if (!stream) {
                    serv.markModeReady(false);
                } else {
                    serv.markModeReady(true);
                }
            })
    );
});
sess.add(()=>console.error(`person show stage end`))
</script>

<style lang="scss" scoped>
video {
    object-fit: cover;
}
.cam {
    position: absolute;
    right: 20px;
    top: 50px;
}
</style>
