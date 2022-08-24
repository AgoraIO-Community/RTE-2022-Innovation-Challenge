<template>
    <div class="prev" :class="classTick">
        <video muted playsinline="true" ref="vid" src=""></video>
        <h-view class="mark"></h-view>
    </div>
</template>

<script lang="ts" setup>
import { useExecTree } from "@/common/ExecTree";
import { useMeteor } from "@/common/meteor";
import { useCastRoomService } from "@/features/castroom/services";
import { useMediaTool } from "@/services/media";
import { Subject, take } from "rxjs";
import { computed, onMounted, ref } from "vue";
import { SourceManager } from "../source";
const vid = ref<HTMLVideoElement>();
const serv = useCastRoomService();
const sess = useExecTree();
const m = useMeteor();
const ob = m
    .wrapObservale$(serv.captureLocalStream$())
    .tap(console.warn)
    .share();
const mt = useMediaTool();
const init$ = new Subject<MediaStream>();

const source = SourceManager.get("");
sess.add(
    init$.pipe(take(1)).subscribe((v) => {
        source.pickOne(0);
        source.localStream$.next(v);
    })
);
onMounted(() => {
    sess.add(
        ob.subscribe((v) => {
            console.error(v);
            if (v.stream && vid.value?.srcObject !== v.stream) {
                vid.value!.srcObject = v.stream;
                mt.playElement(vid.value!);
                init$.next(v.stream);
            }
        })
    );
});
const isPicked = m
    .wrapObservale$(source.picked$)
    .map((v) => v === "local")
    .refRef();
const isCurrent = m
    .wrapObservale$(source.current$)
    .map((v) => v === "local")
    .refRef();
const classTick = computed(() => {
    return isCurrent.value ? "current" : isPicked.value ? "picked" : "";
});
</script>

<style lang="scss" scoped>
video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.prev {
    width: 100%;
    height: 100%;
    border: 1px solid transparent;
    &.current {
        border-color: aquamarine;
    }
    &.picked {
        border-color: orange;
    }
}
.mark {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: rgb(12, 223, 82);
    position: absolute;
    left: 36px;
    top: -6px;
}
</style>
