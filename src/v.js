/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* View
*/
var u = require('./u');
var m = require('./m');
var _toString = Object.prototype.toString;

function v(markup, refs) {
  if (u.is.view(markup) || u.is.node(markup)) {
    return markup;
  }

  var item = markup.view ?
    _createView(markup) :
    _createNode(markup);

  for (var key in markup) {
    var value = markup[key];
    switch (key) {
      case 'tag':
      case 'fragment':
        break;
      case 'as':
        refs && (refs[value] = item);
        break;
      case 'aslist':
        if (refs) {
          refs[value] ? (refs[value] = [item]) : refs[value].push(item);
        }
        break;
      case 'children':
        value.forEach(function(m) {
          if (m) {
            var child = v(m, refs);
            item.appendChild(child.dom || child);
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
        value && item.nodeType != 3 && 
          item.appendChild(document.createTextNode(markup.text));
        break;
      case 'style':
        item.style.cssText = value;
        break;
      default:
        item[key] = value;
    }
  }
  return item;
}

function _createView(markup) {
  var cls = u.is.string(markup.view) ? v[markup.view] : markup.view;
  return new cls(markup);
}

function _createNode(markup) {
  return markup.fragment ? document.createDocumentFragment() :
         markup.tag      ? document.createElement(markup.tag) :
         markup.text     ? document.createTextNode(markup.text) :
                           document.createElement('div');
}

v.nearest = function(element) {
  while (element) {
    if (element['data-view']) { return element['data-view']; }
    element = element.parentNode;
  }
  return null;
};

v.destructAll = function(element) {
  var items = element.querySelectorAll('[data-isView]');
  for (var i = 0; i < items.length; i++) {
    items[i]['data-view'].destruct();
  };
};


var Base = v.Base = function(markup) {
  this._setup(markup);
  this._createDom(markup);
  this._init();
};
var p = Base.prototype;
Object.defineProperty(p, 'isView', {
  value: true,
  configurable: true,
  enumerable: true });

p.dom = null;

[
  'className', 'parentNode', 'children',
  'innerHTML', 'scrollLeft', 'scrollTop',
  'firstChild', 'lastChild', 'nextSibling',
  'prevSibling'
].forEach(function(name) {
   u.delegate.prop(p, name, 'dom');
});
u.delegate.prop(p, 'style', 'dom', 'style', { get: undefined });
u.delegate.call(p, 'getBoundingClientRect', 'dom');

p._setup = function(markup) {};

p.defaultClassName = '';
p._createDom = function(markup) {
  this.dom = v({ tag: markup.tag || 'div' });
  this.defaultClassName && (this.className = this.defaultClassName);
};

p._init = function() {
  this.dom['data-view'] = this;
  this.dom.setAttribute('data-isView', true);
};

u.delegate.call(p, 'addEventListener', 'dom');
u.delegate.call(p, 'removeEventListener', 'dom');
p.trigger = function(eventSpec) {
  var e = document.createEvent("UIEvents");
  e.initUIEvent(eventSpec.type, eventSpec.canBubble, eventSpec.cancelable, window);
  e.data = eventSpec;
  this.dom.dispatchEvent(e);
};

p.appendChild = function(child) {
  this.dom.appendChild(child.dom || child);
  return child;
};

p.removeChild = function(child) {
  this.dom.removeChild(child.dom || child);
  return child;
};

p.insertBefore = function(child, refChild) {
  this.dom.insertBefore(child.dom || child, refChild.dom || refChild);
  return child;
};

p.replaceChild = function(child, refChild) {
  this.dom.replaceChild(child.dom || child, refChild.dom || refChild);
  return refChild;
};

Object.defineProperty(p, 'childViews', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.children.filter(function(child) {
      return u.is.view(child);
    });
  } });

Object.defineProperty(p, 'parentView', {
  configurable: true,
  enumerable: true,
  get: function() {
    return v.nearest(this.parentNode);
  } });

Object.defineProperty(p, 'model', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this._binding && this._binding.model;
  },
  set: function(model) {
    this.bindModel(model);
  } });

p.defaultBindingOptions = {};
p.bindModel = function(model, options) {
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

p.destruct = function() {
  if (this.destructed) return;
  this.destructed = true;
  if (this._binding) this._binding.destruct();
};


Base.createClass = function() {
  return u.createClass(Base);
};

module.exports = v;