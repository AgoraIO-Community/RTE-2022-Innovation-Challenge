import { Endable } from "@/common/utils";
import {
    alertController,
    toastController,
    ToastOptions,
    AlertOptions,
} from "@ionic/vue";
const warns = new Set<HTMLIonAlertElement>();
export const showWarn = (
    message = "似乎不太对",
    header = "不好",
    op?: AlertOptions,
    sess?: Endable
) =>
    new Promise((resolve, reject) => {
        const buttons = ["确认"];
        alertController
            .create({
                header,
                message,
                cssClass: "warning-pop",
                buttons,

                ...op,
            })
            .then((alert) => {
                if (sess) {
                    sess.addEnder(() => alert.dismiss());
                }
                if (warns.size > 2) {
                    for (const w of warns) {
                        w.dismiss();
                    }
                    return;
                }
                warns.add(alert);
                alert.onDidDismiss().then(() => {
                    warns.delete(alert);
                });
                return alert.present();
            })
            .then(resolve)
            .catch(reject);
    });
export const showConfirm = (
    message = "似乎不太对",
    header = "警告",
    opts?: { okText?: string; cancelText?: string }
) =>
    new Promise<boolean>((resolve) => {
        let choice = false;
        const opt = { okText: "确认", cancelText: "取消", ...opts };
        alertController
            .create({
                header,
                message,
                cssClass: "confirm-pop",
                buttons: [
                    {
                        text: opt.cancelText,
                        handler() {
                            choice = false;
                        },
                    },
                    {
                        text: opt.okText,
                        handler() {
                            choice = true;
                        },
                    },
                ],
            })
            .then((alert) => {
                alert.onDidDismiss().then(() => resolve(choice));
                return alert.present();
            });
    });

export const showToast = async (message: string, op?: ToastOptions) => {
    const t = await toastController.create({
        message,
        cssClass: "h-toast",
        position: "middle",
        duration: 2000,
        ...op,
    });
    await t.present();

    return {
        item: t,
        stop() {
            t.dismiss();
        },
    };
};

export const showInput = function <T = any>(
    name: string,
    def = "",
    header = "属性修改",
    multi = false,
    opts?: { attrs: { [key: string]: string | number } }
) {
    return new Promise<string>((resolve) => {
        let el: any;
        let result = "";
        alertController
            .create({
                header,
                message: `
            <div class='pd'>
                <label class='${
                    multi ? "fcol" : "frow"
                } cnty alert-input'> ${name}:<${
                    multi ? "ion-textarea" : "ion-input"
                } /></label>
            </div>
          `,
                buttons: [
                    {
                        text: "取消",
                    },
                    {
                        text: "确认",
                        handler() {
                            result = el.value;
                        },
                    },
                ],
            })
            .then((modal) => {
                el = modal.querySelector(
                    multi ? "textarea" : "input"
                ) as HTMLInputElement;
                el.value = def;
                if (opts?.attrs) {
                    Object.keys(opts.attrs).forEach((key) => {
                        el.setAttribute(key, opts.attrs[key]);
                    });
                }
                modal.present().then(() => {
                    el.focus();
                });
                modal.onDidDismiss().then(() => {
                    resolve(result);
                });
            });
    });
};

export function multiPrompt<T = any>(
    header: string,
    inputs: Array<{
        name: string;
        val?: string;
        key?: string;
        required?: any;
        type?: string;
        tip?: string;
    }>,
    cssClass = ""
) {
    return new Promise<T>((resolve) => {
        const res: any = {};
        inputs.forEach((el) => {
            if (el.key)
                res[el.key] = {
                    value: el.val || "",
                    required: !!el.required,
                };
        });
        const inner = inputs
            .map(
                (el) => `<ion-item class='input-row'>
      <${el.key ? "ion-label" : "span"} position=floating>${el.name}:</${
                    el.key ? "ion-label" : "span"
                }> ${
                    !el.key
                        ? `<span>${el.val}</span>`
                        : `<ion-input name=${el.key} placeholder="${
                              el.tip || ""
                          }" class='by-text-input' value='${
                              el.val || ""
                          }' type="${el.type || "text"}" /'>`
                }
        </ion-item>`
            )
            .join("");
        let el: HTMLIonAlertElement;
        alertController
            .create({
                cssClass,
                header,
                message: `<div class='alert-content'>
                 </div>`,
                backdropDismiss: false,
                buttons: [
                    {
                        text: "取消",
                        role: "cancel",
                        cssClass: "secondary",
                        handler: (blah) => {
                            resolve(null as any);
                        },
                    },
                    {
                        text: "确定",
                        handler: () => {
                            const result = {} as any;
                            for (const elem of Array.from(
                                el.querySelectorAll("input")
                            )) {
                                if (!elem.value && res[elem.name].required) {
                                    // handle error
                                    return false;
                                }
                                result[elem.name] = elem.value;
                            }
                            resolve(
                                (Object.keys(result).length > 0
                                    ? result
                                    : "") as any
                            );
                        },
                    },
                ],
            })
            .then((alertEl) => {
                el = alertEl;
                alertEl.querySelector(".alert-content")!.innerHTML = inner;
                return alertEl.present();
            });
    });
}

export const showSuccess = async (message: string) => {
    const cssClass = "h-success-modal";
    const buttons = [
        {
            text: "我知道了",
            role: "ok",
        },
    ] as any[];
    const alert = await alertController.create({
        cssClass,
        backdropDismiss: false,
        message: `<div class='alert-content fcol cnty'>
            <img src="/assets/icon/success-tick.svg">
            <div class=tip>${message}</div>
        </div>`,
        buttons,
    });
    alert.present();
};
