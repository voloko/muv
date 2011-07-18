/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* View
*/
var u = require('./u');
var m = require('./m');
var _toString = Object.prototype.toString;

function v(markup, refs) {
  if (u.is.view(markup) || u.is.element(markup)) {
    return markup;
  }

  var item = markup.view ?
    createView(markup) :
    createElement(markup);

  for (var key in markup) {
    var value = markup[key];
    switch (key) {
      case 'tag':
        break;
      case 'as':
        refs && (refs[key] = value);
        break;
      case 'aslist':
        if (refs) {
          refs[key] ? (refs[key] = [value]) : refs[key].push(value);
        }
        break;
      case 'children':
        value.forEach(function(m) {
          var child = d(m, refs);
          if (!markup.view && u.is.view(child)) {
            child.attachTo(item);
          } else {
            item.appendChild(child);
          }
        });
        break;
      case 'listeners':
      case 'on':
        for (var type in value) {
          item.addEventListener(type, value[type]);
        }
        break;
      case 'text':
        item.appendChild(document.createTextNode(value));
        break;
      case 'style':
        item.style.cssText = style;
        break;
      default:
        item[key] = value;
    }
  }
  return element;
}

function _createView(markup) {
  var cls = u.is.string(markup.view) ? v[markup.view] : markup.view;
  return new cls(markup);
}

function _createElement(markup) {
  var element = document.createElement(markup.tag);
}

v.nearest = function(element) {
  while (element) {
    if (element['data-view']) { return element['data-view']; }
    element = element.parentNode;
  }
  return null;
};


var Base = v.Base = function(markup) {
  this._setup(markup);
  this._createDom(markup);
  this._init();
};
var bp = Base.prototype;
Object.defineProperty(bp, 'isView', {
  value: true,
  configurable: true,
  enumerable: true });

bp.dom = null;

[
  'className', 'parentNode', 'children',
  'innerHTML', 'scrollLeft', 'scrollTop'
].forEach(function(name) {
   u.delegate.prop(bp, name, 'dom');
});
u.delegate.prop(bp, 'style', 'dom', 'style', { get: undefined });
u.delegate.call(bp, 'getBoundingClientRect', 'dom');

bp._setup = function(markup) {};

bp._createDom = function(markup) {
  this.dom = v({ tag: markup.tag || 'div' });
};

bp._init = function() {
  this.dom['data-view'] = this;
};

u.delegate.call(bp, 'addEventListener', 'dom');
u.delegate.call(bp, 'removeEventListener', 'dom');
bp.trigger = function(eventSpec) {
  var e = document.createEvent("UIEvents");
  e.type = eventSpec.type;
  if (canBubble in eventSpec) e.canBubble = eventSpec.canBubble;
  if (cancelable in eventSpec) e.cancelable = eventSpec.cancelable;
  e.data = eventSpec.data;
  this.dom.dispatchEvent(e);
};

bp.appendChild = function(child) {
  this.dom.appendChild(child.dom || child);
  return child;
};

bp.removeChild = function(child) {
  this.dom.removeChild(child.dom || child);
  return child;
};

bp.insertBefore = function(child, refChild) {
  this.dom.insertBefore(child.dom || child, refChild.dom, refChild);
  return child;
};

bp.replaceChild = function(child, refChild) {
  this.dom.replaceChild(child.dom || child, refChild.dom, refChild);
  return child;
};

Object.defineProperty(bp, 'parentView', {
  configurable: true,
  enumerable: true,
  get: function() {
    return v.nearest(this.parentNode);
  } });

Object.defineProperty(bp, 'childViews', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.children.filter(function(child) {
      return u.is.view(child);
    });
  } });
  
Object.defineProperty(bp, 'model', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this._binding && this._binding.model;
  },
  set: function(model) {
    this.bind(model);
  } });
  
bp.defaultBindingOptions = {};
bp.bind = function(model, options) {
  if (this._binding) this._binding.destruct();
  if (model) {
    options = u.extend(this.defaultBindingOptions, options);
    options.model = model;
    options.view = this;
    this._binding = new m.Binding(options);
  } else {
    this._binding = null;
  }
};

module.exports = v;