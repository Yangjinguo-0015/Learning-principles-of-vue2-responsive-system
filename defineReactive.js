import Dep from "./Dep.js";
import { observe } from "./Observe.js";
import { isArray } from "./util.js";
export function defineReactive(obj, key, val, undefined, shallow, mock) {
  const dep = new Dep();
  const property = Object.getOwnPropertyDescriptor(obj, key);
  const getter = property && property.get;
  const setter = property && property.set;
  //configurable属性是否可以配置
  if (property && property.configurable === false) {
    return;
  }
  if (!getter || !setter || arguments.length == 2) {
    val = obj[key];
  }

  let childOb = observe(val, false, mock);
  Object.defineProperty(obj, key, {
    get: function activeGetter() {
      const value = getter ? getter.call(obj) : val;
      if (Dep.target) {
        dep.depend();
        if (childOb) {
          childOb.$dep.depend();
          if (isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set: function activeSetter(newValue) {
      const value = getter ? getter.call(obj) : val;
      if (setter) {
        setter.call(obj, newValue);
      } else if (getter) {
        return;
      } else {
        val = newValue;
      }
      if (newValue !== value) {
        val = newValue;
        childOb = !shallow && observe(newValue, false, mock);
        dep.notify();
      }
    },
  });
}
const dependArray = (value) => {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    if (e && e.__ob__) {
      e.__ob__.dep.depend();
    }
    if (isArray(e)) {
      dependArray(e);
    }
  }
};
