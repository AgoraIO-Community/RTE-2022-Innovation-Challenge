<template>
    <ion-app>
        <ion-router-outlet />
    </ion-app>
</template>

<script lang="ts" setup>
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { setupRest } from "./common/api";
import { setupMeteor } from "./common/meteor";
import { useOverlay } from "./common/overlay";
import { useRouter } from "./router";
import { setupMediaTool } from "@/services/media";
import { setupChat } from "./features/chat/service/easemob";
setupChat();
useRouter(true);
const overlay = useOverlay(true);
setupMeteor();
setupRest();
setupMediaTool(overlay);
const refresh = () => {
    location.href = "/";
    setTimeout(() => {
        location.reload();
    }, 200);
};
Accounts.onLogin(() => {
    Accounts.onLogout(() => {
        refresh();
    });
});
</script>
