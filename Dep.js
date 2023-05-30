const pendingCleanupDeps = [];

export const cleanupDeps = () => {
  for (let i = 0; i < pendingCleanupDeps.length; i++) {
    const dep = pendingCleanupDeps[i];
    dep.subs = dep.subs.filter((s) => s);
    dep._pending = false;
  }
  pendingCleanupDeps.length = 0;
};
//消息订阅器
export default class Dep {
  // Dep.target 是当前正在执行的 watcher 实例，这是一个非常巧妙的设计！
  // 因为在同一时间只能有一个全局的 watcher
  static target = null;
  _pending = false;
  constructor() {
    this.subs = [];
  }
  // 让当前的 dep收集 watcher
  addSub(sub) {
    this.subs.push(sub);
  }
  removeSub(sub) {
    this.subs[this.subs.indexOf(sub)] = null;
    if (!this._pending) {
      this._pending = true;
      pendingCleanupDeps.push(this);
    }
  }
  depend(info) {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  }
  // 通知subs 中的所有 watcher 去更新
  notify() {
    this.subs.forEach((sub) => sub.update());
  }
}
Dep.target = null;
const targetStack = [];

export function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

export function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
