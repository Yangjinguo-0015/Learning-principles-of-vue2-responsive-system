//监听的数据值修改时，执行响应的回调函数，在Vue里面的更新模板内容。
//观察者
import Dep, { pushTarget, popTarget } from "./Dep.js";
import { isFunction, parsePath } from "./util.js";
class Watcher {
  //expOrFn是需要监听的表达式或函数
  constructor(vm, expOrFn, cb, options, isRenderWatcher) {
    this.$vm = vm;
    this.$exp = expOrFn;
    this.$cb = cb;
    if ((this.$vm = vm) && isRenderWatcher) {
      vm._watcher = this;
    }
    // options
    if (options) {
      this.user = !!options.user;
    } else {
      this.user = false;
    }

    if (isFunction(expOrFn)) {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
    }
    this.cb = cb;
    this.deps = [];
    this.newDeps = [];
    this.depIds = new Set();
    this.newDepIds = new Set();
    this.expression = "";
    this.value = this.get();
  }
  update() {
    this.run();
  }
  run() {
    const value = this.get();
    // if (value != this.value) {
    //   const oldValue = this.value;
    //   this.$cb(this.$vm, value, oldValue);
    // }
    const oldValue = this.value;
    this.$cb(this.$vm, value, oldValue);
  }
  get() {
    pushTarget(this); // 全局变量 订阅者 赋值
    let value;
    const vm = this.$vm;
    try {
      value = this.getter.call(vm, vm);
    } catch (e) {
      /**
       * 只有userWatcher的user属性是true
         表示是用户手动传入的回调函数，因此在执行cb回调函数时，要try、catch捕获异常
       */
      if (this.user) {
        throw new Error(`getter for watcher "${this.expression}"`);
      } else {
        throw e;
      }
    } finally {
      popTarget();
      this.cleanupDeps();
    }
    return value;
  }
  addDep(dep) {
    const id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  }

  cleanupDeps() {
    let i = this.deps.length;
    while (i--) {
      const dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    let tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  }
}
export default Watcher;
