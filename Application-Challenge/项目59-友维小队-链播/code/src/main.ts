import { createApp } from "vue";
import App from "./App.vue";

import { IonicVue } from "@ionic/vue";
import Konva from "vue-konva";

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

/* Theme variables */
import "./theme/variables.css";
import "./theme/global.scss";

import { setupRouter } from "./router";
import { useCustomComponent } from "./components";

const app = createApp(App).use(IonicVue).use(Konva);
useCustomComponent(app);
setupRouter(app);
