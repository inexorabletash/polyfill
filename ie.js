(function(){
  if (!('Element' in window) || Element.prototype.addEventListener)
    return;

  // interface Event

  // PhaseType (const unsigned short)
  Event.CAPTURING_PHASE = 1;
  Event.AT_TARGET       = 2;
  Event.BUBBLING_PHASE  = 3;

  Object.defineProperty(Event.prototype, 'CAPTURING_PHASE', { get: function() { return 1; } });
  Object.defineProperty(Event.prototype, 'AT_TARGET',       { get: function() { return 2; } });
  Object.defineProperty(Event.prototype, 'BUBBLING_HASE',   { get: function() { return 3; } });

  // readonly attribute DOMString type - already defined

  // readonly attribute EventTarget? target
  Object.defineProperty(Event.prototype, 'target', {
    get: function() {
      return this.srcElement;
    }
  });

  // readonly attribute EventTarget? currentTarget
  Object.defineProperty(Event.prototype, 'currentTarget', {
    get: function() {
      return this._currentTarget;
    }
  });

  // readonly attribute unsigned short eventPhase
  Object.defineProperty(Event.prototype, 'eventPhase', {
    get: function() {
      return (this.srcElement === this.currentTarget) ? Event.AT_TARGET : Event.BUBBLING_PHASE;
    }
  });

  // readonly attribute boolean bubbles
  Object.defineProperty(Event.prototype, 'bubbles', {
    get: function() {
      switch (this.type) {
        // Mouse
      case 'click':
      case 'dblclick':
      case 'mousedown':
      case 'mouseup':
      case 'mouseover':
      case 'mousemove':
      case 'mouseout':
      case 'mousewheel':
        // Keyboard
      case 'keydown':
      case 'keypress':
      case 'keyup':
        // Frame/Object
      case 'resize':
      case 'scroll':
        // Form
      case 'select':
      case 'change':
      case 'submit':
      case 'reset':
        return true;
      }
      return false;
    }
  });

  // readonly attribute boolean cancelable
  Object.defineProperty(Event.prototype, 'cancelable', {
    get: function() {
      switch (this.type) {
        // Mouse
      case 'click':
      case 'dblclick':
      case 'mousedown':
      case 'mouseup':
      case 'mouseover':
      case 'mouseout':
      case 'mousewheel':
        // Keyboard
      case 'keydown':
      case 'keypress':
      case 'keyup':
        // Form
      case 'submit':
        return true;
      }
      return false;
    }
  });

  // readonly attribute DOMTimeStamp timeStamp
  Object.defineProperty(Event.prototype, 'timeStamp', {
    get: function() {
      return this._timeStamp;
    }
  });

  // void stopPropagation()
  Event.prototype.stopPropagation = function() {
    this.cancelBubble = true;
  };

  // void preventDefault()
  Event.prototype.preventDefault = function() {
    this.returnValue = false;
  };

  // readonly attribute defaultPrevented
  Object.defineProperty(Event.prototype, 'defaultPrevented', {
    get: function() {
      return this.returnValue === false;
    }
  });


  // interface EventTarget

  function addEventListener(type, listener, useCapture) {
    var target = this;
    var f = function(e) {
      e._timeStamp = Number(new Date);
      e._currentTarget = target;
      listener.call(this, e);
      e._currentTarget = null;
    };
    this['_' + type + listener] = f;
    this.attachEvent('on' + type, f);
  }

  function removeEventListener(type, listener, useCapture) {
    this.detachEvent('on' + type, this['_' + type + listener]);
    this['_' + type + listener] = null;
  }

  var p1 = Window.prototype, p2 = HTMLDocument.prototype, p3 = Element.prototype;
  p1.addEventListener    = p2.addEventListener    = p3.addEventListener    = addEventListener;
  p1.removeEventListener = p2.removeEventListener = p3.removeEventListener = removeEventListener;

}());
