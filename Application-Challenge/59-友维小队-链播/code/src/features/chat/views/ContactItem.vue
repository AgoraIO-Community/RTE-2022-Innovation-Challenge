<script lang="ts" setup>
import { useMeteor } from "@/common/meteor";
import { useOverlay } from "@/common/overlay";
import { useRouter } from "@/router";

const m = useMeteor();
const props = defineProps<{ uid: string }>();
const ok = m.subscribe$("user.info.id", props.uid).refRef();
const u = m
    .wrapCursor$(Meteor.users.find({ "profile.id": props.uid }))
    .map((v) => v[0])
    .tap(console.error)
    .refRef({ shallow: true });
const overlay = useOverlay();
const router = useRouter();
const tryContact = async () => {
    if (!ok.value || !u.value?._id) {
        return;
    }
    const d = await overlay.showActionSheet([{ text: "聊天", data: 1 }]);
    if (d === 1) {
        console.info(`start chat with ${u.value?._id}`);
        router.to("/chat/p2p/" + u.value.profile!.id, {
            query: { f: "contacts" },
        });
    }
};
</script>
<template>
    <h-el class="mgv" @click="tryContact">
        <template v-if="ok && u">
            <h-avatar slot="start" :uid="u._id"></h-avatar>
            <h-uname class="mgl" :uid="u._id"></h-uname>
        </template>
        <template v-else>
            <h-skeleton :animated="true"></h-skeleton>
        </template>
    </h-el>
</template>

<style scoped></style>
