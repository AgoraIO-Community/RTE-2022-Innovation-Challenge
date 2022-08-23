<template>
    <h-chip class="member-count">
        <h-txt label> {{ count }} 人观看</h-txt>
    </h-chip>
</template>

<script lang="ts" setup>
import { computed } from "@vue/reactivity";
import { useCastRoomInfo } from "../services/CastRoomInfo";
const info = useCastRoomInfo().infoRef;

const count = computed(() => info.value?.watchers.length);
</script>

<style lang="scss" scoped>
.member-count {
    position: absolute;
    opacity: 0.4;
    background: #000000;
    border-radius: 48px;
    padding: 9px 19px;
    width: fit-content;
    font-size: 16px;
    color: #ffffff;
    letter-spacing: -0px;
}
</style>
