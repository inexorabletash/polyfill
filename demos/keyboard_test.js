
function contains(s, ss) { return s.indexOf(ss) != -1; }
if (contains(navigator.platform, 'Win'))
  document.body.classList.add('meta-win');
if (contains(navigator.platform, 'Mac'))
  document.body.classList.add('meta-mac');
if (contains(navigator.userAgent, 'CrOS'))
  document.body.classList.add('meta-cros');

function select(event) {
  var id = event.code;
  return [].map.call(document.querySelectorAll('.' + id), function(x) { return x; });

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
  if (x === undefined) return x;
  x = Number(x);
  w = Number(w) || 2;
  return '0x' + ('0'.repeat(w) + x.toString(16)).slice(-w);
}

function show(selector, e) {
  var elem = document.querySelector(selector),
      data = [
        {
          category: 'UI Events',
          link: 'https://w3c.github.io/uievents/',
          attributes: {
            code: e.code,
            key: e.key,
            location: e.location
          }
        },

        {
          category: 'UI Events (extension)',
          link: 'https://dvcs.w3.org/hg/d4e/raw-file/tip/source_respec.htm',
          attributes: {
            'queryKeyCap()': KeyboardEvent.queryKeyCap(e.code)
          }
        },

        {
          category: 'Legacy user agents',
          attributes: {
            charCode: hex(e.charCode),
            keyCode: hex(e.keyCode),
            which: hex(e.which),
            char: e.char // IE only
          }
        },

        {
          category: 'Abandoned proposals',
          attributes: {
            keyChar: e.keyChar,
            keyIdentifier: e.keyIdentifier,
            keyLocation: e.keyLocation,
            keyName: e.keyName
          }
        },

        {
          category: 'Modifiers',
          attributes: {
            altKey: e.altKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            shiftKey: e.shiftKey,
            repeat: e.repeat
          }
        }
      ];

  while (elem.hasChildNodes())
    elem.removeChild(elem.firstChild);

  var s = data.map(function(cat) {
    return cat.category + ':\n' +
      Object.keys(cat.attributes).filter(function(k) {
        return typeof cat.attributes[k] !== 'undefined';
      }).map(function(k) {
        return '  ' + k + ': ' + cat.attributes[k] + '\n';
      }).join('');
  }).join('\n');
  elem.appendChild(document.createTextNode(s));
}

target.addEventListener('keydown', function(e) {
  identifyKey(e); // for IE8-
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
  identifyKey(e); // for IE8-
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
