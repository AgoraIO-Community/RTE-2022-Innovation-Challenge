<template>
    <ion-page>
        <ion-header
            :translucent="true"
            @click="$event.stopImmediatePropagation()"
        >
            <ion-toolbar>
                <h-btns slot="end">
                    <h-icon
                        @click="close"
                        :icon="closeOutline"
                        size="large"
                    ></h-icon>
                </h-btns>
                <ion-title>{{ props.title }}</ion-title>
            </ion-toolbar>
        </ion-header>
        <ion-content v-bind="content">
            <slot></slot>
        </ion-content>
        <ion-footer style="background-color: white">
            <slot name="foot"></slot>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts" setup>
import { hideModal } from "@/common/overlay";
import {
    IonToolbar,
    IonTitle,
    IonPage,
    IonContent,
    IonFooter,
    IonHeader,
} from "@ionic/vue";
import { computed } from "@vue/reactivity";
import { closeOutline } from "ionicons/icons";

const props = defineProps<{ title: string; content?: any }>();
const content = computed(() =>
    Object.assign({ scrollY: false }, props.content)
);
const close = () => {
    hideModal();
};
defineExpose({ close });
</script>

<style lang="scss" scoped>
ion-content {
    display: flex;
    flex-direction: column;
    // min-height: 100%;
}
</style>
