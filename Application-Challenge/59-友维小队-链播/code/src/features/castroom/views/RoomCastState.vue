<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useRouter } from "@/router";
import { computed, watch } from "vue";
import { useCastRoomService } from "../services";
import { radioButtonOn, radioButtonOff } from "ionicons/icons";
import { CastRoomShowTypeDesc } from "../deps";
const m = useMeteor();
const router = useRouter();

const serv = useCastRoomService();
const roomType = m.wrapObservale$(serv.roomType$).refRef();
const typeName = computed(() => {
    return CastRoomShowTypeDesc[roomType.value as string]?.name || "  ";
});

const isCasting = serv.cast.isCasting$.tap(console.warn).refRef();

const icon = computed(() => (isCasting.value ? radioButtonOn : radioButtonOff));
</script>

<template>
    <h-chip>
        <h-txt label color="secondary"> {{ typeName }} </h-txt>
        <h-icon
            :color="isCasting ? 'success' : 'danger'"
            size="small"
            :icon="icon"
        ></h-icon>
    </h-chip>
</template>

<style scoped lang="scss"></style>
