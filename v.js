/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* View
*/
var u = require('./u');
var _toString = Object.prototype.toString;

function v(markup, refs) {
  if (markup.vuew) {
    return createView(markup, refs);
  } if (markup.tag) {
    return createElement(markup, refs);
  }
}

function createView(markup, refs) {
  var cls = resolveView(markup.view);
}

function resolveView(view) {
  
}

function createElement(markup, refs) {
  var element = document.createElement(markup.tag);
  for (var key in markup) {
    var value = markup[key];
    switch (key) {
      case 'tag':
        break;
      case 'as':
        refs && (refs[key] = value);
        break;
      case 'children':
        value.forEach(function(m) {
          element.appendChild(d(m, refs));
        });
        break;
      case 'text':
        element.appendChild(document.createTextNode(value));
        break;
      case 'className':
      case 'innerHTML':
        element[key] = value;
        break;
      default:
        element.setAttribute(key, value);
    }
  }
  return element;
}

var View = {};


module.exports = v;