<template>
    <component :is="comp" v-if="comp"></component>
    <div v-else>准备中，请稍后</div>
</template>

<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { computed, reactive, ref } from "vue";
import { useCastRoomService } from "../services";
const serv = useCastRoomService();
const m = useMeteor();
const rt = m.wrapObservale$(serv.roomType$).refRef<any>();
const comp = computed(() => {
    return serv.modeMana.getModeConfig(rt.value).body;
});
</script>

<style lang="scss" scoped></style>
