function getEventPath(e) {
    if ('path' in e) {
        return e.path;
    }
    const path = [e.target];
    let elem = e.target;
    while (elem.parentElement !== null) {
        path.push(elem.parentElement);
        elem = elem.parentElement;
    }
    path.push(document, window);
    return path;
}

export {getEventPath};
