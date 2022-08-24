<template>
    <h-note class="frow cnty" slot="helper" v-if="note">
        {{ note }}
        <h-icon
            class="icon mgl"
            :icon="helpCircleOutline"
            @click.stop="handleClick"
        />
    </h-note>
    <h-btn v-else fill="clear" class="h-help simple" @click.stop="handleClick">
        <h-icon class="icon" :icon="helpCircleOutline" />
    </h-btn>
</template>

<script lang="ts" setup>
import { useOverlay } from "@/common/overlay";
import { modalController } from "@ionic/vue";
import { useSlots } from "vue";
import { helpCircleOutline } from "ionicons/icons";

const props = defineProps<{ desc?: string; title?: string; note?: string }>();
const slots = useSlots();
if (!props.desc && !slots.default) {
    console.error(`help component or desc must provide one`);
}
const ub = useOverlay();
const handleClick = () => {
    if (slots.default) {
        return modalController
            .create({
                component: slots.default,
            })
            .then((m) => m.present());
    }
    ub.showWarn(props.desc, props.title ?? "提示");
};
</script>
<style scoped lang="scss">
.h-help {
    width: 24px;
    height: 24px;
    align-self: center;
    display: inline-block;
    overflow: hidden;
}

.icon {
    width: 24px;
    height: 24px;
}
</style>
