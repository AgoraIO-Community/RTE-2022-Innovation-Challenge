import { BehaviorSubject, debounceTime, Observable } from "rxjs";

class WebrtcService {
    public localStream$$ = new BehaviorSubject<MediaStream | null>(null);
    public localStream$ = this.localStream$$.pipe();
    constructor() {
        //
    }
    private streamSubers = new Set<any>();
    getLocalStream$(
        conf$: Observable<{
            video?: {
                width: number;
                height: number;
                facingMode?: "user" | "environment";
            };
            audio?: any;
        }>
    ): Observable<{ stream?: MediaStream; error?: any }> {
        return new Observable((suber) => {
            this.streamSubers.add(suber);
            suber.add(() => this.streamSubers.delete(suber));
            const clear = (force = false) => {
                if (!this.streamSubers.size || force) {
                    console.info(
                        `try clear local stream sub ${this.streamSubers.size} ${force}`
                    );
                    this.closeLocalStream();
                }
            };
            if (this.streamSubers.size > 1) {
                console.log(`reuse localStream`);
                suber.add(
                    this.localStream$.subscribe((s) =>
                        suber.next({
                            stream: s ?? undefined,
                        })
                    )
                );
            } else {
                console.warn(`use local stream`);
                suber.add(
                    conf$.pipe(debounceTime(500)).subscribe((v) => {
                        console.log(`sub log ------ `, v);
                        clear(true);
                        if (suber.closed) {
                            return;
                        }
                        if (v.audio || v.video) {
                            console.info(`localstream`, v);
                            navigator.mediaDevices
                                .getUserMedia(v)
                                .then((s) => {
                                    console.info(`stream captured --- `, s);
                                    if (suber.closed) {
                                        console.log(`suber closed dddddd`);
                                        clear();
                                        return;
                                    }
                                    suber.next({
                                        stream: s,
                                    });
                                    this.localStream$$.next(s);
                                })
                                .catch((err) => {
                                    console.error(err);
                                    suber.next({
                                        error: err,
                                    });
                                });
                        }
                    })
                );
            }
            return () => {
                setTimeout(() => {
                    clear();
                });
            };
        });
    }
    closeLocalStream(isDestroy = false) {
        if (this.localStream$$.value) {
            console.info(`destroy local streaming`);
            const s = this.localStream$$.value;
            s.getTracks().forEach((el) => el.stop());
            this.localStream$$.next(null);
        } else {
            console.info(`skip stream check`);
        }
        if (isDestroy) {
            this.streamSubers.forEach((el) => el.complete());
            this.streamSubers.clear();
        }
    }
}

export const userMedia = new WebrtcService();
