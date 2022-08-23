import { loadingController } from "@ionic/vue";
import { Subject } from "rxjs";
import { TaskQueue } from "../utils";
const c = new Subject<any>();

c.subscribe((v) => {
    TaskQueue.get("loading-layer").push(async () => {
        let loader = await loadingController.getTop();
        if (!v) {
            if (loader) await loader.dismiss();
            return;
        }
        if (!loader) {
            loader = await loadingController.create(v);
            await loader.present();
        } else {
            loader.message = v.message;
            loader.cssClass = v.cssClass;
        }
    });
});
let delay: any;
export const showLoading = async (message = "请稍等...", header = "不好") => {
    delay && clearTimeout(delay);
    delay = setTimeout(() => {
        c.next({
            message,
            cssClass: "warning-pop",
        });
    }, 200);
};
export const hideLoading = async (force = false) => {
    if (force) {
        let l: HTMLIonLoadingElement | undefined;
        while ((l = await loadingController.getTop())) {
            await l.dismiss();
        }
        return;
    }
    delay && clearTimeout(delay);
    delay = setTimeout(() => {
        c.next(null);
    });
};

export const wrapPromisWithLoading = async <T = any>(
    p: Promise<T>,
    message?: string
) => {
    try {
        showLoading(message);
        const r = await p;
        hideLoading();
        return r;
    } catch (error) {
        console.error(error);
        hideLoading();
        throw error;
    }
};
