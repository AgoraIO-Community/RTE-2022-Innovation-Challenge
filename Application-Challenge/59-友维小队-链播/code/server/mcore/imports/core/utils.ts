export const promisefy = <T = any>(func: any, ctx?: any) => {
    return (...args: any[]) =>
        new Promise<T>((resolve, reject) => {
            func.call(ctx, ...args, (err: any, res: any) => {
                if (Array.isArray(res)) {
                    if (res[0] && typeof res[0] !== "object") {
                        err = res[0];
                        res = res[1];
                    }
                }
                if (err) return reject(err);
                resolve(res);
            });
        });
};

export const getDateHourTimestamp = (date: string, hourStr: string) => {
    return new Date(date + " " + hourStr).getTime();
};

export function paddingNum(a: number, len = 2): string | number {
    let numStr = String(a);
    while (numStr.length < len) {
        numStr = "0" + numStr;
    }
    return numStr;
}

export const formatSeconds = (
    value: number,
    hour = false /* 不会超过一个小时*/
) => {
    value = Math.round(value);
    const h = Math.floor(value / 3600);
    const m = Math.floor((value - h * 3600) / 60);
    const s = value % 60;
    return (hour ? [h, m, s] : [m, s]).map((e) => paddingNum(e)).join(":");
};

export const formatDateTime = (d = new Date(), joiner = ":") => {
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
        .map((v) => paddingNum(v))
        .join(joiner);
};
export const formatDateDay = (d = new Date(), joiner = "-") => {
    return [d.getFullYear(), d.getMonth() + 1, d.getDate()]
        .map((v) => paddingNum(v))
        .join(joiner);
};

export const formatDate = (
    d = new Date(),
    dayJoiner = "-",
    timeJoiner = ":"
) => {
    return formatDateDay(d, dayJoiner) + " " + formatDateTime(d, timeJoiner);
};

export const isPhone = (d = "") => {
    return /1[3-9][0-9]{9}/.test(d);
};

export const formatPeriod = (start: Date, end = new Date()) => {
    const sd = formatDateDay(start);
    const ed = formatDateDay(end);
    const st = formatDateTime(start);
    const et = formatDateTime(end);
    return `${sd} ${st} ~ ${sd === ed ? "" : ed + " "}${et}`;
};
