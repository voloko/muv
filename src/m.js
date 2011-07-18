/**
* Copyright (c) 2011 Vladimir Kolesnikov
*
* Model
*/
var u = require('./u');

var m = {};

m.Observable = {
  addEventListener: function(type, callback) {
    if (!this._listeners) { this._listeners = {}; }
    if (!this._listeners[type]) { this._listeners[type] = []; }
    this._listeners[type].push(callback);
  },

  removeEventListener: function(type, callback) {
    if (!type) {
      delete this._listeners;
    } else {
      var listeners = this._listeners;
      if (listeners) {
        if (listeners[type]) {
          listeners[type] = callback ? listeners[type].filter(function(item) {
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
  },

  muteEvents: false
};


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
  },

  muteChanges: false
});


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

m.Biding = function(options) {
  u.extend(this, options);
  if (options.view && options.model) {
    this.modelEvent || (this.modelEvent = 'change.' + this.modelProp);
    this.view.addEventListener(this.viewEvent, u.bindOnce(this.updateModel, this));
    this.model.addEventListener(this.modelEvent, u.bindOnce(this.updateView, this));
  }
};

u.extend(m.Biding.prototype, {
  modelProp: 'value',
  viewProp: 'value',
  modelEvent: '',
  viewEvent: 'blur',

  destruct: function() {
    if (this.view && this.model) {
      this.view.removeEventListener(this.viewEvent, u.bindOnce(this.updateModel, this));
      this.model.removeEventListener(this.modelEvent, u.bindOnce(this.updateView, this));
    }
  },

  updateModel: function(e) {
    this._lockUpdate(function() {
      this.model[this.modelProp] = this.view[this.viewProp];
    });
  },

  updateView: function(e) {
    this._lockUpdate(function() {
      this.view[this.viewProp] = this.model[this.modelProp];
    });
  },

  _lockUpdate: function(callback) {
    if (!this._updating) {
      this._updating = true;
      try {
        callback.call(this);
      } catch (e) {
        this._updating = false;
        throw e;
      }
      this._updating = false;
    }
  }
});


module.exports = m;

