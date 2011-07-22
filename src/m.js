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


m.defineProperty = function(obj, propName, propDef) {
  obj.propNames.push(propName);

  Object.defineProperty(obj, propName, u.extend({
    configurable: true,
    enumerable: true,
    set: function(value) {
      var oldValue = this[propName];
      this.propValues[propName] = value;
      if (oldValue != value) {
        this.triggerChanges(propName);
      }
    },
    get: function() {
      return this.propValues[propName];
    }
  }, propDef));
};

m.defineProperties = function(obj, propDefs) {
  for (var propName in propDefs) {
    m.defineProperty(obj, propName, propDefs[propName]);
  }
};


var Base = m.Base = function(options) {
  this.propValues = {};
  if (options) {
    this.muteChanges = true;
    u.extend(this, options);
    this.muteChanges = false;
  }
};

var bp = Base.prototype;

u.extend(bp, m.Observable);

bp.propValues = {};
bp.propNames = [];

bp.triggerChanges = function(name) {
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
};

bp.muteChanges = false;

m.defineProperty(bp, 'id');


m.Binding = function(options) {
  u.extend(this, options);
  if (options.view && options.model) {
    this.modelEvents || (this.modelEvents = ['change.' + this.modelProp]);
    if (this.modelProp) {
      this.viewEvents.forEach(function(name) {
        this.view.addEventListener(name, u.bindOnce(this.updateModel, this));
      }, this);
    }
    this.modelEvents.forEach(function(name) {
      this.model.addEventListener(name, u.bindOnce(this.updateView, this));
    }, this);
    this.updateView();
  }
};

u.extend(m.Binding.prototype, {
  modelProp: 'value',
  viewProp: 'value',
  modelEvents: null,
  viewEvents: ['blur'],

  destruct: function() {
    if (this.view && this.model) {
      if (this.modelProp) {
        this.viewEvents.forEach(function(name) {
          this.view.removeEventListener(name, u.bindOnce(this.updateModel, this));
        }, this);
      }
      this.modelEvents.forEach(function(name) {
        this.model.removeEventListener(name, u.bindOnce(this.updateView, this));
      }, this);
    }
  },

  updateModel: function(e) {
    this._lockUpdate(function() {
      this.model[this.modelProp] = this.view[this.viewProp];
    });
  },

  updateView: function(e) {
    this._lockUpdate(function() {
      this.view[this.viewProp] = this.modelProp ?
        this.model[this.modelProp] :
        this.model;
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

Base.createClass = function() {
  var NewClass = u.createClass(this);
  NewClass.prototype.propNames = [].concat(Base.prototype.propNames);
  NewClass.createClass = u.bind(this.createClass, this, NewClass);
  return NewClass;
};


module.exports = m;

