<script lang="ts" setup>
import RoomList from "@/features/castroom/views/RoomList.vue";
</script>

<template>
    <h-page :content="{ scrollY: true }">
        <RoomList></RoomList>
    </h-page>
</template>

<style scoped lang="scss">
.nomore {
    font-size: 12px;
    text-align: center;
}
</style>
