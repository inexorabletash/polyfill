//
// This adds a function to the global namespace:
//
//     identifyKey(keyboardEvent);
//
// The keyboardEvent argument should be a keyup/keydown DOM event.
// This adds the following properties to the event:
//
//     keyName - (string) the key identifier, based on DOM Level 3 draft
//     keyIdentifier - (string) name of the key (control) or "U+XXXX" (printable)
//     keyLocation - (number) location of key on device, based on DOM Level 3 draft
//     keyChar - (string) printable character, if applicable

// Keys vs. Characters
//
// In most operating systems, physical key presses generate events (keydown, keyup)
// which are delivered to applications but simultaneously processed by the operating
// system to perform actions or generate characters. For example:
//    Keys: [A] - generate character 'a'
//    Keys: [Shift] - no character generated
//    Keys: [Shift]+[A] - generate character 'A'
//    Keys: [9] - generate character '9'
//    Keys: [Shift]+[9] - generate character '('
//    Keys: [;:] - generate character ';'
//    Keys: [Shift]+[;:] - generate character ':'
//    Keys: [Alt]+[`~], [E] - generate e with grave accent
//    Keys: [Alt]+[0],[1],[2],[8] - generate Euro symbol
//    Keys: [Enter] - generate 0x0D character (maybe)
//    Keys: [Esc] - generate 0x1B character (maybe)
// And of course, for non-Latin languages things get even more complicated
// including IMEs where multiple keystrokes may generate a list of candidate
// characters in an OS- or application-provided display, from which the user
// selects before the character is presented to the application.

// Browsers and Key Events
//
// Keyboard events were implemented before a specification was written; as
// such, the behavior across browsers is very different. The HTML4 spec
// defines the model as sending 'keydown' and 'keyup' events corresponding
// to physical actions with the keys (with possibly repeated 'keydown'
// events due to auto-repeat), and 'keypress' events corresponding to
// the generation of a character. The keydown/keyup events contain a
// 'keyCode' property, and the keypress event contains a 'charCode' or
// 'which' property, depending on the browser.
//
// In theory, the keyCode values could be OS- or even keyboard-specific
// but for compatibility most browsers settled on the values produced
// by Microsoft Internet Explorer. Some browsers deviate and there several
// are OS- and browser-specific quirks.
//
// IE codes derived from Windows Virtual Key Codes documented here:
//
//   http://msdn.microsoft.com/en-us/library/dd375731(VS.85).aspx
//
// WebKit (Safari and Chrome) adopted the IE model and codes for compatibility,
// on both Windows and Macintosh OS platforms:
//
//   https://lists.webkit.org/pipermail/webkit-dev/2007-December/002992.html
//
// Firefox (Mozilla/Gecko) uses a very similar set of codes, which differs
// for a handful of keys for punctuation symbols:
//
//   https://developer.mozilla.org/en/DOM/Event/UIEvent/KeyEvent
//
// Opera also uses different codes for some non-alphabetic keys:
//
//   http://dev.opera.com/articles/view/keyboard-accessible-web-applications-3/
//
// Other references:
//
//    http://unixpapa.com/js/key.html
//    http://turboajax.com/dojo/key_compat.html
//    http://msdn.microsoft.com/en-us/scriptjunkie/ff928319

// Future Standards and Directions
//
// The DOM Level 3 Events draft specification defines new properties for
// key events, including |key| (a string value naming the key), |char|
// (the Unicode character produced by a key or sequence) and |location|
// identifying the physical location of the key (standard, left, right,
// numpad, etc). This draft is not yet finalized nor implemented by browser
// vendors, but provides some possible guidance for the future.
//
//   http://www.w3.org/TR/DOM-Level-3-Events/
//
// For cross-browser legacy mappings, see:
//
//   http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/Note-KeyProps.html
//
// This module uses the key names from these draft specifications but does
// NOT attempt to mimic the draft.
//
// WebKit-based browsers (Safari, Chrome) have taken a different approach and
// add a |keyIdentifier| property and a |keyLocation| property. The
// |keyIdentifier| has key names for control keys ('Shift', 'PageUp', etc) and
// Unicode names for ('U+0041', 'U+00DB') for printable keys. The |keyLocation|
// property is the same as the DOM3 proposed |location|.

// Known Issues:
//  Win/Chrome, Win/Safari, Win/IE, Win/Firefox - PrintScreen and Scroll only generate keyup events
//  Mac/Firefox - shifted ,./;\-` send a keyCode of 0
//  Win/Opera - Tab moves focus even if cancelled; need explicit workaround to return focus
//  Win/IE - Apps moves focus even if cancelled; need explicit workaround to return focus, cancel menu
//  Win/Chrome - Apps doesn't send keyup

/*jslint browser: true*/

window.KeyboardEvent = window.KeyboardEvent || function KeyboardEvent() { throw new TypeError("Illegal constructor"); };
window.KeyboardEvent.DOM_KEY_LOCATION_STANDARD      = 0x00; // Default or unknown location
window.KeyboardEvent.DOM_KEY_LOCATION_LEFT          = 0x01; // e.g. Left Alt key
window.KeyboardEvent.DOM_KEY_LOCATION_RIGHT         = 0x02; // e.g. Right Alt key
window.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD        = 0x03; // e.g. Numpad 0 or +
window.KeyboardEvent.DOM_KEY_LOCATION_MOBILE        = 0x04;
window.KeyboardEvent.DOM_KEY_LOCATION_JOYSTICK      = 0x05;

(function(global) {

  var VK_COMMON, VK_SPECIAL, os, browser;

  // NOTE: 'char' is the default character for that key, and doesn't reflect modifier
  // states. It is primarily used here to indicate that this is a non-special key
  VK_COMMON = {
    0x03: { keyIdentifier: 'Cancel' }, // char \x0018 ???
    0x06: { keyIdentifier: 'Help' }, // ???
    0x08: { keyIdentifier: 'U+0008', keyName: 'Backspace', keyChar: '\u0008' },
    0x09: { keyIdentifier: 'U+0009', keyName: 'Tab', keyChar: '\u0009' },
    0X0C: { keyIdentifier: 'Clear' }, // NumPad Center
    0X0D: { keyIdentifier: 'Enter', keyChar: '\u000D' },

    0x10: { keyIdentifier: 'Shift' },
    0x11: { keyIdentifier: 'Control' },
    0x12: { keyIdentifier: 'Alt' },
    0x13: { keyIdentifier: 'Pause' },
    0x14: { keyIdentifier: 'CapsLock' },

    0x15: { keyIdentifier: 'KanaMode' }, // IME
    0x16: { keyIdentifier: 'HangulMode' }, // IME
    0x17: { keyIdentifier: 'JunjaMode' }, // IME
    0x18: { keyIdentifier: 'FinalMode' }, // IME
    0x19: { keyIdentifier: 'HanjaMode' }, // IME
    //  0x19: { keyIdentifier: 'KanjiMode', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_STANDARD }, // IME; duplicate on Windows

    0x1B: { keyIdentifier: 'U+001B', keyName: 'Escape', keyChar: '\u001B' },

    0x1C: { keyIdentifier: 'Convert' }, // IME
    0x1D: { keyIdentifier: 'Nonconvert' }, // IME
    0x1E: { keyIdentifier: 'Accept' }, // IME
    0x1F: { keyIdentifier: 'ModeChange' }, // IME

    0x20: { keyIdentifier: 'U+0020', keyName: 'Spacebar', keyChar: ' ' },
    0x21: { keyIdentifier: 'PageUp' },
    0x22: { keyIdentifier: 'PageDown' },
    0x23: { keyIdentifier: 'End' },
    0x24: { keyIdentifier: 'Home' },
    0x25: { keyIdentifier: 'Left' },
    0x26: { keyIdentifier: 'Up' },
    0x27: { keyIdentifier: 'Right' },
    0x28: { keyIdentifier: 'Down' },
    0x29: { keyIdentifier: 'Select' },
    0x2A: { keyIdentifier: 'Print' }, // ???
    0x2B: { keyIdentifier: 'Execute' },
    0x2C: { keyIdentifier: 'PrintScreen' },
    0x2D: { keyIdentifier: 'Insert' },
    0x2E: { keyIdentifier: 'U+007F', keyName: 'Delete', keyChar: '\u007f' },
    0x2F: { keyIdentifier: 'Help' }, // ???

    0x30: { keyIdentifier: 'U+0030', keyName: '0', keyNameShifted: 'RightParen', keyChar: '0', keyCharShifted: ')' }, // 0 )
    0x31: { keyIdentifier: 'U+0031', keyName: '1', keyNameShifted: 'Exclamation', keyChar: '1', keyCharShifted: '!' }, // 1 !
    0x32: { keyIdentifier: 'U+0032', keyName: '2', keyNameShifted: 'At', keyChar: '2', keyCharShifted: '@' }, // 2 @
    0x33: { keyIdentifier: 'U+0033', keyName: '3', keyNameShifted: 'Hash', keyChar: '3', keyCharShifted: '#' }, // 3 #
    0x34: { keyIdentifier: 'U+0034', keyName: '4', keyNameShifted: 'Dollar', keyChar: '4', keyCharShifted: '$' }, // 4 $
    0x35: { keyIdentifier: 'U+0035', keyName: '5', keyNameShifted: 'Percent', keyChar: '5', keyCharShifted: '%' }, // 5 %
    0x36: { keyIdentifier: 'U+0036', keyName: '6', keyNameShifted: 'Circumflex', keyChar: '6', keyCharShifted: '^' }, // 6 ^
    0x37: { keyIdentifier: 'U+0037', keyName: '7', keyNameShifted: 'Ampersand', keyChar: '7', keyCharShifted: '&' }, // 7 &
    0x38: { keyIdentifier: 'U+0038', keyName: '8', keyNameShifted: 'Asterisk', keyChar: '8', keyCharShifted: '*' }, // 8 *
    0x39: { keyIdentifier: 'U+0039', keyName: '9', keyNameShifted: 'LeftParen', keyChar: '9', keyCharShifted: '(' }, // 9 (

    0x41: { keyIdentifier: 'U+0041', keyName: 'A', keyChar: 'a', keyCharShifted: 'A' },
    0x42: { keyIdentifier: 'U+0042', keyName: 'B', keyChar: 'b', keyCharShifted: 'B' },
    0x43: { keyIdentifier: 'U+0043', keyName: 'C', keyChar: 'c', keyCharShifted: 'C' },
    0x44: { keyIdentifier: 'U+0044', keyName: 'D', keyChar: 'd', keyCharShifted: 'D' },
    0x45: { keyIdentifier: 'U+0045', keyName: 'E', keyChar: 'e', keyCharShifted: 'E' },
    0x46: { keyIdentifier: 'U+0046', keyName: 'F', keyChar: 'f', keyCharShifted: 'F' },
    0x47: { keyIdentifier: 'U+0047', keyName: 'G', keyChar: 'g', keyCharShifted: 'G' },
    0x48: { keyIdentifier: 'U+0048', keyName: 'H', keyChar: 'h', keyCharShifted: 'H' },
    0x49: { keyIdentifier: 'U+0049', keyName: 'I', keyChar: 'i', keyCharShifted: 'I' },
    0x4A: { keyIdentifier: 'U+004A', keyName: 'J', keyChar: 'j', keyCharShifted: 'J' },
    0x4B: { keyIdentifier: 'U+004B', keyName: 'K', keyChar: 'k', keyCharShifted: 'K' },
    0x4C: { keyIdentifier: 'U+004C', keyName: 'L', keyChar: 'l', keyCharShifted: 'L' },
    0x4D: { keyIdentifier: 'U+004D', keyName: 'M', keyChar: 'm', keyCharShifted: 'M' },
    0x4E: { keyIdentifier: 'U+004E', keyName: 'N', keyChar: 'n', keyCharShifted: 'N' },
    0x4F: { keyIdentifier: 'U+004F', keyName: 'O', keyChar: 'o', keyCharShifted: 'O' },
    0x50: { keyIdentifier: 'U+0050', keyName: 'P', keyChar: 'p', keyCharShifted: 'P' },
    0x51: { keyIdentifier: 'U+0051', keyName: 'Q', keyChar: 'q', keyCharShifted: 'Q' },
    0x52: { keyIdentifier: 'U+0052', keyName: 'R', keyChar: 'r', keyCharShifted: 'R' },
    0x53: { keyIdentifier: 'U+0053', keyName: 'S', keyChar: 's', keyCharShifted: 'S' },
    0x54: { keyIdentifier: 'U+0054', keyName: 'T', keyChar: 't', keyCharShifted: 'T' },
    0x55: { keyIdentifier: 'U+0055', keyName: 'U', keyChar: 'u', keyCharShifted: 'U' },
    0x56: { keyIdentifier: 'U+0056', keyName: 'V', keyChar: 'v', keyCharShifted: 'V' },
    0x57: { keyIdentifier: 'U+0057', keyName: 'W', keyChar: 'w', keyCharShifted: 'W' },
    0x58: { keyIdentifier: 'U+0058', keyName: 'X', keyChar: 'x', keyCharShifted: 'X' },
    0x59: { keyIdentifier: 'U+0059', keyName: 'Y', keyChar: 'y', keyCharShifted: 'Y' },
    0x5A: { keyIdentifier: 'U+005A', keyName: 'Z', keyChar: 'z', keyCharShifted: 'Z' },

    0x5B: { keyIdentifier: 'Win', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT }, // Left Windows
    0x5C: { keyIdentifier: 'Win', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT }, // Right Windows
    0x5D: { keyIdentifier: 'Apps' }, // Context Menu

    // TODO: Test in WebKit
    0x60: { keyIdentifier: 'U+0040', keyName: '0', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '0' },
    0x61: { keyIdentifier: 'U+0041', keyName: '1', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '1' },
    0x62: { keyIdentifier: 'U+0042', keyName: '2', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '2' },
    0x63: { keyIdentifier: 'U+0043', keyName: '3', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '3' },
    0x64: { keyIdentifier: 'U+0044', keyName: '4', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '4' },
    0x65: { keyIdentifier: 'U+0045', keyName: '5', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '5' },
    0x66: { keyIdentifier: 'U+0046', keyName: '6', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '6' },
    0x67: { keyIdentifier: 'U+0047', keyName: '7', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '7' },
    0x68: { keyIdentifier: 'U+0048', keyName: '8', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '8' },
    0x69: { keyIdentifier: 'U+0049', keyName: '9', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '9' },

    // TODO: Test in WebKit
    0x6A: { keyIdentifier: 'Multiply', keyName: 'Multiply', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '*' }, // or 'Asterisk' ?
    0x6B: { keyIdentifier: 'Add', keyName: 'Add', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '+' },
    0x6C: { keyIdentifier: 'Separator', keyName: 'Separator', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD }, // ??? NumPad Enter ???
    0x6D: { keyIdentifier: 'Subtract', keyName: 'Subtract', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '-' },
    0x6E: { keyIdentifier: 'Decimal', keyName: 'Decimal', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '.' },
    0x6F: { keyIdentifier: 'Divide', keyName: 'Divide', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '/' },

    // TODO: Test in WebKit
    0x70: { keyIdentifier: 'F1' },
    0x71: { keyIdentifier: 'F2' },
    0x72: { keyIdentifier: 'F3' },
    0x73: { keyIdentifier: 'F4' },
    0x74: { keyIdentifier: 'F5' },
    0x75: { keyIdentifier: 'F6' },
    0x76: { keyIdentifier: 'F7' },
    0x77: { keyIdentifier: 'F8' },
    0x78: { keyIdentifier: 'F9' },
    0x79: { keyIdentifier: 'F10' },
    0x7A: { keyIdentifier: 'F11' },
    0x7B: { keyIdentifier: 'F12' },
    0x7C: { keyIdentifier: 'F13' },
    0x7D: { keyIdentifier: 'F14' },
    0x7E: { keyIdentifier: 'F15' },
    0x7F: { keyIdentifier: 'F16' },
    0x80: { keyIdentifier: 'F17' },
    0x81: { keyIdentifier: 'F18' },
    0x82: { keyIdentifier: 'F19' },
    0x83: { keyIdentifier: 'F20' },
    0x84: { keyIdentifier: 'F21' },
    0x85: { keyIdentifier: 'F22' },
    0x86: { keyIdentifier: 'F23' },
    0x87: { keyIdentifier: 'F24' },

    // TODO: Test in WebKit
    0x90: { keyIdentifier: 'NumLock', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD },
    0x91: { keyIdentifier: 'Scroll' },

    // NOTE: Not exposed to browsers
    0xA0: { keyIdentifier: 'Shift', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
    0xA1: { keyIdentifier: 'Shift', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },
    0xA2: { keyIdentifier: 'Control', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
    0xA3: { keyIdentifier: 'Control', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },
    0xA4: { keyIdentifier: 'Alt', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
    0xA5: { keyIdentifier: 'Alt', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },

    0xA6: { keyIdentifier: 'BrowserBack' },
    0xA7: { keyIdentifier: 'BrowserForward' },
    0xA8: { keyIdentifier: 'BrowserRefresh' },
    0xA9: { keyIdentifier: 'BrowserStop' },
    0xAA: { keyIdentifier: 'BrowserSearch' },
    0xAB: { keyIdentifier: 'BrowserFavorites' },
    0xAC: { keyIdentifier: 'BrowserHome' },

    0xAD: { keyIdentifier: 'VolumeMute' },
    0xAE: { keyIdentifier: 'VolumeDown' },
    0xAF: { keyIdentifier: 'VolumeUp' },
    0xB0: { keyIdentifier: 'MediaNextTrack' },
    0xB1: { keyIdentifier: 'MediaPreviousTrack' },
    0xB2: { keyIdentifier: 'MediaStop' },
    0xB3: { keyIdentifier: 'MediaPlayPause' },

    0xB4: { keyIdentifier: 'LaunchMail' },
    0xB5: { keyIdentifier: 'SelectMedia' },
    0xB6: { keyIdentifier: 'LaunchApplication1' },
    0xB7: { keyIdentifier: 'LaunchApplication2' },

    0xBA: { keyIdentifier: 'U+00BA', keyName: 'Semicolon', keyNameShifted: 'Colon', keyChar: ';', keyCharShifted: ':' }, // ; : (US Standard)
    0xBB: { keyIdentifier: 'U+00BB', keyName: 'Equals', keyNameShifted: 'Plus', keyChar: '=', keyCharShifted: '+' }, // = +
    0xBC: { keyIdentifier: 'U+00BC', keyName: 'Comma', keyNameShifted: 'LessThan', keyChar: ',', keyCharShifted: '<' }, // , <
    0xBD: { keyIdentifier: 'U+00BD', keyName: 'Minus', keyNameShifted: 'Underscore', keyChar: '-', keyCharShifted: '_' }, // - _
    0xBE: { keyIdentifier: 'U+00BE', keyName: 'Period', keyNameShifted: 'GreaterThan', keyChar: '.', keyCharShifted: '>' }, // . >
    0xBF: { keyIdentifier: 'U+00BF', keyName: 'Solidus', keyNameShifted: 'QuestionMark', keyChar: '/', keyCharShifted: '?' }, // / ? (US Standard)
    0xC0: { keyIdentifier: 'U+00C0', keyName: 'Grave', keyNameShifted: 'Tilde', keyChar: '`', keyCharShifted: '~' }, // ` ~ (US Standard)
    0xDB: { keyIdentifier: 'U+00DB', keyName: 'LeftSquareBracket', keyNameShifted: 'LeftCurlyBracket', keyChar: '[', keyCharShifted: '{' }, // [ { (US Standard)
    0xDC: { keyIdentifier: 'U+00DC', keyName: 'Backslash', keyNameShifted: 'Pipe', keyChar: '\\', keyCharShifted: '|' }, // \ | (US Standard)
    0xDD: { keyIdentifier: 'U+00DD', keyName: 'RightSquareBracket', keyNameShifted: 'RightCurlyBracket', keyChar: ']', keyCharShifted: '}' }, // ] } (US Standard)
    0xDE: { keyIdentifier: 'U+00DE', keyName: 'Apostrophe', keyNameShifted: 'DoubleQuote', keyChar: '\'', keyCharShifted: '"' }, // ' " (US Standard)

    // TODO: Check keyIdentifier in WebKit
    0xE0: { keyIdentifier: 'Meta' }, // Apple Command key
    0xE5: { keyIdentifier: 'Process' }, // IME

    0xF6: { keyIdentifier: 'Attn' },
    0xF7: { keyIdentifier: 'Crsel' },
    0xF8: { keyIdentifier: 'Exsel' },
    0xF9: { keyIdentifier: 'EraseEof' },
    0xFA: { keyIdentifier: 'Play' },
    0xFB: { keyIdentifier: 'Zoom' },
    0xFE: { keyIdentifier: 'Clear' }
  };

  VK_SPECIAL = {

    // Mozilla special cases
    'moz': {
      0x3B: { keyIdentifier: 'U+00BA', keyName: 'Semicolon', keyChar: ';', keyCharShifted: ':' }, // ; : (US Standard)
      0x3D: { keyIdentifier: 'U+00BB', keyName: 'Equals', keyChar: '=', keyCharShifted: '+' }, // = +
      0x6B: { keyIdentifier: 'U+00BB', keyName: 'Equals', keyChar: '=', keyCharShifted: '+' }, // = +
      0x6D: { keyIdentifier: 'U+00BD', keyName: 'Minus', keyChar: '-', keyCharShifted: '_' }, // - _
      // TODO: Check keyIdentifier in WebKit for numpad
      0xBB: { keyIdentifier: 'Add', keyName: 'Add', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '+' },
      0xBD: { keyIdentifier: 'Subtract', keyName: 'Subtract', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '-' }
    },

    // Chrome WebKit special cases
    'chrome': {
    },
    'chrome-mac': {
      0x5B: { keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
      0x5D: { keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT }
    },


    // Safari WebKit special cases
    'safari': {
      0x03: { keyIdentifier: 'Enter', keyName: 'Enter', keyChar: '\u000D' }, // old Safari
      0x0A: { keyIdentifier: 'Enter', keyName: 'Enter', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_MOBILE, keyChar: '\u000D' }, // iOS
      0x19: { keyIdentifier: 'U+0009', keyName: 'Tab', keyChar: '\u0009'} // old Safari for Shift+Tab
    },
    'safari-mac': {
      0x5B: { keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
      0x5D: { keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },
      0xE5: { keyIdentifier: 'U+0051', keyName: 'Q', keyChar: 'Q'} // On alternate presses, Ctrl+Q sends this
    },

    // Opera special cases
    'opera': {
      // NOTE: several of these collide in theory, but most other keys are unrepresented
      0x2F: { keyIdentifier: 'Divide', keyName: 'Divide', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '/' }, // Same as 'Help'
      0x2A: { keyIdentifier: 'Multiply', keyName: 'Multiply', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '*' }, // Same as 'Print'
      //0x2D: { keyIdentifier: 'Subtract', keyName: 'Subtract', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD,   keyChar: '-' }, // Same as 'Insert'
      0x2B: { keyIdentifier: 'Add', keyName: 'Add', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '+' }, // Same as 'Execute'

      0x3B: { keyIdentifier: 'U+00BA', keyName: 'Semicolon', keyChar: ';', keyCharShifted: '' }, // ; : (US Standard)
      0x3D: { keyIdentifier: 'U+00BB', keyName: 'Equals', keyChar: '=', keyCharShifted: '' }, // = +

      0x6D: { keyIdentifier: 'U+00BD', keyName: 'Minus', keyChar: '-', keyCharShifted: '_'} // - _
    },
    'opera-mac': {
      0x11: { keyIdentifier: 'Meta' },
      0xE030: { keyIdentifier: 'Control' }
    }
  };


  function contains(s, ss) { return String(s).indexOf(ss) !== -1; }

  os = (function() {
    if (contains(navigator.platform, 'Win')) { return 'win'; }
    if (contains(navigator.platform, 'Mac')) { return 'mac'; }
    if (contains(navigator.platform, 'Linux')) { return 'linux'; }
    if (contains(navigator.userAgent, 'iPad') || contains(navigator.platform, 'iPod') || contains(navigator.platform, 'iPhone')) { return 'ios'; }
    return '';
  } ());

  browser = (function() {
    if (contains(navigator.userAgent, "Chrome/")) { return "chrome"; }
    if (contains(navigator.vendor, "Apple")) { return "safari"; }
    if (contains(navigator.userAgent, "MSIE")) { return "ie"; }
    if (contains(navigator.userAgent, "Gecko/")) { return "moz"; }
    if (contains(navigator.userAgent, "Opera/")) { return "opera"; }
    return "";
  } ());

  global.identifyKey = function(event) {

    var key_info;

    if (event.keyCode) {
      if (Object.prototype.hasOwnProperty.call(VK_SPECIAL, browser + '-' + os) && VK_SPECIAL[browser + '-' + os][event.keyCode]) {
        key_info = VK_SPECIAL[browser + '-' + os][event.keyCode];
      } else if (Object.prototype.hasOwnProperty.call(VK_SPECIAL, browser) && VK_SPECIAL[browser][event.keyCode]) {
        key_info = VK_SPECIAL[browser][event.keyCode];
      } else if (VK_COMMON[event.keyCode]) {
        key_info = VK_COMMON[event.keyCode];
      } else {
        return;
      }
    } else if (event.keyIdentifier) {
      // TODO: iOS only?
      // TODO: Override with more common keyIdentifier name?
      switch (event.keyIdentifier) {
      case 'U+0010': key_info = { keyName: 'Function' }; break;
      case 'U+001C': key_info = { keyName: 'Left' }; break;
      case 'U+001D': key_info = { keyName: 'Right' }; break;
      case 'U+001E': key_info = { keyName: 'Up' }; break;
      case 'U+001F': key_info = { keyName: 'Down' }; break;
      default: return;
      }
    }

    // FUTURE: Synthesize events per http://www.w3.org/TR/DOM-Level-3-Events/#key-algorithm

    event.keyName = key_info.keyName || key_info.keyIdentifier;
    event.keyLocation = event.keyLocation || key_info.keyLocation || KeyboardEvent.DOM_KEY_LOCATION_STANDARD;
    event.keyChar = event.shiftKey ? key_info.keyCharShifted : key_info.keyChar;
    event.keyIdentifier = event.keyIdentifier || key_info.keyIdentifier;
  };
} (window));
