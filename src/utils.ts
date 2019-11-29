function isUndef(v: any): boolean {
    return v === undefined || v === null;
}

function isDef(v: any): boolean {
    return v !== undefined && v !== null;
}

export {isUndef, isDef};
