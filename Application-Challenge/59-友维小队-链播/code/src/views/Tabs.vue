<template>
    <h-page>
        <ion-tabs>
            <ion-router-outlet></ion-router-outlet>
            <ion-tab-bar slot="bottom">
                <ion-tab-button tab="tab1" href="/tabs/tab1">
                    <ion-icon :icon="homeOutline" />
                    <ion-label>爱导</ion-label>
                </ion-tab-button>
                <ion-tab-button tab="tab2" href="/tabs/tab2">
                    <ion-icon :icon="starOutline" />
                    <ion-label>收藏</ion-label>
                </ion-tab-button>
                <ion-tab-button tab="mineroom" href="/tabs/mineroom">
                    <ion-icon
                        style="width: 40px; height: 40px"
                        :icon="playCircleOutline"
                    />
                </ion-tab-button>

                <ion-tab-button tab="message" href="/tabs/message">
                    <ChatTab></ChatTab>
                </ion-tab-button>

                <ion-tab-button tab="tab3" href="/tabs/tab3">
                    <ion-icon :icon="personOutline" />
                    <ion-label>我的</ion-label>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </h-page>
</template>

<script lang="ts" setup>
import {
    IonTabBar,
    IonTabButton,
    IonTabs,
    IonLabel,
    IonIcon,
    IonRouterOutlet,
} from "@ionic/vue";
import {
    personOutline,
    starOutline,
    homeOutline,
    playCircleOutline,
    chatboxOutline,
} from "ionicons/icons";
import ChatTab from "@/features/chat/views/ChatTab.vue";
</script>
