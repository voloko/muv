/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* Utils
*/
var u = { guid: 1 };


// MISC
function escapeHTML(html) {
  return (html + '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

u.escapeHTML = escapeHTML;

u.extend = function() {
  var target = arguments[0] || {};
  for (var i = 1; i < arguments.length; i++) {
    var options = arguments[i];
    for (var name in options || {}) {
      if (options[name] !== undefined) {
        target[name] = options[name];
      }
    }
  }
  return target;
};

var slice = Array.prototype.slice;
u.bind = function(fun, context) {
  if (fun.bind) {
    return fun.bind.apply(fun, slice.call(arguments, 1));
  }
  var args = slice.call(arguments, 2);
  return args.length ?
    function() {
      return fun.apply(context || this, args.concat(slice.call(arguments, 0)));
    } :
    function() {
      return fn.apply(context || this, arguments);
    };
};

u.bindOnce = function(fun, context) {
  fun.huid = fun.huid || u.guid++;
  var bindingName = '__bind_' + fun.huid;
  context[bindingName] = context[bindingName] || u.bind(fun.bind, context);
  return context[bindingName];
};

function _timer(fun, timeout, debounce) {
  var running;
  return function() {
    // last call params
    var context = this;
    var args = arguments;

    if (debounce && running) {
      running = clearTimeout(running);
    }
    running = running || setTimeout(function() {
      running = null;
      fun.apply(context, args);
    }, timeout);
  };
}

u.throttle = function(fun, timeout) {
  return _timer(fun, timeout);
};

u.debounce = function(fun, timeout) {
  return _timer(fun, timeout, true);
};

function tmp() {}

u.createClass = function(Base) {
  function NewClass() {
    Base.apply(this, arguments);
  };

  NewClass.prototype = Object.create(Base.prototype);
  NewClass.prototype.constructor = NewClass;
  NewClass.createClass = u.bind(u.createClass, u, NewClass);
  return NewClass;
};


// className
var cls = u.cls = {
  has: function(elem, className) {
    return (' ' + elem.className + ' ').indexOf(' ' + className + ' ') > -1;
  },

  add: function(elem, classNames) {
    var result = elem.className;
    classNames.split(/\s+/).forEach(function(className) {
      if (!cls.has(elem, className)) {
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


u.alias = {
  prop: function(obj, originalName, newName) {
    Object.defineProperty(obj, newName, {
      configurable: true,
      enumerable: true,
      get: function() {
        return this[originalName];
      },
      set: function(value) {
        this[originalName] = value;
      }
    });
  }
};



// Types
u.is = {
  view: function(object) {
    return !!(object && object.isView);
  },
  node: function(object) {
    return !!(object && 'nodeType' in object);
  },
  element: function(object) {
    return !!(object && object.nodeType == 1);
  }
};

[
  ['fun',   'Function'],
  ['array',  'Array'],
  ['bool',   'Boolean'],
  ['number', 'Number'],
  ['string', 'String'],
  ['date',   'Date'],
  ['number', 'Number']
].forEach(function(pair) {
  var typeName = '[object ' + pair[1] + ']';
  u.is[pair[0]] = function(object) {
    return Object.prototype.toString.call(object) === typeName;
  };
});


module.exports = u;
