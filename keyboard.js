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
    0x03: { usb: 0x07009b, keyIdentifier: 'Cancel' }, // char \x0018 ???
    0x06: { usb: 0x070075, keyIdentifier: 'Help' }, // ???
    0x08: { usb: 0x07002a, keyIdentifier: 'U+0008', keyName: 'Backspace', keyChar: '\u0008' },
    0x09: { usb: 0x07002b, keyIdentifier: 'U+0009', keyName: 'Tab', keyChar: '\u0009' },
    0X0C: { usb: 0x07009c, keyIdentifier: 'Clear' }, // NumPad Center
    0X0D: { usb: 0x070028, keyIdentifier: 'Enter', keyChar: '\u000D' },

    0x10: { usb: 0x0700e1, keyIdentifier: 'Shift' },
    0x11: { usb: 0x0700e0, keyIdentifier: 'Control' },
    0x12: { usb: 0x0700e2, keyIdentifier: 'Alt' },
    0x13: { usb: 0x070048, keyIdentifier: 'Pause' },
    0x14: { usb: 0x070039, keyIdentifier: 'CapsLock' },

    0x15: { usb: 0x070088, keyIdentifier: 'KanaMode' }, // IME
    0x16: { usb: 0x070090, keyIdentifier: 'HangulMode' }, // IME
    0x17: { usb: 0x000000, keyIdentifier: 'JunjaMode' }, // IME
    0x18: { usb: 0x000000, keyIdentifier: 'FinalMode' }, // IME
    0x19: { usb: 0x070091, keyIdentifier: 'HanjaMode' }, // IME
    //  0x19: { usb: 0x000000, keyIdentifier: 'KanjiMode', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_STANDARD }, // IME; duplicate on Windows

    0x1B: { usb: 0x070029, keyIdentifier: 'U+001B', keyName: 'Escape', keyChar: '\u001B' },

    0x1C: { usb: 0x000000, keyIdentifier: 'Convert' }, // IME
    0x1D: { usb: 0x000000, keyIdentifier: 'Nonconvert' }, // IME
    0x1E: { usb: 0x000000, keyIdentifier: 'Accept' }, // IME
    0x1F: { usb: 0x000000, keyIdentifier: 'ModeChange' }, // IME

    0x20: { usb: 0x07002c, keyIdentifier: 'U+0020', keyName: 'Spacebar', keyChar: ' ' },
    0x21: { usb: 0x07004b, keyIdentifier: 'PageUp' },
    0x22: { usb: 0x07004e, keyIdentifier: 'PageDown' },
    0x23: { usb: 0x07004d, keyIdentifier: 'End' },
    0x24: { usb: 0x07004a, keyIdentifier: 'Home' },
    0x25: { usb: 0x070050, keyIdentifier: 'Left' },
    0x26: { usb: 0x070052, keyIdentifier: 'Up' },
    0x27: { usb: 0x07004f, keyIdentifier: 'Right' },
    0x28: { usb: 0x070051, keyIdentifier: 'Down' },
    0x29: { usb: 0x070077, keyIdentifier: 'Select' },
    0x2A: { usb: 0x000000, keyIdentifier: 'Print' }, // ???
    0x2B: { usb: 0x070074, keyIdentifier: 'Execute' },
    0x2C: { usb: 0x070046, keyIdentifier: 'PrintScreen' },
    0x2D: { usb: 0x070049, keyIdentifier: 'Insert' },
    0x2E: { usb: 0x07004b, keyIdentifier: 'U+007F', keyName: 'Delete', keyChar: '\u007f' },
    0x2F: { usb: 0x070075, keyIdentifier: 'Help' }, // ???

    0x30: { usb: 0x070027, keyIdentifier: 'U+0030', keyName: '0', keyNameShifted: 'RightParen', keyChar: '0', keyCharShifted: ')' }, // 0)
    0x31: { usb: 0x07001e, keyIdentifier: 'U+0031', keyName: '1', keyNameShifted: 'Exclamation', keyChar: '1', keyCharShifted: '!' }, // 1!
    0x32: { usb: 0x07001f, keyIdentifier: 'U+0032', keyName: '2', keyNameShifted: 'At', keyChar: '2', keyCharShifted: '@' }, // 2@
    0x33: { usb: 0x070020, keyIdentifier: 'U+0033', keyName: '3', keyNameShifted: 'Hash', keyChar: '3', keyCharShifted: '#' }, // 3#
    0x34: { usb: 0x070021, keyIdentifier: 'U+0034', keyName: '4', keyNameShifted: 'Dollar', keyChar: '4', keyCharShifted: '$' }, // 4$
    0x35: { usb: 0x070022, keyIdentifier: 'U+0035', keyName: '5', keyNameShifted: 'Percent', keyChar: '5', keyCharShifted: '%' }, // 5%
    0x36: { usb: 0x070023, keyIdentifier: 'U+0036', keyName: '6', keyNameShifted: 'Circumflex', keyChar: '6', keyCharShifted: '^' }, // 6^
    0x37: { usb: 0x070024, keyIdentifier: 'U+0037', keyName: '7', keyNameShifted: 'Ampersand', keyChar: '7', keyCharShifted: '&' }, // 7&
    0x38: { usb: 0x070025, keyIdentifier: 'U+0038', keyName: '8', keyNameShifted: 'Asterisk', keyChar: '8', keyCharShifted: '*' }, // 8*
    0x39: { usb: 0x070026, keyIdentifier: 'U+0039', keyName: '9', keyNameShifted: 'LeftParen', keyChar: '9', keyCharShifted: '(' }, // 9(

    0x41: { usb: 0x070004, keyIdentifier: 'U+0041', keyName: 'A', keyChar: 'a', keyCharShifted: 'A' }, // aA
    0x42: { usb: 0x070005, keyIdentifier: 'U+0042', keyName: 'B', keyChar: 'b', keyCharShifted: 'B' }, // bB
    0x43: { usb: 0x070006, keyIdentifier: 'U+0043', keyName: 'C', keyChar: 'c', keyCharShifted: 'C' }, // cC
    0x44: { usb: 0x070007, keyIdentifier: 'U+0044', keyName: 'D', keyChar: 'd', keyCharShifted: 'D' }, // dD
    0x45: { usb: 0x070008, keyIdentifier: 'U+0045', keyName: 'E', keyChar: 'e', keyCharShifted: 'E' }, // eE
    0x46: { usb: 0x070009, keyIdentifier: 'U+0046', keyName: 'F', keyChar: 'f', keyCharShifted: 'F' }, // fF
    0x47: { usb: 0x07000a, keyIdentifier: 'U+0047', keyName: 'G', keyChar: 'g', keyCharShifted: 'G' }, // gG
    0x48: { usb: 0x07000b, keyIdentifier: 'U+0048', keyName: 'H', keyChar: 'h', keyCharShifted: 'H' }, // hH
    0x49: { usb: 0x07000c, keyIdentifier: 'U+0049', keyName: 'I', keyChar: 'i', keyCharShifted: 'I' }, // iI
    0x4A: { usb: 0x07000d, keyIdentifier: 'U+004A', keyName: 'J', keyChar: 'j', keyCharShifted: 'J' }, // jJ
    0x4B: { usb: 0x07000e, keyIdentifier: 'U+004B', keyName: 'K', keyChar: 'k', keyCharShifted: 'K' }, // kK
    0x4C: { usb: 0x07000f, keyIdentifier: 'U+004C', keyName: 'L', keyChar: 'l', keyCharShifted: 'L' }, // lL
    0x4D: { usb: 0x070010, keyIdentifier: 'U+004D', keyName: 'M', keyChar: 'm', keyCharShifted: 'M' }, // mM
    0x4E: { usb: 0x070011, keyIdentifier: 'U+004E', keyName: 'N', keyChar: 'n', keyCharShifted: 'N' }, // nN
    0x4F: { usb: 0x070012, keyIdentifier: 'U+004F', keyName: 'O', keyChar: 'o', keyCharShifted: 'O' }, // oO
    0x50: { usb: 0x070013, keyIdentifier: 'U+0050', keyName: 'P', keyChar: 'p', keyCharShifted: 'P' }, // pP
    0x51: { usb: 0x070014, keyIdentifier: 'U+0051', keyName: 'Q', keyChar: 'q', keyCharShifted: 'Q' }, // qQ
    0x52: { usb: 0x070015, keyIdentifier: 'U+0052', keyName: 'R', keyChar: 'r', keyCharShifted: 'R' }, // rR
    0x53: { usb: 0x070016, keyIdentifier: 'U+0053', keyName: 'S', keyChar: 's', keyCharShifted: 'S' }, // sS
    0x54: { usb: 0x070017, keyIdentifier: 'U+0054', keyName: 'T', keyChar: 't', keyCharShifted: 'T' }, // tT
    0x55: { usb: 0x070018, keyIdentifier: 'U+0055', keyName: 'U', keyChar: 'u', keyCharShifted: 'U' }, // uU
    0x56: { usb: 0x070019, keyIdentifier: 'U+0056', keyName: 'V', keyChar: 'v', keyCharShifted: 'V' }, // vV
    0x57: { usb: 0x07001a, keyIdentifier: 'U+0057', keyName: 'W', keyChar: 'w', keyCharShifted: 'W' }, // wW
    0x58: { usb: 0x07001b, keyIdentifier: 'U+0058', keyName: 'X', keyChar: 'x', keyCharShifted: 'X' }, // xX
    0x59: { usb: 0x07001c, keyIdentifier: 'U+0059', keyName: 'Y', keyChar: 'y', keyCharShifted: 'Y' }, // yY
    0x5A: { usb: 0x07001d, keyIdentifier: 'U+005A', keyName: 'Z', keyChar: 'z', keyCharShifted: 'Z' }, // zZ

    0x5B: { usb: 0x0700e3, keyIdentifier: 'Win', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT }, // Left Windows
    0x5C: { usb: 0x0700e7, keyIdentifier: 'Win', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT }, // Right Windows
    0x5D: { usb: 0x070065, keyIdentifier: 'Apps' }, // Context Menu

    // TODO: Test in WebKit
    0x60: { usb: 0x070062, keyIdentifier: 'U+0040', keyName: '0', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '0' },
    0x61: { usb: 0x070059, keyIdentifier: 'U+0041', keyName: '1', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '1' },
    0x62: { usb: 0x07005a, keyIdentifier: 'U+0042', keyName: '2', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '2' },
    0x63: { usb: 0x07005b, keyIdentifier: 'U+0043', keyName: '3', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '3' },
    0x64: { usb: 0x07005c, keyIdentifier: 'U+0044', keyName: '4', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '4' },
    0x65: { usb: 0x07005d, keyIdentifier: 'U+0045', keyName: '5', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '5' },
    0x66: { usb: 0x07005e, keyIdentifier: 'U+0046', keyName: '6', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '6' },
    0x67: { usb: 0x07005f, keyIdentifier: 'U+0047', keyName: '7', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '7' },
    0x68: { usb: 0x070060, keyIdentifier: 'U+0048', keyName: '8', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '8' },
    0x69: { usb: 0x070061, keyIdentifier: 'U+0049', keyName: '9', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '9' },

    // TODO: Test in WebKit
    0x6A: { usb: 0x070055, keyIdentifier: 'Multiply', keyName: 'Multiply', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '*' }, // or 'Asterisk' ?
    0x6B: { usb: 0x070057, keyIdentifier: 'Add', keyName: 'Add', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '+' },
    0x6C: { usb: 0x070058, keyIdentifier: 'Separator', keyName: 'Separator', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD }, // ??? NumPad Enter ???
    0x6D: { usb: 0x070056, keyIdentifier: 'Subtract', keyName: 'Subtract', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '-' },
    0x6E: { usb: 0x070063, keyIdentifier: 'Decimal', keyName: 'Decimal', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '.' },
    0x6F: { usb: 0x070054, keyIdentifier: 'Divide', keyName: 'Divide', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '/' },

    // TODO: Test in WebKit
    0x70: { usb: 0x07003a, keyIdentifier: 'F1' },
    0x71: { usb: 0x07003b, keyIdentifier: 'F2' },
    0x72: { usb: 0x07003c, keyIdentifier: 'F3' },
    0x73: { usb: 0x07003d, keyIdentifier: 'F4' },
    0x74: { usb: 0x07003e, keyIdentifier: 'F5' },
    0x75: { usb: 0x07003f, keyIdentifier: 'F6' },
    0x76: { usb: 0x070040, keyIdentifier: 'F7' },
    0x77: { usb: 0x070041, keyIdentifier: 'F8' },
    0x78: { usb: 0x070042, keyIdentifier: 'F9' },
    0x79: { usb: 0x070043, keyIdentifier: 'F10' },
    0x7A: { usb: 0x070044, keyIdentifier: 'F11' },
    0x7B: { usb: 0x070045, keyIdentifier: 'F12' },
    0x7C: { usb: 0x070068, keyIdentifier: 'F13' },
    0x7D: { usb: 0x070069, keyIdentifier: 'F14' },
    0x7E: { usb: 0x07006a, keyIdentifier: 'F15' },
    0x7F: { usb: 0x07006b, keyIdentifier: 'F16' },
    0x80: { usb: 0x07006c, keyIdentifier: 'F17' },
    0x81: { usb: 0x07006d, keyIdentifier: 'F18' },
    0x82: { usb: 0x07006e, keyIdentifier: 'F19' },
    0x83: { usb: 0x07006f, keyIdentifier: 'F20' },
    0x84: { usb: 0x070070, keyIdentifier: 'F21' },
    0x85: { usb: 0x070071, keyIdentifier: 'F22' },
    0x86: { usb: 0x070072, keyIdentifier: 'F23' },
    0x87: { usb: 0x070073, keyIdentifier: 'F24' },

    // TODO: Test in WebKit
    0x90: { usb: 0x070053, keyIdentifier: 'NumLock', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD },
    0x91: { usb: 0x070047, keyIdentifier: 'Scroll' },

    // NOTE: Not exposed to browsers
    0xA0: { usb: 0x0700e1, keyIdentifier: 'Shift', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
    0xA1: { usb: 0x0700e5, keyIdentifier: 'Shift', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },
    0xA2: { usb: 0x0700e0, keyIdentifier: 'Control', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
    0xA3: { usb: 0x0700e4, keyIdentifier: 'Control', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },
    0xA4: { usb: 0x0700e2, keyIdentifier: 'Alt', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
    0xA5: { usb: 0x0700e6, keyIdentifier: 'Alt', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },

    0xA6: { usb: 0x0c0224, keyIdentifier: 'BrowserBack' },
    0xA7: { usb: 0x0c0225, keyIdentifier: 'BrowserForward' },
    0xA8: { usb: 0x0c0227, keyIdentifier: 'BrowserRefresh' },
    0xA9: { usb: 0x0c0226, keyIdentifier: 'BrowserStop' },
    0xAA: { usb: 0x0c0221, keyIdentifier: 'BrowserSearch' },
    0xAB: { usb: 0x0c0228, keyIdentifier: 'BrowserFavorites' },
    0xAC: { usb: 0x0c0223, keyIdentifier: 'BrowserHome' },

    0xAD: { usb: 0x07007f, keyIdentifier: 'VolumeMute' },
    0xAE: { usb: 0x070081, keyIdentifier: 'VolumeDown' },
    0xAF: { usb: 0x070080, keyIdentifier: 'VolumeUp' },
    0xB0: { usb: 0x0c00b5, keyIdentifier: 'MediaNextTrack' },
    0xB1: { usb: 0x0c00b6, keyIdentifier: 'MediaPreviousTrack' },
    0xB2: { usb: 0x0c00b7, keyIdentifier: 'MediaStop' },
    0xB3: { usb: 0x0c00cd, keyIdentifier: 'MediaPlayPause' },

    0xB4: { usb: 0x0c018a, keyIdentifier: 'LaunchMail' },
    0xB5: { usb: 0x000000, keyIdentifier: 'SelectMedia' },
    0xB6: { usb: 0x000000, keyIdentifier: 'LaunchApplication1' },
    0xB7: { usb: 0x000000, keyIdentifier: 'LaunchApplication2' },

    0xBA: { usb: 0x070033, keyIdentifier: 'U+00BA', keyName: 'Semicolon', keyNameShifted: 'Colon', keyChar: ';', keyCharShifted: ':' }, // ;: (US Standard)
    0xBB: { usb: 0x07002e, keyIdentifier: 'U+00BB', keyName: 'Equals', keyNameShifted: 'Plus', keyChar: '=', keyCharShifted: '+' }, // =+
    0xBC: { usb: 0x070036, keyIdentifier: 'U+00BC', keyName: 'Comma', keyNameShifted: 'LessThan', keyChar: ',', keyCharShifted: '<' }, // ,<
    0xBD: { usb: 0x07002d, keyIdentifier: 'U+00BD', keyName: 'Minus', keyNameShifted: 'Underscore', keyChar: '-', keyCharShifted: '_' }, // -_
    0xBE: { usb: 0x070037, keyIdentifier: 'U+00BE', keyName: 'Period', keyNameShifted: 'GreaterThan', keyChar: '.', keyCharShifted: '>' }, // .>
    0xBF: { usb: 0x070038, keyIdentifier: 'U+00BF', keyName: 'Solidus', keyNameShifted: 'QuestionMark', keyChar: '/', keyCharShifted: '?' }, // /? (US Standard)
    0xC0: { usb: 0x070035, keyIdentifier: 'U+00C0', keyName: 'Grave', keyNameShifted: 'Tilde', keyChar: '`', keyCharShifted: '~' }, // `~ (US Standard)
    0xDB: { usb: 0x07002f, keyIdentifier: 'U+00DB', keyName: 'LeftSquareBracket', keyNameShifted: 'LeftCurlyBracket', keyChar: '[', keyCharShifted: '{' }, // [{ (US Standard)
    0xDC: { usb: 0x070031, keyIdentifier: 'U+00DC', keyName: 'Backslash', keyNameShifted: 'Pipe', keyChar: '\\', keyCharShifted: '|' }, // \| (US Standard)
    0xDD: { usb: 0x070030, keyIdentifier: 'U+00DD', keyName: 'RightSquareBracket', keyNameShifted: 'RightCurlyBracket', keyChar: ']', keyCharShifted: '}' }, // ]} (US Standard)
    0xDE: { usb: 0x070034, keyIdentifier: 'U+00DE', keyName: 'Apostrophe', keyNameShifted: 'DoubleQuote', keyChar: '\'', keyCharShifted: '"' }, // '" (US Standard)

    // TODO: Check keyIdentifier in WebKit
    0xE0: { usb: 0x0700e0, keyIdentifier: 'Meta' }, // Apple Command key
    0xE5: { usb: 0x000000, keyIdentifier: 'Process' }, // IME

    0xF6: { usb: 0x07009a, keyIdentifier: 'Attn' },
    0xF7: { usb: 0x0700a3, keyIdentifier: 'Crsel' },
    0xF8: { usb: 0x0700a4, keyIdentifier: 'Exsel' },
    0xF9: { usb: 0x000000, keyIdentifier: 'EraseEof' },
    0xFA: { usb: 0x000000, keyIdentifier: 'Play' },
    0xFB: { usb: 0x000000, keyIdentifier: 'Zoom' },
    0xFE: { usb: 0x07009c, keyIdentifier: 'Clear' }
  };

  VK_SPECIAL = {

    // Mozilla special cases
    'moz': {
      0x3B: { usb: 0x070033, keyIdentifier: 'U+00BA', keyName: 'Semicolon', keyChar: ';', keyCharShifted: ':' }, // ;: (US Standard)
      0x3D: { usb: 0x07002e, keyIdentifier: 'U+00BB', keyName: 'Equals', keyChar: '=', keyCharShifted: '+' }, // =+
      0x6B: { usb: 0x07002e, keyIdentifier: 'U+00BB', keyName: 'Equals', keyChar: '=', keyCharShifted: '+' }, // =+
      0x6D: { usb: 0x07002d, keyIdentifier: 'U+00BD', keyName: 'Minus', keyChar: '-', keyCharShifted: '_' }, // -_
      // TODO: Check keyIdentifier in WebKit for numpad
      0xBB: { usb: 0x070057, keyIdentifier: 'Add', keyName: 'Add', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '+' },
      0xBD: { usb: 0x070056, keyIdentifier: 'Subtract', keyName: 'Subtract', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '-' }
    },

    // Chrome WebKit special cases
    'chrome': {
    },
    'chrome-mac': {
      0x5B: { usb: 0x0700e3, keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
      0x5D: { usb: 0x0700e7, keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT }
    },


    // Safari WebKit special cases
    'safari': {
      0x03: { usb: 0x070028, keyIdentifier: 'Enter', keyName: 'Enter', keyChar: '\u000D' }, // old Safari
      0x0A: { usb: 0x070028, keyIdentifier: 'Enter', keyName: 'Enter', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_MOBILE, keyChar: '\u000D' }, // iOS
      0x19: { usb: 0x07002b, keyIdentifier: 'U+0009', keyName: 'Tab', keyChar: '\u0009'} // old Safari for Shift+Tab
    },
    'safari-mac': {
      0x5B: { usb: 0x0700e3, keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_LEFT },
      0x5D: { usb: 0x0700e7, keyIdentifier: 'Meta', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_RIGHT },
      0xE5: { usb: 0x070014, keyIdentifier: 'U+0051', keyName: 'Q', keyChar: 'Q'} // On alternate presses, Ctrl+Q sends this
    },

    // Opera special cases
    'opera': {
      // NOTE: several of these collide in theory, but most other keys are unrepresented
      0x2F: { usb: 0x070054, keyIdentifier: 'Divide', keyName: 'Divide', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '/' }, // Same as 'Help'
      0x2A: { usb: 0x070055, keyIdentifier: 'Multiply', keyName: 'Multiply', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '*' }, // Same as 'Print'
      //0x2D: { usb: 0x070056, keyIdentifier: 'Subtract', keyName: 'Subtract', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD,   keyChar: '-' }, // Same as 'Insert'
      0x2B: { usb: 0x070057, keyIdentifier: 'Add', keyName: 'Add', keyLocation: KeyboardEvent.DOM_KEY_LOCATION_NUMPAD, keyChar: '+' }, // Same as 'Execute'

      0x3B: { usb: 0x070033, keyIdentifier: 'U+00BA', keyName: 'Semicolon', keyChar: ';', keyCharShifted: '' }, // ;: (US Standard)
      0x3D: { usb: 0x07002e, keyIdentifier: 'U+00BB', keyName: 'Equals', keyChar: '=', keyCharShifted: '' }, // =+

      0x6D: { usb: 0x07002d, keyIdentifier: 'U+00BD', keyName: 'Minus', keyChar: '-', keyCharShifted: '_'} // -_
    },
    'opera-mac': {
      0x11: { usb: 0x0700e3, keyIdentifier: 'Meta' },
      0xE030: { usb: 0x0700e0, keyIdentifier: 'Control' }
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
    event.usbUsage = event.usbUsage || key_info.usb;
  };
} (window));
