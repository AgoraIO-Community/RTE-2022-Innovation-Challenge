<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useRouter } from "@/router";
import ContactItem from "../views/ContactItem.vue";
import { useApi } from "../deps";
import { useEaseMobContacts } from "../service/easemob";

const router = useRouter();
const go = () => {
    router.to("/castroom/1");
};
const m = useMeteor();
const api = useApi();
const [searchApi] = api.reqLink("user/rel", ["search"]);
const { reqNum$, list$ } = useEaseMobContacts();
const goSearch = () => {
    router.to("/chat/contacts/search", api.routerLink(searchApi.value));
};
const reqNum = m.wrapObservale$(reqNum$).refRef();
const list = m.wrapObservale$(list$).refArr({ shallow: true });

</script>
<template>
    <h-page>
        <template #head>
            <h-header page-name="通讯录">
                <h-nav v-if="searchApi" btn @click="goSearch">搜索</h-nav>
            </h-header>
        </template>
        <h-nav btn expand="block" url="/chat/contacts/req" v-if="reqNum" fill="outline">
            {{ reqNum }}条请求待处理
        </h-nav>
        <h-list>
            <ContactItem v-for="id in list" :key="id" :uid="id"> </ContactItem>
        </h-list>
    </h-page>
</template>

<style scoped></style>
