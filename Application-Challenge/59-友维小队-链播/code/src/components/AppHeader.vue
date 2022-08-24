<template>
    <ion-header :translucent="true" @click="$event.stopImmediatePropagation()">
        <ion-toolbar v-if="exist">
            <ion-buttons :slot="'start'">
                <h-back-btn v-if="props.back" :back="props.back"></h-back-btn>
                <h-back v-else></h-back>
            </ion-buttons>
            <ion-title>{{ props.pageName }}</ion-title>
            <ion-buttons :slot="'end'">
                <slot></slot>
            </ion-buttons>
        </ion-toolbar>
    </ion-header>
</template>

<script lang="ts" setup>
import { IonButtons, IonHeader, IonTitle, IonToolbar } from "@ionic/vue";
const props = defineProps(["pageName", "menu", "back", "diy"]);
const exist = props.pageName || props.diy;
</script>

<style scoped></style>
