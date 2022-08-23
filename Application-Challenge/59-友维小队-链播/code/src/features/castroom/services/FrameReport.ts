import { interval, Observable } from "rxjs";
import { CastRoomService } from "./CastRoomService";
import { centerElement } from "./utils";

export class FrameReport {
    constructor(private serv: CastRoomService) {
        //
        this.sess.add(
            serv.event$$.subscribe((v) => {
                if (v.name === "cast-stream") {
                    if (v.data) {
                        this.sess.child("rep").add(
                            this.report(v.data).subscribe((v) => {
                                console.info(`rep-frame`, v);
                            })
                        );
                    } else {
                        this.sess.child("rep").run();
                    }
                }
            })
        );
    }
    get sess() {
        return this.serv.sess.child("frame-report");
    }
    private report(stream: MediaStream) {
        return new Observable((suber) => {
            const el = document.createElement("video");
            el.srcObject = stream;
            el.onerror = (err) => {
                console.log(err);
            };
            el.muted = true;
            el.style.display = "none";
            const canvas = document.createElement("canvas");
            const w1 = 180;
            const h1 = 180;
            canvas.width = w1;
            canvas.height = h1;
            const ctx = canvas.getContext("2d");

            suber.add(
                interval(10000).subscribe(() => {
                    if (stream.getVideoTracks().length === 0) {
                        return;
                    }
                    el.onplaying = () => {
                        setTimeout(() => {
                            const w = el.videoWidth;
                            const h = el.videoHeight;
                            let fr = "";
                            if (ctx) {
                                const { x, y, width, height } = centerElement(
                                    w,
                                    h,
                                    w1,
                                    h1,
                                    1
                                );
                                ctx.drawImage(
                                    el,
                                    0,
                                    0,
                                    w,
                                    h,
                                    x,
                                    y,
                                    width,
                                    height
                                );
                                fr = canvas.toDataURL("image/jpeg", 0.4);
                            }
                            this.updatePost(fr);
                            document.body.removeChild(el);
                            el.pause();
                        }, 500);
                        el.onplaying = null;
                    };
                    document.body.appendChild(el);
                    el.play();
                })
            );
        });
    }
    private updatePost(frame: string) {
        if (!frame) {
            return;
        }
        this.serv.info.updateRoom({ frame });
    }
}
