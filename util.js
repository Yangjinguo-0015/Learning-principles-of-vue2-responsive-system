export const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

//检查对象是否有该属性
const hasOwnProperty = Object.prototype.hasOwnProperty;
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
export const hasProto = "__proto__" in {};

export function isValidArrayIndex(val) {
  const n = parseFloat(String(val));
  // isFinite 函数可确定数字是否是有限的合法数字
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}
export const isArray = Array.isArray;
export function isFunction(value) {
  return typeof value === "function";
}
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`);
export function parsePath(path) {
  if (bailRE.test(path)) {
    return;
  }
  const segments = path.split(".");
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return;
      obj = obj[segments[i]];
    }
    return obj;
  };
}
export function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}
