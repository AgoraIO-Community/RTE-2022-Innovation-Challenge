<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useRouter } from "@/router";

import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonItem,
} from "@ionic/vue";
import { ref } from "vue";
import { useApi } from "../deps";
import { useEaseMobContactRequest } from "../service/easemob";
const m = useMeteor();
const router = useRouter();
const go = () => {
    router.to("/castroom/1");
};
const { requests, accept } = useEaseMobContactRequest();
const list = m.wrapObservale$(requests).refArr();

const acceptReq = (e: any) => {
    accept(e.from);
};
</script>
<template>
    <h-page page-name="好友请求">
        <h-list>
            <h-el v-for="r in list" :key="r.from">
                {{ r.status }}
                <h-btn size="small" slot="end" @click="acceptReq(r)"
                    >接受</h-btn
                >
            </h-el>
        </h-list>
    </h-page>
</template>

<style scoped></style>
