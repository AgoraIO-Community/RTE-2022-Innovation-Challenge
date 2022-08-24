import { rest } from "@/common/api";
import { wrapObservale } from "@/common/meteor/rxjs-vue";
import { overlay } from "@/common/overlay";
import {
    BehaviorSubject,
    combineLatest,
    debounceTime,
    distinctUntilKeyChanged,
    map,
    Observable,
} from "rxjs";
import { CastRoomService } from "./CastRoomService";
import { RTCClientMine } from "./rtc";

export class LiveCast {
    private _rtc?: RTCClientMine;
    constructor(private serv: CastRoomService) {}
    get rtc() {
        if (this._rtc) {
            return this._rtc;
        }
        return (this._rtc = new RTCClientMine(this.serv.roomId));
    }
    private state$$ = new BehaviorSubject<{
        status: number;
        stream?: MediaStream;
    }>({
        status: 0,
    });
    public get isCasting$() {
        return wrapObservale(this.state$.pipe(map((v) => v.status === 1)));
    }
    public state$ = this.state$$.asObservable();
    public get state() {
        return this.state$$.value;
    }
    castStream$() {
        return new Observable<{ state: 0 | 1 | 2 }>((suber) => {
            let c: any;
            let published = false;
            let busying = false;
            rest.sequence("castroom", "publish", {
                spread: {
                    loading: "发布中...",
                },
            }).then(() => {
                if (suber.closed) {
                    return;
                }
                suber.add(
                    combineLatest({
                        stream: this.serv.captureStream$(),
                        record: this.serv.info.info$.pipe(
                            distinctUntilKeyChanged("session")
                        ),
                    })
                        .pipe(debounceTime(20))
                        .subscribe((v) => {
                            if (busying) {
                                return;
                            }
                            if (
                                !published &&
                                v.stream.stream &&
                                v.stream.stream.getTracks().length > 0 &&
                                v.record.session
                            ) {
                                published = true;
                                busying = true;
                                c = this.cast(v.stream.stream).subscribe(
                                    (s) => {
                                        if (s.state !== 1) {
                                            published = false;
                                            this.serv.event$$.next({
                                                name: "cast-stream",
                                            });
                                        } else if (s.state === 1) {
                                            this.serv.event$$.next({
                                                name: "cast-stream",
                                                data: v.stream.stream,
                                            });
                                        }
                                        busying = false;
                                    }
                                );
                            } else if (!v.record.session) {
                                suber.complete();
                                published = false;
                            } else if (published && v.stream.stream) {
                                busying = true;
                                const tracks = v.stream.stream.getTracks();
                                this.rtc.replaceTracks(tracks).finally(() => {
                                    busying = false;
                                });
                            }
                        })
                );
            });
            return () => {
                console.log(`closed sub`, c);
                if (this.state.status === 1) {
                    rest.sequence("castroom", "unpublish", {
                        quiet: true,
                    }).finally(() => {
                        c?.unsubscribe();
                    });
                }
            };
        });
    }
    private cast(stream: MediaStream) {
        return new Observable<{ state: 0 | 1 | 2 }>((suber) => {
            overlay.showLoading("请稍候");
            this.rtc
                .publishStream(stream)
                .then(() => {
                    overlay.hideLoading();
                    this.state$$.next({
                        status: 1,
                        stream,
                    });
                    suber.next({ state: 1 });
                })
                .catch(() => {
                    overlay.hideLoading();
                    overlay.showWarn(`发起直播失败`);
                });

            this.state$$.next({
                status: 2,
            });
            return () => {
                suber.next({ state: 0 });
                this.rtc.unpublish();
                this.state$$.next({
                    status: 0,
                });
            };
        });
    }
}
