(function(){
  if (!('Element' in window) || Element.prototype.addEventListener)
    return;

  Event.CAPTURING_PHASE = 1;
  Event.AT_TARGET = 2;
  Event.BUBBLING_PHASE = 3;

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
  Object.defineProperty(Event.prototype, 'defaultPrevented', {
    get: function() {
      return this.returnValue === false;
    }
  });
  Object.defineProperty(Event.prototype, 'target', {
    get: function() {
      return this.srcElement;
    }
  });
  Object.defineProperty(Event.prototype, 'eventPhase', {
    get: function() {
      return (this.srcElement === this.currentTarget) ? Event.AT_TARGET : Event.BUBBLING_PHASE;
    }
  });
  Event.prototype.preventDefault = function() {
    this.returnValue = false;
  };
  Event.prototype.stopPropagation = function() {
    this.cancelBubble = true;
  };

  function addEventListener(type, listener, capture) {
    var target = this;
    var f = function(e) {
      e.timeStamp = Number(new Date);
      e.currentTarget = target;
      listener.call(this, e);
      delete e.currentTarget;
    };
    this['_' + type + listener] = f;
    this.attachEvent('on' + type, f);
  }

  function removeEventListener(type, listener, capture) {
    this.detachEvent('on' + type, this['_' + type + listener]);
    delete this['_' + type + listener];
  }

  var p1 = Window.prototype, p2 = HTMLDocument.prototype, p3 = Element.prototype;
  p1.addEventListener = p2.addEventListener = p3.addEventListener = addEventListener;
  p1.removeEventListener = p2.removeEventListener = p3.removeEventListener = removeEventListener;

}());
