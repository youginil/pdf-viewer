export function isUndef(v: any): boolean {
    return v === undefined || v === null;
}

export function isDef(v: any): boolean {
    return v !== undefined && v !== null;
}

export function extendObject(target: {[key: string]: any}, source: {[key: string]: any}) {
    Object.keys(source).forEach((k) => {
        target[k] = source[k];
    });
}
