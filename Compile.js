import Watcher from "./Watcher.js";
//模板编译
class Compile {
  constructor(el, vm) {
    this.$el = document.querySelector(el);
    this.$vm = vm;
    this.fragement = null;
    if (!(this.$el instanceof HTMLElement)) {
      throw new TypeError("el must be an HTMLElement instance");
    }
    this.init();
  }
  init() {
    this.fragement = this.insertNodeByFragement(this.$el);
    this.compileTemplate(this.fragement);
    this.$el.appendChild(this.fragement);
  }
  insertNodeByFragement(el) {
    let fragement = document.createDocumentFragment();
    let child = el.firstChild;
    while (child) {
      fragement.appendChild(child);
      child = el.firstChild;
    }
    return fragement;
  }
  compileTemplate(el) {
    let childNodes = el.childNodes;
    let self = this;
    let reg = /\{\{(.*)\}\}/;
    Array.from(childNodes).forEach((node) => {
      let initText = node.textContent;
      if (self.isElementNode(node)) {
        self.compileElement(node);
      }
      if (self.isTextNode(node) && reg.test(initText)) {
        self.compileText(node, reg.exec(initText)[1]);
      }

      if (node.childNodes && node.childNodes.length) {
        self.compileTemplate(node);
      }
    });
  }
  isElementNode(node) {
    return node.nodeType == 1;
  }
  isTextNode(node) {
    return node.nodeType == 3;
  }
  isDirective(attrName) {
    return (
      attrName.startsWith("v-") ||
      attrName.startsWith(":") ||
      attrName.startsWith("@")
    );
  }
  isEventDircetive(attrName) {
    return attrName.startsWith("v-on") || attrName.startsWith("@");
  }
  isShowDirective(attrName) {
    return attrName.startsWith("v-show");
  }
  isModelDirective(attrName) {
    return attrName.startsWith("v-model");
  }
  isBindDirective(attrName) {
    return attrName.startsWith("v-bind") || attrName.startsWith(":");
  }
  compileElement(node) {
    let nodeAttrs = node.attributes;
    let self = this;
    Array.from(nodeAttrs).forEach((attr) => {
      let attrName = attr.name;
      let attrValue = attr.value;
      if (self.isDirective(attrName)) {
        if (self.isEventDircetive(attrName)) {
          self.compileEvent(node, attrName, attrValue);
        }
        if (self.isShowDirective(attrName)) {
          self.compileShowDirective(node, attrName, attrValue);
        }
        if (self.isModelDirective(attrName)) {
          self.compileModelDirective(node, attrName, attrValue);
        }
        if (self.isBindDirective(attrName)) {
          self.compileBindDirective(node, attrName, attrValue);
        }
      }
    });
  }
  compileEvent(node, attrName, attrValue) {
    //区分v-on和@
    let eventReg = /^(?:@|v-on:)([a-zA-Z_][a-zA-Z0-9_]*)$/g;
    let arr = eventReg.exec(attrName);
    let eventType = arr[1];
    let cb = this.$vm.methods && this.$vm.methods[attrValue];
    node.addEventListener(eventType, cb?.bind(this.$vm));
  }
  compileShowDirective(node, attrName, attrValue) {
    let bool = this.$vm[attrValue];
    let self = this;
    this.showUpdater(node, bool);
    new Watcher(this.$vm, attrValue, function (vm, value, oldValue) {
      self.showUpdater(node, value);
    });
  }
  compileModelDirective(node, attrName, attrValue) {
    let self = this;
    let oldValue = self.$vm[attrValue];
    this.modelUpdater(node, oldValue);
    new Watcher(this.$vm, attrValue, function (vm, value, oldValue) {
      self.modelUpdater(node, value);
    });
    node.addEventListener("input", function (e) {
      let newValue = e.target.value;
      self.modelUpdater(node, newValue);
      if (newValue !== oldValue) {
        self.$vm[attrValue] = newValue;
        oldValue = newValue;
      }
    });
  }
  modelUpdater(node, value) {
    node.value = value == undefined ? "" : value;
  }
  compileText(node, exp) {
    let text = this.$vm[exp];
    let self = this;
    this.updateText(node, text);
    new Watcher(this.$vm, exp, function (vm, value, oldValue) {
      self.updateText(node, value);
    });
  }
  compileBindDirective(node, attrName, attrValue) {
    let attr = attrName.split(":")[1];
    let exp = this.$vm[attrValue];
    let self = this;
    this.bindUpdater(node, attr, exp);
    new Watcher(this.$vm, attrValue, function (vm, value, oldValue) {
      self.bindUpdater(node, attr, value);
    });
  }
  bindUpdater(node, attr, exp) {
    if (exp) {
      node.setAttribute(attr, exp);
    } else {
      node.removeAttribute(attr);
    }
  }
  updateText(node, text) {
    node.textContent = text == undefined ? "" : text;
  }
  showUpdater(node, bool) {
    node.style.display = bool ? "block" : "none";
  }
}

export default Compile;
