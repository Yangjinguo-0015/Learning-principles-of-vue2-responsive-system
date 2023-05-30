const def = function (target, key, value, enumerable) {
  Object.defineProperty(target, key, {
    value: value,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
};
export default def;
