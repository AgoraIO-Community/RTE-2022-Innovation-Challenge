<template>
    <div class="prev" :class="classTick">
        <h-img v-if="frame" :src="frame"></h-img>
        <h-icon
            :icon="swapHorizontalOutline"
            class="mark"
            @click="emit('replace')"
            :class="{ online }"
        ></h-icon>
    </div>
</template>

<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useOverlay } from "@/common/overlay";
import { useCastRoomService } from "@/features/castroom/services";
import { computed, ref } from "vue";
import { roomUtils, SourceManager } from "../source";
import { swapHorizontalOutline } from "ionicons/icons";
const emit = defineEmits(["replace"]);
const props = defineProps<{ roomId: string }>();
const m = useMeteor();
const ob = m
    .wrapObservale$(roomUtils.roomPrevInfo$(props.roomId))
    .tap(console.warn)
    .share();

const frame = ob.map((v) => v?.frame).refRef();
const online = ob.map((v) => !!v?.session).refRef();
const source = SourceManager.get(props.roomId);
const isPicked = m
    .wrapObservale$(source.picked$)
    .map((v) => v === props.roomId)
    .refRef();
const isCurrent = m
    .wrapObservale$(source.current$)
    .map((v) => v === props.roomId)
    .refRef();
const classTick = computed(() => {
    return isCurrent.value ? "current" : isPicked.value ? "picked" : "";
});
const vid = ref<HTMLVideoElement>();
const serv = useCastRoomService();

const overlay = useOverlay();
</script>

<style lang="scss" scoped>
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
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgb(114, 112, 112);
    position: absolute;
    left: -6px;
    top: -6px;
    &.online {
        background-color: aquamarine;
    }
}
</style>
