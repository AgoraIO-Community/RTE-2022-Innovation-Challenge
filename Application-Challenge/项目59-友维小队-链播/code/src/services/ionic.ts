import { onUnmounted } from "vue";
export const useDisableSwipeBack = () => {
    const Ionic = (window as any).Ionic;
    if (!Ionic) {
        return;
    }
    const ov = (window as any).Ionic?.config?.get("animated");
    Ionic.config.set("swipeBackEnabled", false);
    onUnmounted(() => {
        Ionic.config.set("swipeBackEnabled", ov);
    });
};
