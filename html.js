(function(global) {
  if (!('window' in global && 'document' in global))
    return;

  //----------------------------------------------------------------------
  //
  // HTML
  // https://html.spec.whatwg.org
  //
  //----------------------------------------------------------------------

  // document.head attribute
  // Needed for: IE8-
  document.head = document.head || document.getElementsByTagName('head')[0];

  // Ensure correct parsing of newish elements ("shiv")
  // Needed for: IE8-
  [
    'abbr', 'article', 'aside', 'audio', 'bdi', 'canvas', 'data', 'datalist',
    'details', 'dialog', 'figcaption', 'figure', 'footer', 'header', 'hgroup',
    'main', 'mark', 'meter', 'nav', 'output', 'picture', 'progress', 'section',
    'summary', 'template', 'time', 'video'].forEach(function(tag) {
     document.createElement(tag);
   });

  // HTMLElement.dataset
  // Needed for: IE10-
  if (!('dataset' in document.createElement('span')) &&
      'Element' in global && Element.prototype && Object.defineProperty) {
    Object.defineProperty(Element.prototype, 'dataset', { get: function() {
      var result = Object.create(null);
      for (var i = 0; i < this.attributes.length; ++i) {
        var attr = this.attributes[i];
        if (attr.specified && attr.name.substring(0, 5) === 'data-') {
          (function(element, name) {
            var prop = name.replace(/-([a-z])/g, function(m, p) {
              return p.toUpperCase();
            });
            result[prop] = element.getAttribute('data-' + name); // Read-only, for IE8-
            Object.defineProperty(result, prop, {
              get: function() {
                return element.getAttribute('data-' + name);
              },
              set: function(value) {
                element.setAttribute('data-' + name, value);
              }});
          }(this, attr.name.substring(5)));
        }
      }
      return result;
    }});
  }

  // Base64 utility methods
  // Needed for: IE9-
  (function() {
    if ('atob' in global && 'btoa' in global)
      return;

    var B64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    function atob(input) {
      input = String(input);
      var position = 0,
          output = [],
          buffer = 0, bits = 0, n;

      input = input.replace(/\s/g, '');
      if ((input.length % 4) === 0) { input = input.replace(/=+$/, ''); }
      if ((input.length % 4) === 1) { throw Error("InvalidCharacterError"); }
      if (/[^+/0-9A-Za-z]/.test(input)) { throw Error("InvalidCharacterError"); }

      while (position < input.length) {
        n = B64_ALPHABET.indexOf(input.charAt(position));
        buffer = (buffer << 6) | n;
        bits += 6;

        if (bits === 24) {
          output.push(String.fromCharCode((buffer >> 16) & 0xFF));
          output.push(String.fromCharCode((buffer >>  8) & 0xFF));
          output.push(String.fromCharCode(buffer & 0xFF));
          bits = 0;
          buffer = 0;
        }
        position += 1;
      }

      if (bits === 12) {
        buffer = buffer >> 4;
        output.push(String.fromCharCode(buffer & 0xFF));
      } else if (bits === 18) {
        buffer = buffer >> 2;
        output.push(String.fromCharCode((buffer >> 8) & 0xFF));
        output.push(String.fromCharCode(buffer & 0xFF));
      }

      return output.join('');
    };

    function btoa(input) {
      input = String(input);
      var position = 0,
          out = [],
          o1, o2, o3,
          e1, e2, e3, e4;

      if (/[^\x00-\xFF]/.test(input)) { throw Error("InvalidCharacterError"); }

      while (position < input.length) {
        o1 = input.charCodeAt(position++);
        o2 = input.charCodeAt(position++);
        o3 = input.charCodeAt(position++);

        // 111111 112222 222233 333333
        e1 = o1 >> 2;
        e2 = ((o1 & 0x3) << 4) | (o2 >> 4);
        e3 = ((o2 & 0xf) << 2) | (o3 >> 6);
        e4 = o3 & 0x3f;

        if (position === input.length + 2) {
          e3 = 64;
          e4 = 64;
        }
        else if (position === input.length + 1) {
          e4 = 64;
        }

        out.push(B64_ALPHABET.charAt(e1),
                 B64_ALPHABET.charAt(e2),
                 B64_ALPHABET.charAt(e3),
                 B64_ALPHABET.charAt(e4));
      }

      return out.join('');
    };

    global.atob = atob;
    global.btoa = btoa;
  }());

  // requestAnimationFrame - needed for IE9-
  (function() {
    if ('requestAnimationFrame' in global)
      return;

    var TARGET_FPS = 60,
        requests = Object.create(null),
        raf_handle = 0,
        timeout_handle = -1;

    function isVisible(element) {
      return element.offsetWidth > 0 && element.offsetHeight > 0;
    }

    function onFrameTimer() {
      var cur_requests = requests;
      requests = Object.create(null);
      timeout_handle = -1;
      Object.keys(cur_requests).forEach(function(id) {
        var request = cur_requests[id];
        if (!request.element || isVisible(request.element))
          request.callback(Date.now());
      });
    }

    function requestAnimationFrame(callback, element) {
      var cb_handle = ++raf_handle;
      requests[cb_handle] = {callback: callback, element: element};
      if (timeout_handle === -1)
        timeout_handle = global.setTimeout(onFrameTimer, 1000 / TARGET_FPS);
      return cb_handle;
    }

    function cancelAnimationFrame(handle) {
      delete requests[handle];
      if (Object.keys(requests).length === 0) {
        global.clearTimeout(timeout_handle);
        timeout_handle = -1;
      }
    }

    global.requestAnimationFrame = requestAnimationFrame;
    global.cancelAnimationFrame = cancelAnimationFrame;
  }());

}(self));
