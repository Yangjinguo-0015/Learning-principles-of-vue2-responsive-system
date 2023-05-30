// Observer 类就是用来 做数据响应式 的，
// 在它内部区分了数据是 对象 还是 数组 ，然后执行不同的响应式方案。
// 这里的主要工作是递归地监听对象上的所有属性，在属性值改变的时候，触发相应的Watcher
import Dep from "./Dep.js";
import def from "./def.js";
import { defineReactive } from "./defineReactive.js";
import { arrayMethods } from "./array.js";
import {
  hasOwn,
  hasProto,
  isValidArrayIndex,
  isArray,
  isPlainObject,
} from "./util.js";
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);
const NO_INITIAL_VALUE = {};
class Observe {
  /** value表示观察的值
   *  shallow参数表示是否进行浅层观察
   *  ssrMockReactivity参数表示是否在服务器端模拟响应式更新
   */
  constructor(value, shallow = false, mock = false) {
    this.$dep = new Dep();
    this.$mock = mock;
    def(value, "_ob_", this); //将Observer实例挂载到这个属性上
    if (isArray(value)) {
      //处理数组
      if (hasProto) {
        value.__proto__ = arrayMethods;
      } else {
        for (let i = 0, l = arrayKeys.length; i < l; i++) {
          const key = arrayKeys[i];
          def(value, key, arrayMethods[key]);
        }
      }
      if (!shallow) {
        this.observeArray(value);
      }
    } else {
      //处理对象
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        defineReactive(value, key, NO_INITIAL_VALUE, undefined, shallow, mock);
      }
    }
  }
  observeArray(value) {
    for (let i = 0, l = value.length; i < l; i++) {
      observe(value[i], false, this.$mock);
    }
  }
}
export function observe(value, shallow, ssrMockReactivity) {
  if (value && hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    return value.__ob__;
  }
  if (isArray(value) || isPlainObject(value))
    return new Observe(value, shallow, ssrMockReactivity);
}
const set = function (target, key, value) {
  const ob = target._ob_;
  if (isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, value);
    if (ob && !ob.shallow && ob.mock) {
      observe(value, false, true);
    }
    return value;
  }
  if (key in target && !(key in Object.prototype)) {
    target[key] = value;
    return value;
  }
  if (!ob) {
    target[key] = val;
    return val;
  }
  defineReactive(ob.value, key, value, undefined, ob.shallow, ob.mock);
  ob.dep.notify();
  return val;
};
export default Observe;
