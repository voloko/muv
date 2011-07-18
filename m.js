/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* Model
*/
var u = require('./u');

var m = {};

m.Observable = {
  addEventListener: function(name, callback) {
    if (!this._listeners) { this._listeners = {}; }
    if (!this._listeners[name]) { this._listeners[name] = []; }
    this._listeners[name].push(callback);
  },

  removeEventListener: function(name, callback) {
    if (!name) {
      delete this._listeners;
    } else {
      var listeners = this._listeners;
      if (listeners) {
        if (listeners[name]) {
          listeners[name] = callback ? listeners[name].filter(function(item) {
            return item !== callback;
          }) : [];
        }
      }
    }
  },

  trigger: function(e) {
    if (this.muteEvents) return;
    
    var type = e.type;
    var listeners = this._listeners;
    
    if (listeners && listeners[type]) {
      listeners[type].forEach(function(callback) {
        callback.call(this, e);
      }, this);
    }
  },

  destruct: function() {
    delete this._listeners;
  }  
};

Object.defineProperty(m.Observable, 'muteEvents', {
  enumerable: true,
  configurable: true,
  writable: true,
  value: false });


m.Base = u.extend(m.Observable, {
  triggerChanges: function(name) {
    if (this.muteChanges) return;
    
    this.trigger({
      type: 'change.' + name,
      model: this
    });
    this.trigger({
      type: 'change',
      name: name,
      model: this
    });
    return this;
  }
});

Object.defineProperty(m.Base, 'muteChanges', {
  enumerable: true,
  configurable: true,
  writable: true,
  value: false });
  
  
m.defineProperty = function(obj, propName, propDef) {
  var storage = '_' + propName;
  
  Object.defineProperty(obj, propName, u.extend({
    configurable: true,
    enumerable: true,
    set: function(value) {
      var oldValue = this[propName];
      this[storage] = value;
      if (oldValue != value) {
        this.triggerChanges(propName);
      }
    },
    get: function() {
      return this[storage];
    }
  }, propDef));
};


module.exports = m;

