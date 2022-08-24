<template>
    <h-view v-show="showIcon">
        <img
            @click="switchCamera"
            :class="{ disabled: isSwicthing }"
            class="icon cam-switch"
            src="../../assets/icon/camera-switch.svg"
        />
        <slot></slot>
    </h-view>
</template>

<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { device } from "@/services/device";
import { userMedia } from "@/services/localstream";
import {
    combineLatest,
    Observable,
    Subject,
    Subscriber,
    debounceTime,
    map,
    tap,
    BehaviorSubject,
} from "rxjs";
import { computed, ref } from "vue";
import { useCastRoomService } from "../../services";
const serv = useCastRoomService();
const isCast = serv.cast.isCasting$.refRef<boolean>();
const sess = serv.sess.child("person-show-cast");
const isSwicthing = ref(false);
const m = useMeteor();

const canSwitch = m
    .wrapObservale$(device.devices$)
    .tap(console.warn)
    .map((v) => v.video.length > 1)
    .refRef();
const showIcon = computed(() => canSwitch.value && !isCast.value);

const emit = defineEmits(["change"]);

const switch$ = new BehaviorSubject<"user" | "environment">("user");
const switchCamera = () => {
    const facingMode = switch$.value === "user" ? "environment" : "user";
    switch$.next(facingMode);
};
defineExpose({
    capture: (
        size$: Observable<{
            video: { width: number; height: number };
            audio?: any;
        }>
    ) => {
        return new Observable<MediaStream>((suber) => {
            return userMedia
                .getLocalStream$(
                    combineLatest({
                        size: size$,
                        facingMode: switch$,
                    }).pipe(
                        debounceTime(20),
                        tap((v) => {
                            isSwicthing.value = true;
                            console.log(`switchiiiiiii`, v);
                        }),
                        map((v) => ({
                            video: {
                                ...v.size.video,
                                facingMode: v.facingMode,
                            },
                            audio: v.size.audio,
                        }))
                    )
                )
                .subscribe((v) => {
                    console.error(v);
                    if (v.stream) {
                        suber.next(v.stream);
                    } else {
                        suber.next(undefined);
                    }
                    isSwicthing.value = false;
                });
        });
    },
});
</script>

<style lang="scss" scoped></style>
