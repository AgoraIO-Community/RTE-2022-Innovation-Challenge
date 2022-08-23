export * from "hjcore/browser";
export * from "../../../server/mcore/imports/core/utils";

export const fmtPhone = (phone: string) => {
    if (!phone) return "";
    return (
        phone.slice(0, 3) + " " + phone.slice(3, 7) + " " + phone.slice(7, 11)
    );
};

export const calcChange = <T = any>(
    ov: T,
    nv: Partial<T>,
    keys: string[],
    isDiff = (a: any, b: any) => (a ?? "") !== (b ?? "")
) => {
    if (typeof ov !== "object" || typeof nv !== "object") {
        throw new Error(`only compare object`);
    }
    const changed = {} as Partial<T>;
    let hasChange = false;
    keys.forEach((key) => {
        if (isDiff((nv as any)[key], (ov as any)[key])) {
            (changed as any)[key] = (nv as any)[key];
            hasChange = true;
        }
    });
    return hasChange ? changed : null;
};
