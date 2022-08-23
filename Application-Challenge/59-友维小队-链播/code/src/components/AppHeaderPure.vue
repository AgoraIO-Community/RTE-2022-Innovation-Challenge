<template>
    <ion-header :translucent="true" @click="$event.stopImmediatePropagation()">
        <ion-toolbar class="toolbar" :class="{ show }">
            <slot name="diy">
                <ion-buttons :slot="'start'">
                    <slot name="start">
                        <h-back-btn
                            v-if="props.back"
                            :back="props.back"
                        ></h-back-btn>
                        <h-back v-else></h-back>
                    </slot>
                </ion-buttons>
                <ion-title>{{ props.pageName }}</ion-title>
                <ion-buttons :slot="'end'">
                    <slot></slot>
                </ion-buttons>
            </slot>
        </ion-toolbar>
    </ion-header>
</template>

<script lang="ts" setup>
import { IonButtons, IonHeader, IonTitle, IonToolbar } from "@ionic/vue";
import { computed } from "vue";
const props = defineProps(["pageName", "back", "show"]);
const show = computed(() => (props.show === undefined ? true : !!props.show));
</script>

<style scoped lang="scss">
.toolbar {
    --background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.5) 0%,
        rgba(0, 0, 0, 0) 100%
    );
    --border-style: "none";
    position: absolute;
    transition: transform 0.3s ease;
    transform: translateY(-60px);
    color: white;
    &.show {
        transform: translateY(0);
    }
}
</style>
