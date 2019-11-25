function isUndef(v) {
    return v === undefined || v === null;
}

function isDef(v) {
    return v !== undefined && v !== null;
}

export {isUndef, isDef};
