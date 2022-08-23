<script lang="ts" setup>
import { useApi } from "@/common/api";
import { ApiLink } from "@/common/shared";
import { useRouter } from "@/router";
import { ref } from "vue";
const api = useApi();
const canCreate = ref<ApiLink>();
api.request({ path: "castroom" }).then((res) => {
    console.log(res);
    canCreate.value = res.getLink("create");
});

const router = useRouter();
const goCreate = () => {
    router.to("/castroom/mana/crt", api.routerLink(canCreate.value));
};
</script>

<template>
    <h-nav size="small" fill="outline" class="mgv" @click="goCreate" v-if="canCreate"> 创建房间 </h-nav>
</template>

<style scoped lang="scss"></style>
