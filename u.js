/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* Utils
*/
var u = {};

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

function _cleanCls(result) {
  return result.trim().replace(/\s{2,}/g, ' ');
}

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

module.exports = u;
