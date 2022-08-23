<template>
    <h-el
        :button="true"
        :router-link="nav.url"
        color="light"
        router-direction="forward"
    >
        <h-icon slot="start" class="left-icon" :icon="nav.icon"></h-icon>
        <h-txt class="text">{{ nav.name }}</h-txt>
    </h-el>
</template>
<script lang="ts" setup>
import { IonIcon } from "@ionic/vue";
defineProps<{
    nav: {
        id: string;
        name: string;
        url: string;
        icon: string;
    };
}>();
</script>
<style scoped lang="scss">
ion-item {
    --padding-start: 12px;
    --inner-padding-end: 12px;
    --min-height: 56px;
}
</style>
