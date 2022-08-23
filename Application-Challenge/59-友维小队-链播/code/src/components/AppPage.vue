<template>
    <ion-page>
        <slot name="head">
            <PageHeader
                :back="props.back"
                :menu="menu !== undefined"
                :page-name="props.pageName"
            >
                <slot name="buttons"></slot>
            </PageHeader>
        </slot>
        <ion-content v-bind="content" ref="body">
            <slot></slot>
        </ion-content>
        <ion-footer>
            <slot name="foot"></slot>
        </ion-footer>
    </ion-page>
</template>

<script lang="ts" setup>
import { useRouter } from "@/router";
import { IonPage, IonContent, IonFooter } from "@ionic/vue";
import { computed, ref } from "@vue/reactivity";

import { PageHeader } from ".";

const props = defineProps([
    "pageName",
    "autoFade",
    "back",
    "menu",
    "content",
    "bg",
]);
const content = computed(() =>
    Object.assign({ scrollY: false }, props.content)
);
const emit = defineEmits(["back"]);
const router = useRouter();

const body = ref();
defineExpose({
    getScroller() {
        return body.value?.$el.scrollEl;
    },
});
const bg = computed(() => props.bg || "transparent");
</script>

<style lang="scss" scoped>
ion-content {
    display: flex;
    flex-direction: column;
    // min-height: 100%;
}
ion-page {
    min-height: 100vh;
}
</style>
