import { ModalOptions, OverlayEventDetail } from '@ionic/core';
import {
    modalController,
    toastController,
    ToastOptions,
    actionSheetController,
} from '@ionic/vue';

export const showModal = async function <T = any>(opts: ModalOptions) {
    const modal = await modalController.create(opts);
    await modal.present();
    return {
        result: new Promise<OverlayEventDetail<T>>((resolve) => {
            modal.onDidDismiss().then((v) => {
                resolve(v);
            });
        }),
        modal,
    };
};

export const hideModal = async function (d?: any) {
    const modal = await modalController.getTop();
    modal?.dismiss(d);
};

export const showPush = async (
    message: string,
    buttonText: string,
    header?: string
) => {
    const opt = {
        header,
        message,
        position: 'top',
        buttons: [
            {
                text: buttonText,
                role: 'cancel',
                // handler: () => {

                // }
            },
        ],
    } as ToastOptions;
    const toast = await toastController.create(opt);
    await toast.present();
    return toast;
};

export const showActionSheet = async <T = any>(
    buttons: Array<{
        text: string;
        data: T;
        role?: 'cancel' | 'destructive' | 'selected' | string;
    }>,
    header = '请选择',
    opts?: { required?: boolean }
) => {
    return new Promise<T>((res) => {
        actionSheetController
            .create({
                header,
                // subHeader?: string;
                // cssClass?: string | string[];
                buttons,
                backdropDismiss: !opts?.required,
                // translucent?: boolean;
                animated: true,
                // mode?: Mode;
                // keyboardClose?: boolean;
                // id?: string;
                // htmlAttributes?: ActionSheetAttributes;
                // enterAnimation?: AnimationBuilder;
                // leaveAnimation?: AnimationBuilder;
            })
            .then((sheet) => {
                sheet.present();
                sheet.onDidDismiss().then((v) => {
                    res(v.data);
                });
            });
    });
};
