<template>
    <div class="profile">
        <h-avatar :uid="uid"> </h-avatar>
        <div class="user-info">
            <div class="user-name">
                <div class="name">
                    <h-uname :uid="uid"></h-uname>
                </div>
            </div>
            <div class="uuid">UID：{{ phone }}</div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
const m = useMeteor();
const props = defineProps<{
    uid: string;
}>();
const uo$ = m
    .wrapCursor$(Meteor.users.find(props.uid))
    .map((v) => v[0]?.profile.id);
const phone = uo$.refRef({ shallow: true });
</script>
<style scoped lang="scss">
.profile {
    background-color: var(--ion-color-primary);
    display: flex;
    padding: 16px;
    align-items: flex-end;
    color: var(--ion-color-primary-contrast);
    box-shadow: 0 2px 10px 0 rgb(25 25 100 / 5%);
    border-radius: 4px;
    margin: 12px 0;
    position: relative;

    ion-avatar {
        width: 64px;
        height: 64px;
    }
}

.user-info {
    padding-left: 16px;
    flex: 1;
}

.user-name {
    font-size: 20px;
    display: flex;

    .name {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 150px;
        margin-right: 4px;
        font-weight: 500;
    }

    ion-icon {
        font-size: 28px;
    }
}

.uuid {
    opacity: 0.6;
    font-size: 13px;
    margin-top: 8px;
}
</style>
