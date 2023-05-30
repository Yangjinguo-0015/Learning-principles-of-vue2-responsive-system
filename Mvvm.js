import Observe from "./Observe.js";
import Compile from "./Compile.js";

class Mvvm {
  constructor(options) {
    this.$options = options || {};
    if (options?.data instanceof Function) {
      this.$data = options?.data() || {};
    } else {
      this.$data = options?.data || {};
    }
    this.proxyData(this.$data);
    this.methods = options?.methods || {};
    this.bindingThis(options.methods || {});
    this.vm = this;
    new Observe(this.$data);
    new Compile(options.el, this.vm);
  }
  bindingThis(obj) {
    for (let key of Object.keys(obj)) {
      this[key] = obj[key].bind(this);
    }
  }
  proxyData(data) {
    let self = this;
    Object.keys(data).forEach(function (key) {
      Object.defineProperty(self, key, {
        enumerable: false,
        configurable: true,
        get() {
          return data[key];
        },
        set(newValue) {
          data[key] = newValue;
        },
      });
    });
  }
}

export default Mvvm;
