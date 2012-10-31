
function toArray(a) {
  var result = [], i, length = a.length;
  for (i = 0; i < length; i += 1) {
    result.push(a[i]);
  }
  return result;
}


function contains(s, ss) { return s.indexOf(ss) != -1; }
var is_win = contains(navigator.platform, 'Win');
var is_mac = contains(navigator.platform, 'Mac');
var is_cros = contains(navigator.userAgent, 'CrOS');

if (is_mac) {

  toArray(document.querySelectorAll('.Win')).forEach(
    function (e) {
      var cl = getClassList(e);
      cl.remove('Win');
      cl.add('Meta');
      e.innerHTML = '&#x2318;';
    });
  toArray(document.querySelectorAll('.Apps')).forEach(
    function (e) {
      e.style.visibility = 'hidden';
    });
} else if (is_cros) {

  toArray(document.querySelectorAll('.Win,.Apps')).forEach(
    function (e) {
      e.style.visibility = 'hidden';
    });
}

function ancestorHasClass(node, className) {
  while (node && node.nodeType == Node.ELEMENT_NODE) {
    if (getClassList(node).contains(className)) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

function select(event) {
  var id = event.keyName;
  if (!RegExp('^[A-Za-z]').test(id)) {
    id = 'k' + id;
  }

  if (event.keyLocation === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
    return toArray(document.querySelectorAll('.numpad .' + id));
  } else {
    return toArray(document.querySelectorAll('.standard .' + id));
  }
}

var target = document.getElementById('target');

addEvent(document.documentElement, 'click',
         function (e) {
           target.focus();
         });

// Block Apps (context menu) key in IE
addEvent(document.documentElement, 'contextmenu',
         function (e) {
           return false;
         });

var lastKey = -1;

// Workaround for Opera which doesn't allow cancelling Tab, IE/Apps
addEvent(target, 'blur',
         function (e) {
           if (lastKey === 0x09 || lastKey === 0x5D) {
             target.focus();
           }
           lastKey = -1;
         });

function show(selector, e) {
  var elem = document.querySelector(selector),
      data = {
        keyChar: e.keyChar,
        keyCode: e.keyCode,
        keyIdentifier: e.keyIdentifier,
        keyLocation: e.keyLocation,
        keyName: e.keyName,
        usbUsage: e.usbUsage !== undefined ? "0x" + Number(e.usbUsage).toString(16) : undefined,
        which: e.which,
        altKey: e.altKey,
        charCode: e.charCode,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey
      };

  while (elem.hasChildNodes()) {
    elem.removeChild(elem.firstChild);
  }
  var s = Object.keys(data).filter(function(k){
    return typeof data[k] !== 'undefined';
  }).map(function(k){
    return k + ": " + data[k];
  }).join(", ");
  elem.appendChild(document.createTextNode(s));
}

addEvent(target, 'keydown',
         function (e) {
           lastKey = e.keyCode;

           show('#eventdata', e);

           identifyKey(e);

           show('#identifydata', e);

           select(e).forEach(
             function (elem) {
               elem.style.backgroundColor = 'red';
             });

           e.preventDefault();
           e.stopPropagation();
         });

addEvent(target, 'keyup',
         function (e) {
           if (lastKey == e.keyCode) { lastKey = -1; }
           identifyKey(e);

           select(e).forEach(
             function (elem) {
               elem.style.backgroundColor = '#aaaaaa';
             });

           e.preventDefault();
           e.stopPropagation();
         });

target.focus();
