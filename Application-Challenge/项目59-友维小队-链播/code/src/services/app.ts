import {
    BehaviorSubject,
    debounceTime,
    distinctUntilChanged,
    filter,
    Subject,
    take,
} from "rxjs";

import { App, BackButtonListenerEvent } from "@capacitor/app";

import { getLogger } from "hjcore";

const logger = getLogger("app.serv", 0);
const isActive$$ = new BehaviorSubject(true);
const windowResize$$ = new Subject<1 | 0>();
const clicked$$ = new BehaviorSubject(false);
const backButton$$ = new Subject<BackButtonListenerEvent>();

const app = {
    ready: false,
    event$: new Subject<any>(),
    isActive$: isActive$$.pipe(distinctUntilChanged(), debounceTime(1000)),
    isActive: true,
    resize$: windowResize$$,
    firstTouched: false,
    firstTouch$: clicked$$.pipe(
        filter((v) => !!v),
        take(1)
    ),
    backButton$: backButton$$.asObservable(),
};
App.removeAllListeners();
App.addListener("appStateChange", (ev) => {
    app.isActive = ev.isActive;
    isActive$$.next(ev.isActive);
    logger(ev);
});

windowResize$$
    .pipe(
        filter((v) => !!v),
        debounceTime(100)
    )
    .subscribe(() => {
        document.body?.classList?.remove("window-resizing");
        windowResize$$.next(0);
    });

window.onresize = () => {
    document.body?.classList?.add("window-resizing");
    windowResize$$.next(1);
};

(function () {
    const handle = () => {
        clicked$$.next(true);
        app.firstTouched = true;
        document.body.removeEventListener("touchstart", handle);
    };
    document.body.addEventListener("touchstart", handle, { capture: true });
    document.body.addEventListener("touchmove", handle, { capture: true });
})();

export const useAppService = () => {
    return app;
};
