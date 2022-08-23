<script lang="ts" setup>
import { useRouter } from "@/router";
import { computed, ref } from "vue";
import { CastRoomShowTypeDesc } from "../deps";
import { radioButtonOn, radioButtonOff } from "ionicons/icons";
const props = defineProps<{
    single: boolean;
    info: {
        _id: string;
        title: string;
        desc: string;
        post: {
            hoz: string;
            ver: string;
        };
        type: string;
        online?: boolean;
    };
}>();
const router = useRouter();
const go = () => {
    router.to(`/castroom/${props.info._id}`);
};
const src = computed(() =>
    props.single ? props.info.post.hoz : props.info.post.ver
);
const typeName = computed(() => {
    return CastRoomShowTypeDesc[props.info.type]?.name || "  ";
});
</script>

<template>
    <h-view :class="{ single: props.single }" @click="go">
        <!-- <h-view>
            {{ info.title }}
        </h-view> -->
        <h-view wrapper class="fcol post">
            <h-icon
                color="success"
                v-if="info.online"
                size="small"
                class="online-mark"
                :icon="radioButtonOn"
            ></h-icon>
            <h-chip class="room-type-chip">
                <h-txt label>
                    {{ typeName }}
                </h-txt>
            </h-chip>
            <h-img class="box" :src="src"></h-img>
            <h-view class="desc">
                {{ info.title }}
            </h-view>
        </h-view>
    </h-view>
</template>

<style scoped lang="scss">
.room-type-chip {
    position: absolute;
    background-color: rgba(68, 64, 64, 0.4);
    color: rgb(243, 217, 26);
}

.single .post {
    max-height: 200px;
    height: 180px;
    width: 100%;
}

.online-mark {
    position: absolute;
    right: 4px;
    top: 4px;
}
.single .box {
    height: 180px;
    max-height: 200px;
}

.box {
    width: 100%;
    height: 280px;
    object-fit: cover;
}

.post {
    max-width: 100%;
    height: 280px;
    object-fit: cover;
    position: relative;
    overflow: hidden;
}

.desc {
    position: absolute;
    bottom: 0;
    width: 100px;
    right: 0;
    background-color: rgba(68, 64, 64, 0.4);
    color: rgb(234, 233, 232);
    padding: 10px;
}
</style>
