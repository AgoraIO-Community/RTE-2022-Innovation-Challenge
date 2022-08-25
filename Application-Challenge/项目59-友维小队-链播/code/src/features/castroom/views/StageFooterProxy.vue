<template>
    <component :is="comp" v-if="comp"></component>
    <span v-else></span>
</template>

<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { computed, reactive, ref } from "vue";
import { useCastRoomService } from "../services";
const serv = useCastRoomService();
const m = useMeteor();
const rt = m.wrapObservale$(serv.roomType$).refRef<any>();
const comp = computed(() => {
    return serv.modeMana.getModeConfig(rt.value).footer;
});
</script>

<style lang="scss" scoped>
</style>
