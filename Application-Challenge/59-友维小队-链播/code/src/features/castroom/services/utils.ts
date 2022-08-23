import {  Observable } from "rxjs";
import {  toRaw, watch } from "vue";

export const centerElement = (
    w: number,
    h: number,
    tw: number,
    th: number,
    fm: 0 | 1
) => {
    let x = 0;
    let y = 0;
    let fw = tw;
    let fh = th;
    const ret = () => {
        const v = {
            x,
            y,
            width: fw,
            height: fh,
        };
        console.log({ w, h, tw, th }, "=>", v);
        return v;
    };
    if (w <= 0 || h <= 0 || tw <= 0 || th <= 0) {
        return ret();
    }
    const r1 = w / h;
    const tr = tw / th;
    let r = tw / w;
    switch (fm) {
        case 0:
            if (r1 > tr) {
                // 宽度优先
                fh = Math.round(h * r);
                y = Math.round((th - fh) / 2);
            } else {
                r = th / h;
                fw = Math.round(w * r);
                x = Math.round((tw - fw) / 2);
            }
            break;
        case 1:
            if (r1 > tr) {
                r = th / h;
                fw = Math.round(w * r);
                x = Math.round((tw - fw) / 2);
            } else {
                fh = Math.round(h * r);
                y = Math.round((th - fh) / 2);
            }
            break;
    }
    return ret();
};

export const getAvatar = (u?: { avatar?: string } | string) => {
    if (typeof u === "string") {
        return u;
    }
    return u?.avatar || "/images/avatars/def.png";
};

export const assign = (t: any, s: any) => {
    Object.keys(s).forEach((key) => {
        t[key] = toRaw(s[key]);
    });
};

export const observeReactive$ = <T = any>(source: T, immediate = false) =>
    new Observable<{ nv: T; ov: T }>((suber) => {
        const w = watch(
            source as any,
            (nv: T, ov: T) => {
                suber.next({ nv, ov });
            },
            { immediate }
        );
        return () => w();
    });
