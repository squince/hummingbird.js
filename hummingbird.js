(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
diacritics = require('diacritics');

},{"diacritics":2}],2:[function(require,module,exports){
var DIACRITICS_REMOVAL_MAP = [
  {
    base: ' ',
    regex: /[\u00A0]/g
  }, {
    base: '0',
    regex: /[\u07C0]/g
  }, {
    base: 'A',
    regex: /[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g
  }, {
    base: 'AA',
    regex: /[\uA732]/g
  }, {
    base: 'AE',
    regex: /[\u00C6\u01FC\u01E2]/g
  }, {
    base: 'AO',
    regex: /[\uA734]/g
  }, {
    base: 'AU',
    regex: /[\uA736]/g
  }, {
    base: 'AV',
    regex: /[\uA738\uA73A]/g
  }, {
    base: 'AY',
    regex: /[\uA73C]/g
  }, {
    base: 'B',
    regex: /[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0181]/g
  }, {
    base: 'C',
    regex: /[\uFF43\u24b8\uff23\uA73E\u1E08]/g
  }, {
    base: 'D',
    regex: /[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018A\u0189\u1D05\uA779]/g
  }, {
    base: 'Dh',
    regex: /[\u00D0]/g
  }, {
    base: 'DZ',
    regex: /[\u01F1\u01C4]/g
  }, {
    base: 'Dz',
    regex: /[\u01F2\u01C5]/g
  }, {
    base: 'E',
    regex: /[\u025B\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E\u1D07]/g
  }, {
    base: 'F',
    regex: /[\uA77C\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g
  }, {
    base: 'G',
    regex: /[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E\u0262]/g
  }, {
    base: 'H',
    regex: /[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g
  }, {
    base: 'I',
    regex: /[\x49\u24BE\uFF29\xCC\xCD\xCE\u0128\u012A\u012C\u0130\xCF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g
  }, {
    base: 'J',
    regex: /[\x4A\u24BF\uFF2A\u0134\u0248\u0237]/g
  }, {
    base: 'K',
    regex: /[\x4B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g
  }, {
    base: 'L',
    regex: /[\x4C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g
  }, {
    base: 'LJ',
    regex: /[\u01C7]/g
  }, {
    base: 'Lj',
    regex: /[\u01C8]/g
  }, {
    base: 'M',
    regex: /[\x4D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C\u03FB]/g
  }, {
    base: 'N',
    regex: /[\uA7A4\u0220\x4E\u24C3\uFF2E\u01F8\u0143\xD1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u019D\uA790\u1D0E]/g
  }, {
    base: 'NJ',
    regex: /[\u01CA]/g
  }, {
    base: 'Nj',
    regex: /[\u01CB]/g
  }, {
    base: 'O',
    regex: /[\u24C4\uFF2F\xD2\xD3\xD4\u1ED2\u1ED0\u1ED6\u1ED4\xD5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\xD6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\xD8\u01FE\u0186\x4F\u019F\uA74A\uA74C]/g
  }, {
    base: 'OE',
    regex: /[\u0152]/g
  }, {
    base: 'OI',
    regex: /[\u01A2]/g
  }, {
    base: 'OO',
    regex: /[\uA74E]/g
  }, {
    base: 'OU',
    regex: /[\u0222]/g
  }, {
    base: 'P',
    regex: /[\x50\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g
  }, {
    base: 'Q',
    regex: /[\x51\u24C6\uFF31\uA756\uA758\u024A]/g
  }, {
    base: 'R',
    regex: /[\x52\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g
  }, {
    base: 'S',
    regex: /[\x53\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g
  }, {
    base: 'T',
    regex: /[\x54\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g
  }, {
    base: 'Th',
    regex: /[\u00DE]/g
  }, {
    base: 'TZ',
    regex: /[\uA728]/g
  }, {
    base: 'U',
    regex: /[\x55\u24CA\uFF35\xD9\xDA\xDB\u0168\u1E78\u016A\u1E7A\u016C\xDC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g
  }, {
    base: 'V',
    regex: /[\x56\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g
  }, {
    base: 'VY',
    regex: /[\uA760]/g
  }, {
    base: 'W',
    regex: /[\x57\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g
  }, {
    base: 'X',
    regex: /[\x58\u24CD\uFF38\u1E8A\u1E8C]/g
  }, {
    base: 'Y',
    regex: /[\x59\u24CE\uFF39\u1EF2\xDD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g
  }, {
    base: 'Z',
    regex: /[\x5A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g
  }, {
    base: 'a',
    regex: /[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250\u0251]/g
  }, {
    base: 'aa',
    regex: /[\uA733]/g
  }, {
    base: 'ae',
    regex: /[\u00E6\u01FD\u01E3]/g
  }, {
    base: 'ao',
    regex: /[\uA735]/g
  }, {
    base: 'au',
    regex: /[\uA737]/g
  }, {
    base: 'av',
    regex: /[\uA739\uA73B]/g
  }, {
    base: 'ay',
    regex: /[\uA73D]/g
  }, {
    base: 'b',
    regex: /[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253\u0182]/g
  }, {
    base: 'c',
    regex: /[\u0063\u24D2\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184\u0043\u0106\u0108\u010A\u010C\u00C7\u0187\u023B]/g
  }, {
    base: 'd',
    regex: /[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\u018B\u13E7\u0501\uA7AA]/g
  }, {
    base: 'dh',
    regex: /[\u00F0]/g
  }, {
    base: 'dz',
    regex: /[\u01F3\u01C6]/g
  }, {
    base: 'e',
    regex: /[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u01DD]/g
  }, {
    base: 'f',
    regex: /[\u0066\u24D5\uFF46\u1E1F\u0192]/g
  }, {
    base: 'ff',
    regex: /[\uFB00]/g
  }, {
    base: 'fi',
    regex: /[\uFB01]/g
  }, {
    base: 'fl',
    regex: /[\uFB02]/g
  }, {
    base: 'ffi',
    regex: /[\uFB03]/g
  }, {
    base: 'ffl',
    regex: /[\uFB04]/g
  }, {
    base: 'g',
    regex: /[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\uA77F\u1D79]/g
  }, {
    base: 'h',
    regex: /[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g
  }, {
    base: 'hv',
    regex: /[\u0195]/g
  }, {
    base: 'i',
    regex: /[\x69\u24D8\uFF49\xEC\xED\xEE\u0129\u012B\u012D\xEF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g
  }, {
    base: 'j',
    regex: /[\x6A\u24D9\uFF4A\u0135\u01F0\u0249]/g
  }, {
    base: 'k',
    regex: /[\x6B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g
  }, {
    base: 'l',
    regex: /[\x6C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747\u026D]/g
  }, {
    base: 'lj',
    regex: /[\u01C9]/g
  }, {
    base: 'm',
    regex: /[\x6D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g
  }, {
    base: 'n',
    regex: /[\x6E\u24DD\uFF4E\u01F9\u0144\xF1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5\u043B\u0509]/g
  }, {
    base: 'nj',
    regex: /[\u01CC]/g
  }, {
    base: 'o',
    regex: /[\x6F\u24DE\uFF4F\xF2\xF3\xF4\u1ED3\u1ED1\u1ED7\u1ED5\xF5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\xF6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\xF8\u01FF\uA74B\uA74D\u0275\u0254\u1D11]/g
  }, {
    base: 'oe',
    regex: /[\u0153]/g
  }, {
    base: 'oi',
    regex: /[\u01A3]/g
  }, {
    base: 'oo',
    regex: /[\uA74F]/g
  }, {
    base: 'ou',
    regex: /[\u0223]/g
  }, {
    base: 'p',
    regex: /[\x70\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755\u03C1]/g
  }, {
    base: 'q',
    regex: /[\x71\u24E0\uFF51\u024B\uA757\uA759]/g
  }, {
    base: 'r',
    regex: /[\x72\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g
  }, {
    base: 's',
    regex: /[\x73\u24E2\uFF53\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B\u0282]/g
  }, {
    base: 'ss',
    regex: /[\xDF]/g
  }, {
    base: 't',
    regex: /[\x74\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g
  }, {
    base: 'th',
    regex: /[\u00FE]/g
  }, {
    base: 'tz',
    regex: /[\uA729]/g
  }, {
    base: 'u',
    regex: /[\x75\u24E4\uFF55\xF9\xFA\xFB\u0169\u1E79\u016B\u1E7B\u016D\xFC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g
  }, {
    base: 'v',
    regex: /[\x76\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g
  }, {
    base: 'vy',
    regex: /[\uA761]/g
  }, {
    base: 'w',
    regex: /[\x77\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g
  }, {
    base: 'x',
    regex: /[\x78\u24E7\uFF58\u1E8B\u1E8D]/g
  }, {
    base: 'y',
    regex: /[\x79\u24E8\uFF59\u1EF3\xFD\u0177\u1EF9\u0233\u1E8F\xFF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g
  }, {
    base: 'z',
    regex: /[\x7A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g
  }
], MAP_LENGTH = DIACRITICS_REMOVAL_MAP.length;

var ALL_ASCII_REGEX = /^[\x00-\x7f]*$/;

exports.remove = function (str) {
  if (ALL_ASCII_REGEX.test(str)) {
    // this code path is roughly 15x faster (at the time of writing),
    // and it is the common case.
    return str;
  }
  for (var i = 0; i < MAP_LENGTH; ++i) {
    var removal = DIACRITICS_REMOVAL_MAP[i];
    str = str.replace(removal.regex, removal.base);
  }
  return str;
}

},{}]},{},[1])
var hummingbird;

hummingbird = function(variantsObj) {
  var idx;
  idx = new hummingbird.Index(variantsObj);
  return idx;
};

hummingbird.loggingOn = false;

hummingbird.version = "0.5.0";

hummingbird.index_version = "3.0";

if (typeof module !== 'undefined' && module !== null) {
  module.exports = hummingbird;
}

hummingbird.Utils = function() {
  this.root = {};
};

hummingbird.Utils.prototype.warn = function(message) {
  if (console.warn) {
    return console.warn(message);
  }
};

hummingbird.Utils.prototype.logTiming = function(msg) {
  var d;
  if (console.log && hummingbird.loggingOn) {
    d = new Date();
    return console.log(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '.' + d.getMilliseconds() + ' - ' + msg);
  }
};

hummingbird.Utils.prototype.normalizeString = function(str) {
  return diacritics.remove((str.toString()).toLowerCase());
};

hummingbird.Utils.prototype.maxScore = function(phrase, tokenizer, boost) {
  var score;
  score = 0;
  if (phrase == null) {
    return score;
  }
  (tokenizer.tokenize(phrase)).forEach((function(token, i, tokens) {
    return score += this.tokenScore(token, boost);
  }), this);
  return score;
};

hummingbird.Utils.prototype.tokenScore = function(token, boost) {
  var len, score;
  len = token.length;
  return score = boost && token.substring(0, 1) === '\u0002' ? len + 2 : len;
};

hummingbird.EventEmitter = function() {
  this.events = {};
};

hummingbird.EventEmitter.prototype.addListener = function() {
  var args, fn, names;
  args = Array.prototype.slice.call(arguments);
  fn = args.pop();
  names = args;
  if (typeof fn !== 'function') {
    throw new TypeError('last argument must be a function');
  }
  names.forEach((function(name) {
    if (!this.hasHandler(name)) {
      this.events[name] = [];
    }
    this.events[name].push(fn);
  }), this);
};

hummingbird.EventEmitter.prototype.removeListener = function(name, fn) {
  var fnIndex;
  if (!this.hasHandler(name)) {
    return;
  }
  fnIndex = this.events[name].indexOf(fn);
  this.events[name].splice(fnIndex, 1);
  if (!this.events[name].length) {
    delete this.events[name];
  }
};

hummingbird.EventEmitter.prototype.emit = function(name) {
  var args;
  if (!this.hasHandler(name)) {
    return;
  }
  args = Array.prototype.slice.call(arguments, 1);
  this.events[name].forEach(function(fn) {
    fn.apply(undefined, args);
  });
};

hummingbird.EventEmitter.prototype.hasHandler = function(name) {
  return name in this.events;
};

hummingbird.Index = function(variantsObj) {
  this.tokenStore = new hummingbird.TokenStore;
  this.metaStore = new hummingbird.MetaStore;
  if (variantsObj != null) {
    this.variantStore = new hummingbird.VariantStore(variantsObj);
  } else {
    this.variantStore = new hummingbird.VariantStore;
  }
  this.eventEmitter = new hummingbird.EventEmitter;
  this.tokenizer = new hummingbird.tokenizer;
  this.utils = new hummingbird.Utils;
};

hummingbird.Index.prototype.on = function() {
  var args;
  args = Array.prototype.slice.call(arguments);
  return this.eventEmitter.addListener.apply(this.eventEmitter, args);
};

hummingbird.Index.prototype.off = function(name, fn) {
  return this.eventEmitter.removeListener(name, fn);
};

hummingbird.Index.load = function(serializedData) {
  var idx;
  idx = new this;
  if (serializedData.index_version !== hummingbird.index_version) {
    idx.utils.warn('version mismatch: current ' + hummingbird.index_version + ' importing ' + serializedData.index_version);
  }
  idx.tokenStore = hummingbird.TokenStore.load(serializedData.tokenStore);
  idx.metaStore = serializedData.hasOwnProperty('metaStore') ? hummingbird.MetaStore.load(serializedData.metaStore) : undefined;
  idx.variantStore = serializedData.hasOwnProperty('variantStore') ? hummingbird.VariantStore.load(serializedData.variantStore) : undefined;
  return idx;
};

hummingbird.Index.prototype.add = function(doc, emitEvent, indexCallback) {
  var allDocumentTokens, i, token, tokens;
  allDocumentTokens = {};
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  if (indexCallback) {
    tokens = this.tokenizer.tokenize("" + (indexCallback(doc)));
  } else {
    tokens = this.tokenizer.tokenize(doc['name']);
  }
  for (i in tokens) {
    token = tokens[i];
    allDocumentTokens[token] = token.length;
  }
  Object.keys(allDocumentTokens).forEach((function(token) {
    this.tokenStore.add(token, doc['id']);
  }), this);
  this.metaStore.add(doc);
  if (emitEvent) {
    this.eventEmitter.emit('add', doc, this);
  }
};

hummingbird.Index.prototype.remove = function(docRef, emitEvent) {
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  this.metaStore.remove(docRef);
  this.tokenStore.remove(docRef);
  if (emitEvent) {
    this.eventEmitter.emit('remove', docRef, this);
  }
};

hummingbird.Index.prototype.update = function(doc, emitEvent) {
  emitEvent = (emitEvent === undefined ? true : emitEvent);
  this.remove(doc, false);
  this.add(doc, false);
  if (emitEvent) {
    this.eventEmitter.emit('update', doc, this);
  }
};

hummingbird.Index.prototype.search = function(query, callback, options) {
  var boost, docSetArray, docSetHash, hasSomeToken, key, maxScore, norm_query, numResults, offset, queryTokens, resultSet, results, threshold;
  if ((query == null) || query.length < (this.tokenizer.min - 1)) {
    callback([]);
  }
  numResults = (options != null ? options.howMany : void 0) === undefined ? 10 : Math.floor(options.howMany);
  offset = (options != null ? options.startPos : void 0) === undefined ? 0 : Math.floor(options.startPos);
  boost = ((options != null ? options.boostPrefix : void 0) == null) || (options != null ? options.boostPrefix : void 0) ? true : false;
  maxScore = this.utils.maxScore(query, this.tokenizer, boost);
  docSetHash = {};
  docSetArray = [];
  norm_query = this.utils.normalizeString(query);
  queryTokens = this.tokenizer.tokenize(norm_query);
  hasSomeToken = queryTokens.some(function(token) {
    return this.tokenStore.has(token);
  }, this);
  if (!hasSomeToken) {
    return [];
  }
  this.utils.logTiming('find matching docs * start');
  queryTokens.forEach((function(token, i, tokens) {
    this.tokenStore.get(token).forEach((function(docRef, i, documents) {
      var docScore;
      docScore = this.utils.tokenScore(token, options);
      if (docRef in docSetHash) {
        docSetHash[docRef] += docScore;
      } else {
        docSetHash[docRef] = docScore;
      }
    }), this);
  }), this);
  this.utils.logTiming('find matching docs * finish');
  if ((options != null ? options.scoreThreshold : void 0) == null) {
    threshold = 0.5 * maxScore;
  } else if ((options != null ? options.scoreThreshold : void 0) < 0) {
    threshold = 0;
  } else if ((options != null ? options.scoreThreshold : void 0) > 1) {
    threshold = maxScore;
  } else {
    threshold = options.scoreThreshold * maxScore;
  }
  this.utils.logTiming('hash to array * start');
  for (key in docSetHash) {
    if (docSetHash[key] >= threshold) {
      docSetArray.push({
        id: key,
        score: docSetHash[key]
      });
    }
  }
  this.utils.logTiming('hash to array * finish');
  this.utils.logTiming('array size = ' + docSetArray.length);
  this.utils.logTiming('sort * start');
  docSetArray.sort(function(a, b) {
    return b.score - a.score;
  });
  this.utils.logTiming('sort * finish');
  this.utils.logTiming('add meta * start');
  results = docSetArray.slice(offset, numResults);
  resultSet = results.map(function(result, i, results) {
    result = this.metaStore.get(result.id);
    result.score = results[i].score;
    this.utils.logTiming("id: " + result.id + ", score: " + result.score);
    return result;
  }, this);
  callback(resultSet);
  return this.utils.logTiming('add meta * finish');
};

hummingbird.Index.prototype.toJSON = function() {
  return {
    version: hummingbird.version,
    index_version: hummingbird.index_version,
    tokenStore: this.tokenStore.toJSON(),
    metaStore: this.metaStore.toJSON(),
    variantStore: this.variantStore.toJSON()
  };
};

hummingbird.MetaStore = function() {
  this.root = {};
};

hummingbird.MetaStore.load = function(serializedData) {
  var store;
  store = new this;
  store.root = serializedData.root;
  return store;
};

hummingbird.MetaStore.prototype.toJSON = function() {
  return {
    root: this.root
  };
};

hummingbird.MetaStore.prototype.add = function(doc) {
  if (!(this.has(doc['id']) || doc === undefined)) {
    this.root[doc['id']] = doc;
  }
};

hummingbird.MetaStore.prototype.has = function(docId) {
  if (!docId) {
    return false;
  }
  if (docId in this.root) {
    return true;
  } else {
    return false;
  }
};

hummingbird.MetaStore.prototype.get = function(docId) {
  return this.root[docId] || {};
};

hummingbird.MetaStore.prototype.remove = function(docId) {
  if (!docId || !this.root[docId]) {
    return;
  }
  return delete this.root[docId];
};

hummingbird.TokenStore = function() {
  this.root = {};
};

hummingbird.TokenStore.load = function(serializedData) {
  var store;
  store = new this;
  store.root = serializedData.root;
  return store;
};

hummingbird.TokenStore.prototype.toJSON = function() {
  return {
    root: this.root
  };
};

hummingbird.TokenStore.prototype.add = function(token, docId) {
  if (!this.has(token)) {
    this.root[token] = [];
  }
  if (this.root[token][docId] === undefined) {
    this.root[token].push(docId);
  }
};

hummingbird.TokenStore.prototype.has = function(token) {
  if (!token) {
    return false;
  }
  if (token in this.root) {
    return true;
  } else {
    return false;
  }
};

hummingbird.TokenStore.prototype.get = function(token) {
  return this.root[token] || [];
};

hummingbird.TokenStore.prototype.count = function(token) {
  if (!token || !this.root[token]) {
    return 0;
  }
  return this.root[token].length;
};

hummingbird.TokenStore.prototype.remove = function(docRef) {
  return Object.keys(this.root).forEach((function(token) {
    var loc;
    loc = this.root[token].indexOf(docRef);
    if (loc === -1) {
      return;
    }
    this.root[token].splice(loc, 1);
    if (this.root[token].length === 0) {
      delete this.root[token];
    }
  }), this);
};

hummingbird.tokenizer = function(min, max) {
  this.utils = new hummingbird.Utils;
  if (!arguments.length || (min == null) || typeof min !== 'number' || min < 1) {
    this.min = 3;
  } else {
    this.min = min;
  }
  if (arguments.length < 2 || (max == null) || typeof max !== 'number' || max < min) {
    this.max = this.min;
  } else {
    this.max = max;
  }
};

hummingbird.tokenizer.prototype.tokenize = function(obj) {
  var alltokens, buffer, i, n, normalized_name, token;
  if (!arguments.length || (obj == null) || obj === undefined) {
    return [];
  }
  normalized_name = '\u0002' + this.utils.normalizeString(obj) + '\u0003';
  alltokens = [];
  n = this.min;
  while (n <= this.max) {
    buffer = [];
    if (normalized_name.length <= n && buffer.indexOf(normalized_name) === -1) {
      buffer.push(normalized_name);
    } else {
      i = 0;
      while (i <= normalized_name.length - n) {
        token = normalized_name.slice(i, i + n);
        if (buffer.indexOf(token) === -1) {
          buffer.push(token);
        }
        i++;
      }
    }
    alltokens = alltokens.concat(buffer);
    n++;
  }
  return alltokens;
};

hummingbird.VariantStore = function(variantsObj) {
  var key, normKey;
  this.variants = {};
  this.invertedVariants = {};
  this.utils = new hummingbird.Utils;
  if (variantsObj != null) {
    for (key in variantsObj) {
      normKey = this.utils.normalizeString(key);
      this.variants[normKey] = [];
      variantsObj[key].forEach((function(variant, i, variants) {
        var normVariant, _base;
        normVariant = this.utils.normalizeString(variant);
        this.variants[normKey].push(normVariant);
        if ((_base = this.invertedVariants)[normVariant] == null) {
          _base[normVariant] = [];
        }
        return this.invertedVariants[normVariant].push(normKey);
      }), this);
    }
  }
};

hummingbird.VariantStore.load = function(serializedData) {
  var store;
  store = new this;
  store.variants = serializedData.hasOwnProperty('variants') ? serializedData.variants : void 0;
  store.invertedVariants = serializedData.hasOwnProperty('invertedVariants') ? serializedData.invertedVariants : void 0;
  return store;
};

hummingbird.VariantStore.prototype.toJSON = function() {
  return {
    variants: this.variants,
    invertedVariants: this.invertedVariants
  };
};


/* ::add
Adds a new variant, document 'id' pair to the store
NO LONGER NECESSARY - ALL VARIANTS TOKENIZED AND STORED IN TOKENSTORE

hummingbird.VariantStore::add = (full_name, score, docId) ->
  norm_name = @utils.normalizeString full_name
   * first check to see if the norm_name has variants
  if @variants.hasOwnProperty norm_name
    @root[norm_name] ?=
      score: score
      docs: []
    @root[norm_name].docs.push docId

  if @invertedVariants.hasOwnProperty norm_name
     * associate the documents for each variant with the original norm_name
    @invertedVariants[norm_name].forEach ((variant, i, variantsArray) ->
      @root[variant] ?=
        score: score
        docs: []
      @root[variant].docs.push docId
    ), this

   * then split the full name on word boundaries and check each name part
  unless norm_name is norm_name.split(/\s+/)[0]
    norm_name.split(/\s+/).forEach ((name) ->
       * check to see if each name word has any nicknames/variants
      if @variants.hasOwnProperty name
        @root[name] ?=
          score: score
          docs: []
        @root[name].docs.push docId
      if @invertedVariants.hasOwnProperty name
         * associate the documents for each variant with the original norm_name
        @invertedVariants[name].forEach ((variant, i, variantsArray) ->
          @root[variant] ?=
            score: score
            docs: []
          @root[variant].docs.push docId
        ), this
    ), this
  return
 */


/* ::has
Checks whether this key is contained within this hummingbird.VariantStore.

hummingbird.VariantStore::has = (variant) ->
  norm_variant = @utils.normalizeString variant
  return false  unless norm_variant
  if norm_variant of @root
    return true
  else
    return false
  return
 */


/* ::get
Retrieve the documents for the given variant

hummingbird.VariantStore::get = (variant) ->
  @root[variant].docs or []
 */


/* ::count
Number of documents associated with the given variant

hummingbird.VariantStore::count = (variant) ->
  return 0  if not variant or not @root[variant]
  @root[variant].docs.length
 */


/* ::remove
Remove the document identified by docId from the variant in the store

hummingbird.VariantStore::remove = (docRef) ->
  Object.keys(this.root).forEach ((variant) ->
    loc = @root[variant].indexOf(docRef)
    return  if loc is -1
    @root[variant].splice loc, 1
    delete @root[variant]  if @root[variant].length is 0
    return
  ), this
 */
