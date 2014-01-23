
function contains(s, ss) { return s.indexOf(ss) != -1; }
if (contains(navigator.platform, 'Win'))
  document.body.classList.add('os-win');
if (contains(navigator.platform, 'Mac'))
  document.body.classList.add('os-mac');
if (contains(navigator.userAgent, 'CrOS'))
  document.body.classList.add('os-cros');

function select(event) {
  var id = event.code;
  console.log("id: " + id);
  return [].slice.call(document.querySelectorAll('.' + id));

  // Can't override |location| on KeyboardEvent in some browsers, so it
  // may be wrong, e.g. NumLock in moz-mac
}

var target = document.getElementById('target');

document.documentElement.addEventListener('click', function(e) {
  target.focus();
});

// Block Apps (context menu) key in IE
document.documentElement.addEventListener('contextmenu', function (e) {
  return false;
});

var lastKey = -1;

// Workaround for Opera which doesn't allow cancelling Tab, IE/Apps
target.addEventListener('blur', function (e) {
  if (lastKey === 0x09 || lastKey === 0x5D)
    target.focus();
  lastKey = -1;
});

function hex(x, w) {
  x = Number(x);
  w = Number(w) || 2;
  return '0x' + ('0'.repeat(w) + x.toString(16)).slice(-w);
}

function show(selector, e) {
  var elem = document.querySelector(selector),
      data = {
        code: e.code,
        location: e.location,
        cap: KeyboardEvent.queryKeyCap(e.code),
        key: e.key,
        char: e.char,
        keyChar: e.keyChar,
        keyCode: hex(e.keyCode),
        keyIdentifier: e.keyIdentifier,
        keyLocation: e.keyLocation,
        keyName: e.keyName,
        which: hex(e.which),
        altKey: e.altKey,
        charCode: e.charCode,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey
      };

  while (elem.hasChildNodes())
    elem.removeChild(elem.firstChild);

  var s = Object.keys(data).filter(function(k){
    return typeof data[k] !== 'undefined';
  }).map(function(k){
    return k + ": " + data[k] + "\n";
  });
  elem.appendChild(document.createTextNode(s.join('')));
}

target.addEventListener('keydown', function (e) {
  lastKey = e.keyCode;

  show('#eventdata', e);

  select(e).forEach(
    function (elem) {
      elem.style.backgroundColor = 'red';
    });

  e.preventDefault();
  e.stopPropagation();
});

target.addEventListener('keyup', function (e) {

  if (lastKey == e.keyCode) { lastKey = -1; }

  show('#eventdata', e);

  select(e).forEach(
    function (elem) {
      elem.style.backgroundColor = '#ffaaaa';
      setTimeout(function() {
        elem.style.backgroundColor = '#aaaaaa';
      }, 200);
    });

  e.preventDefault();
  e.stopPropagation();
});

target.addEventListener('keypress', function (e) {
  e.preventDefault();
  e.stopPropagation();
});

target.addEventListener('contextmenu', function (e) {
  e.preventDefault();
  e.stopPropagation();
});

target.focus();
