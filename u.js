/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* Utils
*/
var u = {};


// MISC
var trans = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;'
};
function escapeHTML(html) {
  return (html + '').replace(/[&<>\"\']/g, function(c) { return trans[c]; });
}

u.escapeHTML = escapeHTML;

u.extend = function() {
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var options;
  for (; i < length; i++) {
    if (options = arguments[i]) {
      for (var name in options) {
        if (!options.hasOwnProperty(name)) {
          continue;
        }
        var copy = options[name];

        if (copy !== undefined) {
          target[name] = copy;
        }
      }
    }
  }
  return target;  
};



// className
var cls = u.cls = {
  has: function(elem, className) {
    return (' ' + elem.className + ' ').indexOf(' ' + className + ' ') > -1;
  },

  add: function(elem, classNames) {
    var result = elem.className;
    classNames.split(/\s+/).forEach(function(className) {
      if (!cls.hasClass(elem, className)) {
        result += ' ' + className;
      }
    });
    elem.className = _cleanCls(result);
  },

  remove: function(elem, classNames) {
    var result = elem.className;
    classNames.split(/\s+/).forEach(function(className) {
      result = result
        .replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), ' ');
    });
    elem.className = _cleanCls(result);
  },

  toggle: function(elem, className, condition) {
    if (arguments.length < 3) {
      condition = !cls.has(elem, className);
    }
    condition ? cls.add(elem, className) : cls.remove(elem, className);
  }
};

function _cleanCls(result) {
  return result.trim().replace(/\s{2,}/g, ' ');
}



// Props
u.delegate = {
  prop: function(obj, propName, toObjName, toPropName, propDef) {
    toPropName = toPropName || propName;
    Object.defineProperty(obj, propName, u.extend({
      configurable: true,
      enumerable: true,
      set: function(value) {
        this[toObjName][toPropName] = value;
      },
      get: function() {
        return this[toObjName][toPropName];
      }
    }, propDef));
  },
  call: function(obj, funcName, toObjName, toFuncName) {
    toFuncName = toFuncName || funcName;
    obj[funcName] = function() {
      return this[toObjName][toFuncName].apply(this[toObjName], arguments);
    };
  }
};



// Types
u.is = {
  view: function(object) {
    return !!(object && object.isView);
  },
  element: function(object) {
    return !!(object && object.nodeType == 1);
  }
}

([
  ['func',   'Function'],
  ['array',  'Array'],
  ['bool',   'Boolean'],
  ['number', 'Number'],
  ['string', 'String'],
  ['date',   'Date'],
  ['number', 'Number']
]).forEach(function(pair) {
  var typeName = '[object ' + pair[1] + ']';
  u.is[pair[0]] = function(object) {
    return Object.prototype.toString.call(object) === typeName;
  };
});
  

module.exports = u;
