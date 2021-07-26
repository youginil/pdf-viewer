function getEventPath(e: Event): Array<any> {
  if ('path' in e) {
    // @ts-ignore
    return e.path;
  }
  const path = [e.target];
  let elem = e.target as HTMLElement;
  while (elem.parentElement !== null) {
    path.push(elem.parentElement);
    elem = elem.parentElement;
  }
  path.push(document, window);
  return path;
}

export { getEventPath };
