import { REACT_TEXT } from './stants';
function createTextElement(text) {
  const element = typeof text === 'string' || typeof text === 'number' ? {
    content: text,
    type: REACT_TEXT,
    $$typeof: REACT_TEXT
  } : text;
  return element
}

function shallowEqual(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== typeof b || typeof a !== 'object' || a === null || b === null) {
    return false;
  }
  let keysA = Object.keys(a);
  let keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (let key of keysA) {
    if (!b.hasOwnProperty(key) || !Object.is(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

export {
  createTextElement,
  shallowEqual
}