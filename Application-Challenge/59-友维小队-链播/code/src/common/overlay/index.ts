export * from './alert';
export * from './loading';
export * from './modal';

import { InjectionKey, provide, inject } from 'vue';
import * as alerts from './alert';
import * as loadings from './loading';
import * as modals from './modal';

export const overlay = { ...alerts, ...loadings, ...modals };

const overlayInjectKey: InjectionKey<typeof overlay> = Symbol();
export const useOverlay = (isProvider = false, serv = overlay) => {
    if (isProvider) {
        provide(overlayInjectKey, serv);
    } else {
        serv = inject(overlayInjectKey)!;
    }
    return serv;
};
