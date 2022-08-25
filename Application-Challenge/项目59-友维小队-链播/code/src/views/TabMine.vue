<script lang="ts" setup>
import RoomCreatedList from "@/features/castroom/views/RoomCreatedList.vue";
import RoomCreateBtn from "@/features/castroom/views/RoomCreateBtn.vue";
</script>

<template>
    <h-page :content="{ scrollY: 'auto' }" pageName="我的直播间">
        <h-view logined>
            <RoomCreatedList>
                <RoomCreateBtn btn></RoomCreateBtn>
            </RoomCreatedList>
        </h-view>
    </h-page>
</template>

<style scoped lang="scss">
</style>
