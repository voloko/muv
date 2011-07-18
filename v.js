/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* View
*/
var u = require('./u');
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
      case 'text':
        item.appendChild(document.createTextNode(value));
        break;
      case 'className':
      case 'innerHTML':
        item[key] = value;
        break;
      default:
        item.setAttribute(key, value);
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
  this._createDom();
  this._init();
};
var bp = Base.prototype;
Object.defineProperty(bp, 'isObject', { 
  value: true, 
  configurable: true,
  enumerable: true });
Object.defineProperty(bp, 'dom', { 
  writable: true, 
  configurable: true,
  enumerable: true });
u.delegate.prop(bp, 'className', 'dom');
u.delegate.prop(bp, 'parentNode', 'dom');
u.delegate.prop(bp, 'children', 'dom');
u.delegate.prop(bp, 'innerHTML', 'dom');
u.delegate.prop(bp, 'style', 'dom', 'style', { get: undefined });

bp._setup = function(markup) {};

bp._createDom = function() {
  this.dom = v({ tag: 'div' });
};

bp._init = function() {
  this.dom['data-view'] = this;
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


module.exports = v;